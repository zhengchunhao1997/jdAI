import { NextResponse } from "next/server";

type ChatPayload = {
  message?: string;
  userId?: string;
};

const COZE_CHAT_API_URL = "https://api.coze.cn/v3/chat";
const DEFAULT_WORKFLOW_INPUT_KEY = "USER_INPUT";

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function parseJsonMaybe(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractChatDelta(eventName: string, data: unknown): string {
  if (!eventName.includes("delta") || !data || typeof data !== "object") {
    return "";
  }

  const payload = data as {
    content?: unknown;
    type?: unknown;
    message?: { content?: unknown; type?: unknown };
  };
  const message = payload.message ?? payload;

  if (message.type !== "answer" || typeof message.content !== "string") {
    return "";
  }

  return message.content;
}

function isChatDone(eventName: string) {
  return eventName.includes("completed") || eventName.includes("done");
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

  const token = process.env.COZE_API_TOKEN;
  const workflowId = process.env.COZE_WORKFLOW_ID;
  const workflowInputKey = process.env.COZE_WORKFLOW_INPUT_KEY || DEFAULT_WORKFLOW_INPUT_KEY;
  const botId = process.env.COZE_BOT_ID;
  const conversationName = process.env.COZE_CONVERSATION_NAME || "Default";

  if (!token) {
    return NextResponse.json({ message: "Missing Coze token" }, { status: 500 });
  }

  if (!workflowId) {
    return NextResponse.json({ message: "Missing COZE_WORKFLOW_ID" }, { status: 500 });
  }

  if (!botId) {
    return NextResponse.json({ message: "Missing COZE_BOT_ID" }, { status: 500 });
  }

  const userId = payload.userId || `jidah_web_${Date.now()}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const requestBody = {
          bot_id: botId,
          workflow_id: workflowId,
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
          parameters: {
            CONVERSATION_NAME: conversationName,
            [workflowInputKey]: message,
          },
        };

        const response = await fetch(COZE_CHAT_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
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
              const data = parseJsonMaybe(dataText);

              const normalizedEventName = eventName.toLowerCase();

              if (normalizedEventName.includes("error") || normalizedEventName.includes("failed")) {
                controller.enqueue(
                  encoder.encode(
                    sse("error", {
                      message: "Coze workflow error",
                      detail: data,
                    }),
                  ),
                );
                continue;
              }

              if (normalizedEventName.includes("delta")) {
                const content = extractChatDelta(eventName, data);

                if (content) {
                  controller.enqueue(encoder.encode(sse("delta", { content })));
                }
              }

              if (isChatDone(eventName)) {
                controller.enqueue(encoder.encode(sse("done", {})));
              }
            } catch {
              // Ignore malformed stream control payloads from Coze.
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
