"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import { ArrowLeft, Bot, CheckCircle2, Loader2, Send, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const starterQuestions = ["165，160斤，想瘦到120", "什么价格？", "会不会反弹？"]

function resolveApiPath(path: string) {
  if (apiBaseUrl) return `${apiBaseUrl}${path}`
  return path
}

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
  suggestedQuestions?: string[]
}

type ChatResponse = {
  conversation_id: string
  answer: string
  suggested_questions?: string[]
}

type VisitorProfile = {
  userId: string
  nickname: string
}

export default function XiaolanmaoChatPage() {
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile>(() => createVisitorProfile())
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "你好，我是小蓝帽 AI 体重管理顾问。你可以直接说身高、体重和目标体重，我会先判断适合怎么咨询；也可以问价格、效果、安全和反弹问题。",
      suggestedQuestions: starterQuestions,
    },
  ])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages, pending])

  async function sendMessage(text: string) {
    const content = text.trim()
    if (!content || pending) return

    const currentVisitor = createVisitorProfile()
    setVisitorProfile(currentVisitor)
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content }])
    setInput("")
    setPending(true)
    setError(null)

    try {
      const response = await fetch(resolveApiPath("/xiaolanmao-chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: currentVisitor.nickname,
          user_id: currentVisitor.userId,
          user_message: content,
        }),
      })

      if (!response.ok) throw new Error(`请求失败：${response.status}`)

      const result = (await response.json()) as ChatResponse
      setConversationId(result.conversation_id)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          suggestedQuestions: result.suggested_questions?.length
            ? result.suggested_questions
            : ["我适合买几套？", "效果一般多久能看到？", "可以转人工下单吗？"],
        },
      ])
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "发送失败，请稍后再试")
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "抱歉，刚才没有成功连接小蓝帽客服工作流。你可以稍后再试，或直接联系人工顾问。",
        },
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
    <main className="flex h-[100dvh] w-full bg-gray-100 text-gray-900">
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
              <ChatBubble key={message.id} message={message} disabled={pending} onSuggestionClick={sendMessage} />
            ))}

            {pending && (
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
            <div className="flex gap-2 overflow-x-auto pb-3">
              {starterQuestions.map((question) => (
                <button
                  className="whitespace-nowrap rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                  disabled={pending}
                  key={question}
                  onClick={() => void sendMessage(question)}
                  type="button"
                >
                  {question}
                </button>
              ))}
            </div>
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <input
                className="h-11 min-w-0 flex-1 rounded-full border border-transparent bg-gray-50 px-4 text-base outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15 md:text-sm"
                disabled={pending}
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

          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <p className="text-sm font-semibold text-indigo-700">演示提示</p>
            <p className="mt-1 text-sm leading-6 text-indigo-700">建议先发“165，160斤，想瘦到120”，再追问价格或反弹。</p>
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
  disabled,
  message,
  onSuggestionClick,
}: {
  disabled: boolean
  message: ChatMessage
  onSuggestionClick: (question: string) => Promise<void>
}) {
  const isUser = message.role === "user"
  const showSuggestions = !isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0

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
          {message.content}
        </div>
        {showSuggestions && (
          <div className="flex w-full flex-wrap gap-2">
            {message.suggestedQuestions?.slice(0, 3).map((question) => (
              <button
                className="min-h-9 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-left text-xs leading-snug text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                disabled={disabled}
                key={question}
                onClick={() => void onSuggestionClick(question)}
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        )}
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
