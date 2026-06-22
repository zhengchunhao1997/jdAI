import { sessionTrend, channelLeads } from "@/lib/dashboard-data"

export function TrendPanel() {
  const max = Math.max(...sessionTrend.map((d) => d.value))
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">今日会话趋势</h2>
            <p className="text-sm text-muted-foreground">AI 解决率 86.5% · 较昨日 +3.1%</p>
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">今日</span>
        </div>
        <div className="mt-6 flex h-44 items-end justify-between gap-2">
          {sessionTrend.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full justify-center">
                <div
                  className="w-full max-w-[36px] rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${(d.value / max) * 150}px` }}
                  title={`${d.value} 次会话`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-card-foreground">高意向线索来源</h2>
        <p className="text-sm text-muted-foreground">本日 · 共 92 条</p>
        <ul className="mt-5 space-y-4">
          {channelLeads.map((c) => (
            <li key={c.channel}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-card-foreground">{c.channel}</span>
                <span className="text-muted-foreground">{c.value} 条</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
