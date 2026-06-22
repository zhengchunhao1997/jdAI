import { Check } from "lucide-react"

const tabs = ["会话列表", "客户线索", "待人工接管", "未命中问题", "数据看板"]

const conversations = [
  { name: "访客 #2048", msg: "企业版可以接入企业微信吗？", level: "高意向", status: "待接管", levelColor: true },
  { name: "访客 #2047", msg: "课程的退款规则是怎样的？", level: "中意向", status: "AI 已答", levelColor: false },
  { name: "访客 #2045", msg: "你们在上海有线下门店吗？", level: "低意向", status: "AI 已答", levelColor: false },
  { name: "访客 #2043", msg: "想了解一下财税代理的套餐", level: "高意向", status: "已留资", levelColor: true },
]

const stats = [
  { label: "今日会话", value: "1,284", delta: "+12.4%" },
  { label: "AI 解决率", value: "86.5%", delta: "+3.1%" },
  { label: "高意向线索", value: "92", delta: "+18" },
  { label: "平均响应", value: "1.2s", delta: "-0.3s" },
]

export function DashboardSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">后台管理</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground">
            会话、线索、数据，一个后台管清楚
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            商家和销售在统一后台查看会话列表、客户线索、待人工接管和未命中问题，并通过数据看板掌握整体效果。
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-foreground/[0.04]">
          {/* 数据看板 */}
          <div className="grid grid-cols-2 gap-px border-b border-border bg-border lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className="mt-1.5 flex items-end gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">{s.value}</span>
                  <span className="mb-0.5 text-xs font-medium text-primary">{s.delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border px-4 py-2.5">
            {tabs.map((t, i) => (
              <span
                key={t}
                className={
                  i === 0
                    ? "rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-foreground"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground"
                }
              >
                {t}
              </span>
            ))}
          </div>

          {/* 会话列表 */}
          <div className="divide-y divide-border">
            {conversations.map((c) => (
              <div key={c.name} className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{c.msg}</p>
                </div>
                <span
                  className={
                    c.levelColor
                      ? "shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                      : "shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {c.level}
                </span>
                <span className="hidden w-20 shrink-0 text-right text-xs font-medium text-muted-foreground sm:flex sm:items-center sm:justify-end sm:gap-1">
                  {c.status === "AI 已答" && <Check className="size-3 text-primary" />}
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
