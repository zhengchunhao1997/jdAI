"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export type ChatPanelMode = "full" | "embedded";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const starterQuestions = ["适合哪些企业？", "599元包含什么？", "多久上线？", "答不上怎么办？"];

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getUserId() {
  const key = "jidah_chat_user_id";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const next = createId("jidah_web");
  window.localStorage.setItem(key, next);
  return next;
}

function parseSse(buffer: string) {
  const blocks = buffer.split(/\n\n+/);

  return {
    rest: blocks.pop() ?? "",
    events: blocks
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

        try {
          return { event, data: dataText ? JSON.parse(dataText) : {} };
        } catch {
          return { event, data: { content: dataText } };
        }
      })
      .filter((item) => item.event),
  };
}

export function ChatPanel({
  mode = "embedded",
  initialQuestion,
}: {
  mode?: ChatPanelMode;
  initialQuestion?: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好，我是即答AI客服。你可以问价格、周期、场景，也可以直接说行业和咨询量。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);
  const userId = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return getUserId();
  }, []);

  const sendMessage = async (content: string) => {
    const text = content.trim();

    if (!text || loading) {
      return;
    }

    const assistantId = createId("assistant");
    setInput("");
    setError("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: createId("user"), role: "user", content: text },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("AI客服暂时没有响应，请稍后再试。");
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
        const parsed = parseSse(buffer);
        buffer = parsed.rest;

        for (const item of parsed.events) {
          if (item.event === "delta" && typeof item.data.content === "string") {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: `${message.content}${item.data.content}` }
                  : message,
              ),
            );
          }

          if (item.event === "error") {
            throw new Error(item.data.message || "AI客服暂时没有响应，请稍后再试。");
          }
        }
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "AI客服暂时没有响应，请稍后再试。";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId && !item.content
            ? { ...item, content: "这次连接没有成功。你可以稍后重试，或直接留下联系方式。" }
            : item,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (!initialQuestion || autoSentRef.current) {
      return;
    }

    autoSentRef.current = true;
    window.setTimeout(() => sendMessage(initialQuestion), 200);
  }, [initialQuestion]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const isFull = mode === "full";

  return (
    <section
      className={`flex min-h-0 flex-col bg-[#f7f8ff] text-brand-ink dark:bg-[#0f1024] dark:text-white ${
        isFull ? "h-full" : "h-[680px] max-h-[82vh] overflow-hidden rounded-2xl"
      }`}
    >
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#111227]/95">
        <div className="flex min-h-12 items-center justify-between gap-3 px-3 min-[380px]:px-4">
          <a href={isFull ? "/case" : "/chat"} className="flex min-w-0 items-center gap-2 font-black text-brand">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand text-xs text-white">
              答
            </span>
            <span className="truncate">即答AI客服</span>
          </a>
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            在线
          </span>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col px-3 pt-3 min-[380px]:px-4 ${isFull ? "pb-[7.25rem]" : "pb-3"}`}>
        <div className="mb-3 flex flex-wrap gap-2">
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(question)}
              className="min-h-9 rounded-full bg-white px-3 py-1.5 text-left text-xs font-bold leading-5 text-brand-ink transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 min-[420px]:text-sm"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 min-[420px]:text-base ${
                  message.role === "user"
                    ? "rounded-tr-md bg-brand text-white"
                    : "rounded-tl-md bg-white text-slate-800 dark:bg-white/10 dark:text-slate-100"
                }`}
              >
                {message.content || (
                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-300">
                    正在回复<span className="animate-pulse">...</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {error}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className={`border-t border-slate-200 bg-white/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur dark:border-white/10 dark:bg-[#0f1024]/96 min-[380px]:px-4 ${
          isFull ? "fixed inset-x-0 bottom-0 z-30" : ""
        }`}
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            placeholder="例如：我做女装电商适合吗？"
            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 shrink-0 rounded-xl bg-brand px-5 font-black text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            发送
          </button>
        </div>
      </form>
    </section>
  );
}
