import { ArrowRight, Clock, Target, Headphones, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMockup } from "@/components/chat-mockup"
import Link from "next/link"

const metrics = [
  { icon: Clock, label: "7x24 小时自动接待" },
  { icon: Target, label: "自动识别高意向线索" },
  { icon: Headphones, label: "复杂问题转人工" },
  { icon: BookOpen, label: "未命中问题沉淀知识库" },
]

export function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-20">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              面向商家的 AI 售前客服助手
            </span>

            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              让 AI 先接待客户，把值得跟进的人交给销售
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              即答 AI客服基于企业知识库回答客户咨询，自动识别高意向线索，遇到报价、合同、退款、投诉和复杂接入时转人工，帮助商家减少漏单和重复回复。
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/chat">
                立即体验
                <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border bg-transparent text-foreground">
                <Link href="/login?redirect=/dashboard">
                查看控制台
                </Link>
              </Button>
            </div>

            <dl className="mt-9 grid gap-4 sm:grid-cols-2 sm:gap-x-6">
              {metrics.map((m) => (
                <div key={m.label} className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <m.icon className="size-4" />
                  </span>
                  <dt className="min-w-0 text-sm font-medium leading-snug text-foreground">{m.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 lg:pl-4">
            <ChatMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
