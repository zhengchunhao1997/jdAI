import { Phone, Sparkles, ArrowRight, Tag } from "lucide-react"
import type { Session } from "@/lib/dashboard-data"
import { IntentBadge, StatusBadge } from "./badges"
import { Button } from "@/components/ui/button"

export function SessionDetail({ session }: { session: Session }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-card-foreground">客户画像与 AI 分析</h2>
        <p className="text-sm text-muted-foreground">选中会话的实时洞察</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">访客 ID</span>
          <span className="text-sm font-medium text-card-foreground">{session.visitor}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">来源渠道</span>
          <span className="text-sm font-medium text-card-foreground">{session.channel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">意向等级</span>
          <IntentBadge intent={session.intent} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">当前状态</span>
          <StatusBadge status={session.status} />
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            关注点标签
          </p>
          <div className="flex flex-wrap gap-2">
            {session.focus.map((f) => (
              <span
                key={f}
                className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">会话摘要</p>
          <p className="text-sm leading-relaxed text-card-foreground">{session.summary}</p>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI 建议动作
          </p>
          <p className="text-sm leading-relaxed text-card-foreground">{session.suggestion}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-card-foreground">是否需要人工跟进</p>
            <p className="text-xs text-muted-foreground">联系方式：{session.contact}</p>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              session.needHuman
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {session.needHuman ? "需要" : "暂不需要"}
          </span>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <Phone className="mr-1.5 h-4 w-4" />
            分配跟进
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            查看完整对话
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
