"use client"

import { Search, Filter } from "lucide-react"
import type { Session } from "@/lib/dashboard-data"
import { IntentBadge, StatusBadge } from "./badges"

export function SessionTable({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: Session[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">会话管理</h2>
          <p className="text-sm text-muted-foreground">实时接待与人工跟进队列</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="搜索访客 / 问题"
              className="w-32 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-40"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
            <Filter className="h-4 w-4" />
            筛选
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">访客</th>
              <th className="px-4 py-3 font-medium">最新问题</th>
              <th className="px-4 py-3 font-medium">意向等级</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">来源渠道</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-secondary/60 ${
                  selectedId === s.id ? "bg-secondary" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">{s.visitor}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{s.question}</td>
                <td className="px-4 py-3">
                  <IntentBadge intent={s.intent} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{s.channel}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{s.updatedAt}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(s.id)
                    }}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
