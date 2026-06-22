import { CircleHelp, Plus } from "lucide-react"
import { missedQuestions } from "@/lib/dashboard-data"

export function MissedQuestions() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <CircleHelp className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">未命中问题</h2>
            <p className="text-sm text-muted-foreground">沉淀进知识库以提升解决率</p>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {missedQuestions.map((q) => (
          <li key={q.question} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-card-foreground">{q.question}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                出现 {q.count} 次 · {q.category} · 建议：{q.suggestion}
              </p>
            </div>
            <button className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-card-foreground hover:bg-secondary">
              <Plus className="h-3.5 w-3.5" />
              补充答案
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
