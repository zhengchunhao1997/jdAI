import { TrendingUp, TrendingDown } from "lucide-react"
import { metrics } from "@/lib/dashboard-data"

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{m.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">{m.value}</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                m.trendUp ? "text-primary" : "text-destructive"
              }`}
            >
              {m.trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {m.trend}
            </span>
            <span className="text-muted-foreground">{m.hint}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
