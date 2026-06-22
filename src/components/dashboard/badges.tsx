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
    ai_answered: { label: "AI 已答", className: "bg-gray-50 text-gray-700 border-gray-200" },
    need_human: { label: "待人工接管", className: "bg-red-50 text-red-600 border-red-200" },
    lead_captured: { label: "已留资", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    kb_missed: { label: "知识库未命中", className: "bg-amber-100 text-amber-700 border-amber-300" },
    AI_SERVING: { label: "AI 接待中", className: "bg-gray-50 text-gray-700 border-gray-200" },
    PENDING_HANDOFF: { label: "待人工接管", className: "bg-red-50 text-red-600 border-red-200" },
    HUMAN_SERVING: { label: "人工接待中", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    CLOSED: { label: "已关闭", className: "bg-gray-100 text-gray-500 border-gray-200" },
    PENDING: { label: "待跟进", className: "bg-gray-50 text-gray-700 border-gray-200" },
    CONTACTED: { label: "已联系", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    QUOTED: { label: "已报价", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    WON: { label: "已成交", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    INVALID: { label: "无效", className: "bg-gray-100 text-gray-500 border-gray-200" },
    ADDED_TO_KNOWLEDGE: { label: "已补知识库", className: "bg-indigo-600/10 text-indigo-600 border-indigo-200" },
    IGNORED: { label: "已忽略", className: "bg-gray-100 text-gray-500 border-gray-200" },
    SENSITIVE: { label: "敏感问题", className: "bg-red-50 text-red-600 border-red-200" },
  }
  const { label, className } = map[status] ?? { label: "未知", className: "bg-gray-100 text-gray-500 border-gray-200" }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
