const DEFAULT_WORKFLOW_ID = "7653456639388303412";
const DEFAULT_API_BASE_URL = "https://api.coze.cn";
const SUGGESTED_QUESTIONS = ["我适合买几套？", "多久能看到效果？", "可以转人工下单吗？"];

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const nickname = normalizeString(body.nickname) || "测试客户";
    const userId = normalizeString(body.user_id) || `xlm_${Date.now()}`;
    const userMessage = normalizeString(body.user_message);

    if (!userMessage) {
      return json({ message: "Missing user_message" }, 400);
    }

    const token = context.env.COZE_XIAOLANMAO_API_TOKEN || context.env.COZE_API_TOKEN;
    if (!token) {
      return json({ message: "Missing Coze token" }, 500);
    }

    const workflowId = context.env.COZE_XIAOLANMAO_WORKFLOW_ID || DEFAULT_WORKFLOW_ID;
    const apiBaseUrl = context.env.COZE_XIAOLANMAO_API_BASE_URL || DEFAULT_API_BASE_URL;
    const response = await fetch(`${apiBaseUrl}/v1/workflow/stream_run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: {
          nickname,
          user_id: userId,
          user_message: userMessage,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return json(
        {
          message: "Coze workflow request failed",
          status: response.status,
          detail: detail.slice(0, 500),
        },
        502,
      );
    }

    const parsed = await parseCozeResponse(response);
    if (!parsed.answer) {
      return json(
        {
          message: "Coze workflow returned empty output",
          raw: parsed.raw,
        },
        502,
      );
    }

    return json({
      conversation_id: userId,
      answer: parsed.answer,
      suggested_questions: SUGGESTED_QUESTIONS,
    });
  } catch (error) {
    return json(
      {
        message: error instanceof Error ? error.message : "Chat request failed",
      },
      500,
    );
  }
}

export function onRequest() {
  return json({ message: "Method not allowed" }, 405);
}

async function parseCozeResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return { answer: normalizeWorkflowAnswer(extractWorkflowText(payload)), raw: payload };
  }

  const text = await response.text();
  const events = parseSseEvents(text);
  const answer = normalizeWorkflowAnswer(events.map((event) => extractWorkflowText(event.data)).join(""));
  return { answer, raw: events };
}

function parseSseEvents(text) {
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      const event =
        lines
          .find((line) => line.startsWith("event:"))
          ?.slice("event:".length)
          .trim() || "message";
      const dataText = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trim())
        .join("\n");

      let data = dataText;
      if (dataText && dataText !== "[DONE]") {
        try {
          data = JSON.parse(dataText);
        } catch {
          data = dataText;
        }
      }

      return { event, data };
    });
}

function extractWorkflowText(data) {
  if (typeof data === "string") {
    if (!data || data === "[DONE]") return "";
    return extractAnswerContent(data);
  }

  if (!data || typeof data !== "object") return "";

  for (const key of ["answer", "output", "content", "text", "reply"]) {
    if (typeof data[key] === "string") return extractAnswerContent(data[key]);
  }

  if (typeof data.data === "string") return extractAnswerContent(data.data);
  if (data.data && typeof data.data === "object") return extractWorkflowText(data.data);

  return "";
}

function extractAnswerContent(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") {
      for (const key of ["answer", "output", "reply", "content", "text"]) {
        if (typeof parsed[key] === "string") return parsed[key];
      }
    }
  } catch {
    return content;
  }

  return content;
}

function normalizeWorkflowAnswer(value) {
  return String(value || "")
    .replace(/\{"msg_type":"generate_answer_finish"[\s\S]*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
