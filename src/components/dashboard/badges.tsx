import { getIntentMeta } from "@/lib/intent-level"

export function IntentBadge({ intent }: { intent: string }) {
  const { label, className } = getIntentMeta(intent)
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ai_answered: { label: "AI 已答", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    need_human: { label: "待人工接管", className: "bg-rose-50 text-rose-700 border-rose-200" },
    lead_captured: { label: "已留资", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    kb_missed: { label: "知识库未命中", className: "bg-amber-50 text-amber-700 border-amber-200" },
    AI_SERVING: { label: "AI 接待中", className: "bg-sky-50 text-sky-700 border-sky-200" },
    PENDING_HANDOFF: { label: "待人工接管", className: "bg-rose-50 text-rose-700 border-rose-200" },
    HUMAN_SERVING: { label: "人工接待中", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    CLOSED: { label: "已关闭", className: "bg-slate-100 text-slate-600 border-slate-200" },
    PENDING: { label: "待跟进", className: "bg-amber-50 text-amber-700 border-amber-200" },
    CONTACTED: { label: "已联系", className: "bg-sky-50 text-sky-700 border-sky-200" },
    QUOTED: { label: "已报价", className: "bg-violet-50 text-violet-700 border-violet-200" },
    WON: { label: "已成交", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    INVALID: { label: "无效", className: "bg-slate-100 text-slate-600 border-slate-200" },
    ADDED_TO_KNOWLEDGE: { label: "已补知识库", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    IGNORED: { label: "已忽略", className: "bg-slate-100 text-slate-600 border-slate-200" },
    SENSITIVE: { label: "敏感问题", className: "bg-rose-50 text-rose-700 border-rose-200" },
  }
  const { label, className } = map[status] ?? { label: "未知", className: "bg-slate-100 text-slate-600 border-slate-200" }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
