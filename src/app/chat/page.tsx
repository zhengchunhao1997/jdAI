"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import { ArrowLeft, Bot, Loader2, Send, ShieldCheck, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

function resolveApiPath(path: string) {
  if (apiBaseUrl) return `${apiBaseUrl}${path}`
  return path.replace(/^\/api\//, "/backend/")
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
  need_handoff?: boolean
}

export default function ChatPage() {
  const [visitorId, setVisitorId] = useState("website-preview")
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好，我是即答 AI客服。你可以问我产品能力、接入方式、价格方案或人工接管流程。",
      suggestedQuestions: ["你们这个系统是做什么的？", "可以接入网站和企业微信吗？", "如果客户问价格会怎么处理？"],
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

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }
    const currentVisitorId = createVisitorId()

    setVisitorId(currentVisitorId)
    setMessages((current) => [...current, userMessage])
    setInput("")
    setPending(true)
    setError(null)

    try {
      const response = await fetch(resolveApiPath("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: currentVisitorId,
          message: content,
          channel: "website",
        }),
      })

      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`)
      }

      const result = (await response.json()) as ChatResponse
      setConversationId(result.conversation_id)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
          suggestedQuestions: result.suggested_questions,
        },
      ])
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "发送失败，请稍后再试")
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "抱歉，刚才没有成功连接客服工作流。你可以稍后再试，或留下联系方式让顾问跟进。",
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
    <main className="min-h-[100dvh] bg-background text-foreground sm:px-4 sm:py-5">
      <div className="mx-auto flex h-[100dvh] max-w-6xl flex-col sm:h-[calc(100dvh-2.5rem)] sm:gap-5">
        <div className="hidden items-center justify-between sm:flex">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/">
            <ArrowLeft size={16} />
            返回产品页
          </Link>
          <Link className="text-sm font-semibold text-primary hover:text-primary-strong" href="/login?redirect=/dashboard">
            后台管理
          </Link>
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-line bg-surface sm:rounded-xl sm:border sm:subtle-shadow">
          <div className="grid gap-3 border-b border-line bg-surface-muted px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-3">
              <Link
                aria-label="返回产品页"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground sm:hidden"
                href="/"
              >
                <ArrowLeft size={17} />
              </Link>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold">即答 AI客服体验</h1>
                <p className="truncate text-sm text-muted-foreground">客户可直接体验真实售前接待。</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground md:flex">
              <ShieldCheck className="size-4 text-primary" />
              Token 由服务端代理保护
            </div>
          </div>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_300px]">
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:p-6">
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} disabled={pending} onSuggestionClick={sendMessage} />
                ))}

                {pending && (
                  <div className="flex min-w-0 gap-2.5">
                    <Avatar role="assistant" />
                    <div className="inline-flex min-h-10 items-center rounded-lg rounded-tl-sm bg-secondary px-3.5 py-2.5 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-label="正在回复" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-line bg-background p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4">
                <form className="flex gap-2" onSubmit={handleSubmit}>
                  <input
                    className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15 sm:h-11 sm:text-sm"
                    disabled={pending}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="输入你想咨询的问题"
                    value={input}
                  />
                  <Button className="h-12 px-4 sm:h-10" disabled={pending || !input.trim()} type="submit">
                    <Send className="size-4" />
                    <span className="hidden sm:inline">发送</span>
                  </Button>
                </form>

                {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
              </div>
            </div>

            <aside className="hidden overflow-y-auto border-t border-line bg-secondary/30 p-5 lg:block lg:border-l lg:border-t-0">
              <p className="text-sm font-semibold text-foreground">体验信息</p>
              <div className="mt-4 space-y-3 text-sm">
                <InfoRow label="访客 ID" value={visitorId} />
                <InfoRow label="会话 ID" value={conversationId ?? "等待首轮对话"} />
                <InfoRow label="接待渠道" value="官网 website" />
                <InfoRow label="工作流" value="快速回答工作流" />
              </div>

              <div className="mt-5 rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-medium text-foreground">后台会同步什么</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  每次咨询都会写入会话记录，AI 回复会进入消息表，后续 Worker 会异步提取线索、摘要、未命中问题和质检结果。
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
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
    <div className={`flex min-w-0 gap-2.5 ${isUser ? "justify-end" : ""}`}>
      {!isUser && <Avatar role="assistant" />}
      <div className={`flex max-w-[86%] min-w-0 flex-col gap-2 sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-secondary text-foreground"
          }`}
        >
          {message.content}
        </div>
        {showSuggestions && (
          <div className="grid w-full gap-2">
            {message.suggestedQuestions?.slice(0, 3).map((question) => (
              <button
                className="min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs leading-snug text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
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
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted-foreground">
        <UserRound className="size-4" />
      </span>
    )
  }

  return (
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_3px_oklch(0.95_0.03_175)]">
      <Bot className="size-4" />
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function createVisitorId() {
  if (typeof window === "undefined") return "website-preview"

  const key = "jidah_visitor_id"
  const existing = window.localStorage.getItem(key)
  if (existing) return existing

  const next = `web-${crypto.randomUUID().slice(0, 8)}`
  window.localStorage.setItem(key, next)
  return next
}
