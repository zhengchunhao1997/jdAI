import { ArrowRight, MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CtaSection() {
  return (
    <section id="cta" className="scroll-mt-16 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center md:px-12 md:py-16">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessagesSquare className="size-6" />
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            先接入网站聊天窗口，体验 AI 售前客服效果
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            上传一份知识库，几分钟即可让 AI 接管你的售前咨询。先在网站试用，再逐步接入企业微信和更多渠道。
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessagesSquare className="size-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">即答 AI客服</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 即答 AI客服. 保留所有权利.</p>
      </div>
    </footer>
  )
}
