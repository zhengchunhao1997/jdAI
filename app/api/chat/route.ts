import { NextResponse } from "next/server";

type ChatPayload = {
  message?: string;
  userId?: string;
};

const COZE_API_URL = "https://api.coze.cn/v3/chat";
const BOT_ID = "7647543972197892159";

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function extractDelta(eventName: string, data: unknown) {
  if (!eventName.includes("delta")) {
    return "";
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const payload = data as {
    content?: unknown;
    type?: unknown;
    role?: unknown;
    message?: { content?: unknown; type?: unknown; role?: unknown };
  };

  const message = payload.message ?? payload;
  const content = message.content;
  const type = message.type;

  if (typeof content !== "string" || !content) {
    return "";
  }

  if (type === "answer") {
    return content;
  }

  return "";
}

export async function POST(request: Request) {
  let payload: ChatPayload;

  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const message = payload.message?.trim();

  if (!message) {
    return NextResponse.json({ message: "Missing message" }, { status: 400 });
  }

  const token = process.env.COZE_API_TOKEN || process.env.NEXT_PUBLIC_COZE_PAT;

  if (!token) {
    return NextResponse.json({ message: "Missing Coze token" }, { status: 500 });
  }

  const userId = payload.userId || `jidah_web_${Date.now()}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await fetch(COZE_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bot_id: BOT_ID,
            user_id: userId,
            stream: true,
            additional_messages: [
              {
                content: message,
                content_type: "text",
                role: "user",
                type: "question",
              },
            ],
            parameters: {},
          }),
        });

        if (!response.ok || !response.body) {
          const errorText = await response.text();
          controller.enqueue(
            encoder.encode(
              sse("error", {
                message: "Coze API request failed",
                status: response.status,
                detail: errorText.slice(0, 300),
              }),
            ),
          );
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split(/\n\n+/);
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            const lines = block.split(/\r?\n/);
            const eventName =
              lines
                .find((line) => line.startsWith("event:"))
                ?.slice("event:".length)
                .trim() || "message";
            const dataText = lines
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice("data:".length).trim())
              .join("\n");

            if (!dataText || dataText === "[DONE]") {
              continue;
            }

            try {
              const data = JSON.parse(dataText);
              const delta = extractDelta(eventName, data);

              if (delta) {
                controller.enqueue(encoder.encode(sse("delta", { content: delta })));
              }

              if (eventName.includes("completed") || eventName.includes("done")) {
                controller.enqueue(encoder.encode(sse("done", {})));
              }
            } catch {
              // Ignore non-JSON stream control payloads from Coze.
            }
          }
        }

        controller.enqueue(encoder.encode(sse("done", {})));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            sse("error", {
              message: error instanceof Error ? error.message : "Chat request failed",
            }),
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
