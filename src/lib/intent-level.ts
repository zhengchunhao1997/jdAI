export type NormalizedIntentLevel = "HIGH" | "MEDIUM" | "LOW" | "RISK" | "UNKNOWN"

type IntentMeta = {
  grade: "A" | "B" | "C" | "D" | "-"
  label: string
  shortLabel: string
  className: string
}

export const intentLevelMeta: Record<NormalizedIntentLevel, IntentMeta> = {
  HIGH: {
    grade: "A",
    label: "A 高意向用户",
    shortLabel: "高意向",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  MEDIUM: {
    grade: "B",
    label: "B 中意向用户",
    shortLabel: "中意向",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  LOW: {
    grade: "C",
    label: "C 低意向用户",
    shortLabel: "低意向",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  RISK: {
    grade: "D",
    label: "D 风险用户",
    shortLabel: "风险用户",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  UNKNOWN: {
    grade: "-",
    label: "待判定",
    shortLabel: "待判定",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
}

export function normalizeIntentLevel(value: string | null | undefined, options?: { riskFlag?: boolean }) {
  if (options?.riskFlag) return "RISK" satisfies NormalizedIntentLevel

  const text = (value ?? "").trim().toLowerCase()
  if (!text) return "UNKNOWN" satisfies NormalizedIntentLevel

  if (["a", "high", "高", "高意向", "强意向", "hot"].some((item) => text === item || text.includes(item))) {
    return "HIGH" satisfies NormalizedIntentLevel
  }

  if (["b", "medium", "中", "中意向", "一般"].some((item) => text === item || text.includes(item))) {
    return "MEDIUM" satisfies NormalizedIntentLevel
  }

  if (["c", "low", "低", "低意向"].some((item) => text === item || text.includes(item))) {
    return "LOW" satisfies NormalizedIntentLevel
  }

  if (["d", "risk", "风险", "敏感", "投诉", "禁忌"].some((item) => text === item || text.includes(item))) {
    return "RISK" satisfies NormalizedIntentLevel
  }

  return "UNKNOWN" satisfies NormalizedIntentLevel
}

export function getIntentMeta(value: string | null | undefined, options?: { riskFlag?: boolean }) {
  return intentLevelMeta[normalizeIntentLevel(value, options)]
}
