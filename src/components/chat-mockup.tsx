import { Bot, User, Tag, ArrowUpRight, Clock } from "lucide-react"

export function ChatMockup() {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-foreground/[0.06]">
      {/* 顶部窗口栏 */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-3.5" />
          </span>
          <span className="text-sm font-medium text-foreground">在线咨询 · 即答 AI客服</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          AI 接待中
        </span>
      </div>

      <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_240px]">
        {/* 聊天区 */}
        <div className="flex min-w-0 flex-col gap-4 p-4">
          <div className="flex justify-end">
            <div className="max-w-[86%] rounded-lg rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground [overflow-wrap:anywhere] sm:max-w-[80%]">
              你们的企业版可以接入企业微信吗？大概多少钱？
            </div>
          </div>

          <div className="flex min-w-0 gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Bot className="size-4" />
            </span>
            <div className="max-w-[86%] rounded-lg rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere] sm:max-w-[80%]">
              企业版支持企业微信、网站、小程序等多渠道接入，可统一管理会话。具体报价会根据坐席数量和接入渠道有所不同，已为你转接销售提供准确方案。
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span className="truncate">涉及报价，已通知人工接管</span>
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
            <span className="text-sm text-muted-foreground">输入消息…</span>
          </div>
        </div>

        {/* 客户画像 */}
        <div className="min-w-0 border-t border-border bg-secondary/30 p-4 md:border-l md:border-t-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-foreground/5 text-foreground">
              <User className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">访客 #2048</p>
              <p className="text-xs text-muted-foreground">来自官网咨询</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">意向等级</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">高意向</span>
            </div>

            <div>
              <p className="mb-1.5 text-muted-foreground">标签</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs text-foreground ring-1 ring-border">
                  <Tag className="size-3 text-primary" />
                  关注价格
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs text-foreground ring-1 ring-border">
                  <Tag className="size-3 text-primary" />
                  企业微信接入
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-2.5">
              <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                <ArrowUpRight className="size-3.5 text-primary" />
                建议动作
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">销售今天内跟进，提供企业版报价</p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">状态</span>
              <span className="text-xs font-medium text-foreground">待人工接管</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
