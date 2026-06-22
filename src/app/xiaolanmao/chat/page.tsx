"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import { ArrowLeft, Bot, CheckCircle2, Loader2, Send, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

function resolveApiPath(path: string) {
  if (apiBaseUrl) return `${apiBaseUrl}${path}`
  return path
}

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
}

type VisitorProfile = {
  userId: string
  nickname: string
}

export default function XiaolanmaoChatPage() {
  const [visitorProfile] = useState<VisitorProfile>(() => createVisitorProfile())
  const [viewportHeight, setViewportHeight] = useState("100dvh")
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "你好，我是小蓝帽 AI 体重管理顾问。你可以直接说身高、体重和目标体重，我会先判断适合怎么咨询；也可以问价格、效果、安全和反弹问题。",
    },
  ])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages, pending])

  useEffect(() => {
    function updateViewportHeight() {
      const height = window.visualViewport?.height ?? window.innerHeight
      setViewportHeight(`${Math.round(height)}px`)
    }

    updateViewportHeight()
    window.visualViewport?.addEventListener("resize", updateViewportHeight)
    window.visualViewport?.addEventListener("scroll", updateViewportHeight)
    window.addEventListener("resize", updateViewportHeight)

    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportHeight)
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight)
      window.removeEventListener("resize", updateViewportHeight)
    }
  }, [])

  async function sendMessage(text: string) {
    const content = text.trim()
    if (!content || pending) return

    const currentVisitor = visitorProfile
    const assistantMessageId = crypto.randomUUID()

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content },
      { id: assistantMessageId, role: "assistant", content: "" },
    ])
    setInput("")
    setPending(true)
    setError(null)

    try {
      const response = await fetch(resolveApiPath("/xiaolanmao-chat"), {
        method: "POST",
        headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: currentVisitor.nickname,
          user_id: currentVisitor.userId,
          user_message: content,
        }),
      })

      if (!response.ok) throw new Error(`请求失败：${response.status}`)
      let receivedAnswer = false
      receivedAnswer = await readChatStream(response, {
        onMeta: (conversationId) => setConversationId(conversationId),
        onDelta: (delta) => {
          receivedAnswer = true
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId ? { ...message, content: `${message.content}${delta}` } : message,
            ),
          )
        },
      })

      if (!receivedAnswer) {
        const fallback = await fetch(resolveApiPath("/xiaolanmao-chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: currentVisitor.nickname,
            user_id: currentVisitor.userId,
            user_message: content,
          }),
        })

        if (!fallback.ok) throw new Error(`请求失败：${fallback.status}`)

        const result = (await fallback.json()) as { conversation_id?: string; answer?: string }
        if (result.conversation_id) setConversationId(result.conversation_id)
        if (result.answer) {
          receivedAnswer = true
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId ? { ...message, content: result.answer ?? "" } : message,
            ),
          )
        }
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId && !message.content
            ? { ...message, content: "我已收到你的问题，正在整理回答。" }
            : message,
        ),
      )
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "发送失败，请稍后再试")
      setMessages((current) => [
        ...current.filter((message) => message.id !== assistantMessageId),
        { id: assistantMessageId, role: "assistant", content: "抱歉，刚才没有成功连接小蓝帽客服工作流。你可以稍后再试，或直接联系人工顾问。" },
      ])
    } finally {
      setPending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  return (
    <main className="flex w-full overflow-hidden bg-gray-100 text-gray-900" style={{ height: viewportHeight }}>
      <section className="flex flex-1 justify-center bg-gray-100">
        <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
          <div className="z-10 flex h-14 shrink-0 items-center bg-indigo-600 px-4 text-white">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Link
                aria-label="返回即答官网"
                className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-indigo-700"
                href="/"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-indigo-600 bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-medium">小蓝帽 AI 体重管理顾问</h1>
                <p className="text-xs text-indigo-100">在线</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {pending && messages.at(-1)?.role !== "assistant" && (
              <div className="flex max-w-[85%] gap-2">
                <Avatar role="assistant" />
                <div className="rounded-2xl rounded-tl-none border border-gray-100 bg-white p-3 text-gray-500 shadow-sm">
                  <Loader2 className="size-4 animate-spin" aria-label="正在回复" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <input
                className="h-11 min-w-0 flex-1 rounded-full border border-transparent bg-gray-50 px-4 text-base outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15 md:text-sm"
                disabled={pending}
                onFocus={() => window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ block: "end" }), 80)}
                onChange={(event) => setInput(event.target.value)}
                placeholder="输入您的问题..."
                value={input}
              />
              <Button
                aria-label="发送消息"
                className="size-11 rounded-full"
                disabled={pending || !input.trim()}
                size="icon"
                type="submit"
              >
                <Send className="size-4" />
              </Button>
            </form>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </section>

      <aside className="hidden w-80 flex-col border-l border-gray-200 bg-white lg:flex">
        <div className="border-b border-gray-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShieldCheck className="text-indigo-500" /> 演示信息
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            这是即答 AI 客服在 C 端用户视角的真实体验界面。
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">当前模拟用户</h3>
            <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
              <InfoRow label="产品" value="小蓝帽" />
              <InfoRow label="昵称" value={visitorProfile.nickname} />
              <InfoRow label="用户 ID" value={visitorProfile.userId} />
              <InfoRow label="会话" value={conversationId ?? "等待首轮对话"} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">可演示能力</h3>
            <ul className="space-y-2">
              <CapabilityItem text="收集身高、体重、目标" />
              <CapabilityItem text="回答价格、效果、安全顾虑" />
              <CapabilityItem text="识别高意向并引导人工承接" />
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <Button asChild variant="outline" className="w-full bg-white">
            <Link href="/dashboard">返回控制台</Link>
          </Button>
        </div>
      </aside>
    </main>
  )
}

function ChatBubble({
  message,
}: {
  message: ChatMessage
}) {
  const isUser = message.role === "user"

  return (
    <div className={`flex max-w-[85%] gap-2 ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
      {!isUser && <Avatar role="assistant" />}
      <div className={`flex min-w-0 flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl p-3 text-sm leading-relaxed shadow-sm [overflow-wrap:anywhere] ${
            isUser
              ? "rounded-tr-none bg-indigo-500 text-white"
              : "rounded-tl-none border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {message.content || (
            <span className="inline-flex items-center gap-2 text-gray-500">
              <Loader2 className="size-3.5 animate-spin" />
              正在回复
            </span>
          )}
        </div>
      </div>
      {isUser && <Avatar role="user" />}
    </div>
  )
}

function Avatar({ role }: { role: ChatMessage["role"] }) {
  if (role === "user") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <UserRound className="size-4" />
      </span>
    )
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
      <Bot className="size-4" />
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 truncate font-medium text-gray-900">{value}</span>
    </div>
  )
}

function CapabilityItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
      <span>{text}</span>
    </li>
  )
}

async function readChatStream(
  response: Response,
  handlers: {
    onMeta: (conversationId: string) => void
    onDelta: (delta: string) => void
  },
): Promise<boolean> {
  const contentType = response.headers.get("Content-Type") ?? ""
  let receivedAnswer = false

  if (!contentType.includes("text/event-stream")) {
    const result = (await response.json()) as { conversation_id?: string; answer?: string }
    if (result.conversation_id) handlers.onMeta(result.conversation_id)
    if (result.answer) {
      handlers.onDelta(result.answer)
      receivedAnswer = true
    }
    return receivedAnswer
  }

  const reader = response.body?.getReader()
  if (!reader) {
    const text = await response.text()
    return parseStreamText(text, handlers)
  }

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\n\n+/)
    buffer = blocks.pop() ?? ""

    for (const block of blocks) {
      receivedAnswer = handleStreamBlock(block, handlers) || receivedAnswer
    }
  }

  if (buffer.trim()) {
    receivedAnswer = handleStreamBlock(buffer, handlers) || receivedAnswer
  }

  return receivedAnswer
}

function parseStreamText(
  text: string,
  handlers: {
    onMeta: (conversationId: string) => void
    onDelta: (delta: string) => void
  },
) {
  let receivedAnswer = false
  const blocks = text.split(/\n\n+/)

  for (const block of blocks) {
    receivedAnswer = handleStreamBlock(block, handlers) || receivedAnswer
  }

  return receivedAnswer
}

function handleStreamBlock(
  block: string,
  handlers: {
    onMeta: (conversationId: string) => void
    onDelta: (delta: string) => void
  },
) {
  const lines = block.split(/\r?\n/)
  const event =
    lines
      .find((line) => line.startsWith("event:"))
      ?.slice("event:".length)
      .trim() || "message"
  const dataText = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim())
    .join("\n")

  if (!dataText || dataText === "[DONE]") return

  let data: { content?: string; conversation_id?: string; message?: string } = {}
  try {
    data = JSON.parse(dataText)
  } catch {
    data = { content: dataText }
  }

  if (event === "meta" && data.conversation_id) handlers.onMeta(data.conversation_id)
  if (event === "delta" && data.content) {
    handlers.onDelta(data.content)
    return true
  }
  if (event === "error") throw new Error(data.message ?? "流式回复失败")

  return false
}

function createVisitorProfile(): VisitorProfile {
  if (typeof window === "undefined") {
    return { userId: "xiaolanmao-preview", nickname: "测试客户" }
  }

  const key = "xiaolanmao_visitor_profile"
  const existing = window.localStorage.getItem(key)
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as VisitorProfile
      if (parsed.userId && parsed.nickname) return parsed
    } catch {
      window.localStorage.removeItem(key)
    }
  }

  const suffix = crypto.randomUUID().slice(0, 8)
  const next = {
    userId: `xlm_${suffix}`,
    nickname: `测试客户_${suffix.slice(0, 4)}`,
  }
  window.localStorage.setItem(key, JSON.stringify(next))
  return next
}
