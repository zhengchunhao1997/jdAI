import { Headset, ArrowRight } from "lucide-react"
import { handoffReasons } from "@/lib/dashboard-data"

export function HandoffPanel() {
  const total = handoffReasons.reduce((sum, r) => sum + r.count, 0)
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Headset className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">待人工接管</h2>
            <p className="text-sm text-muted-foreground">共 {total} 个会话等待处理</p>
          </div>
        </div>
        <a href="#" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          全部
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <ul className="divide-y divide-border">
        {handoffReasons.map((r) => (
          <li key={r.reason} className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-card-foreground">
              <span
                className={`h-2 w-2 rounded-full ${r.tone === "high" ? "bg-destructive" : "bg-amber-500"}`}
              />
              {r.reason}
            </span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {r.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
