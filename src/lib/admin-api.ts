import { getIntentMeta } from "@/lib/intent-level"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

function resolveApiPath(path: string) {
  if (apiBaseUrl) return `${apiBaseUrl}${path}`
  if (path.startsWith("/api/knowledge/")) return path.replace(/^\/api\/knowledge\//, "/knowledge-api/")
  return path.replace(/^\/api\/admin\//, "/admin-api/")
}

export async function adminFetch<T>(path: string): Promise<T> {
  const url = resolveApiPath(path)
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const url = resolveApiPath(path)
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`提交失败：${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function knowledgeFetch<T>(path: string): Promise<T> {
  const response = await fetch(resolveApiPath(path), {
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function knowledgePost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(resolveApiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`提交失败：${response.status}`)
  }

  return response.json() as Promise<T>
}

export type AdminMerchant = {
  id: string
  name: string
  publicName: string
  websiteUrl: string | null
  adminEmail: string | null
  notificationUrl: string | null
  welcomeMessage: string
  handoffMessage: string
  businessHours: string | null
  contactInfo: string | null
  cozeBotId: string | null
  cozeWorkflowId: string | null
}

export type DashboardSection =
  | "overview"
  | "sessions"
  | "leads"
  | "handoffs"
  | "missed"
  | "knowledge"
  | "analytics"
  | "settings"

export type AdminConversation = {
  id: string
  visitorId: string
  channel: string
  status: string
  intentLevel: string
  latestMessage: string | null
  summary: string | null
  needFollowUp: boolean
  updatedAt: string
  lead?: AdminLead | null
  messages?: Array<{ content: string; createdAt: string }>
  handoffEvents?: Array<{ reason: string; createdAt: string }>
  missedQuestions?: Array<{ question: string; reason: string | null }>
}

export type AdminLead = {
  id: string
  name: string | null
  phone: string | null
  wechat: string | null
  company: string | null
  industry: string | null
  dailyConsultVolume: string | null
  targetChannel: string | null
  demand: string | null
  intentLevel: string
  intentGrade?: string
  height?: string | null
  weight?: string | null
  targetWeight?: string | null
  mainConcern?: string | null
  recommendedPackage?: string | null
  lastQuestion?: string | null
  followUpSuggestion?: string | null
  tags: string[]
  nextAction: string | null
  followUpStatus: string
  updatedAt: string
  conversation?: {
    visitorId: string
    channel: string
    latestMessage: string | null
    summary: string | null
    updatedAt: string
  }
}

export type AdminMissedQuestion = {
  id: string
  question: string
  aiAnswer: string | null
  reason: string | null
  suggestedAnswer: string | null
  status: string
  count?: number
  createdAt: string
  conversation?: {
    visitorId: string
    channel: string
    updatedAt: string
  }
}

export type KnowledgeItem = {
  id: string
  title: string
  category: string
  question: string
  answer: string
  enabled: boolean
  hitCount: number
  updatedAt: string
}

export type VolcKnowledgeStatus = {
  ok: boolean
  configured: boolean
  base_url: string
  tenant: { id: string; code: string; name: string } | null
  resource_id_configured: boolean
  collection_name_configured: boolean
  project: string
  default_doc_id_configured: boolean
}

export type VolcKnowledgeResponse = {
  ok: boolean
  upstream_status?: number
  data?: unknown
  error?: { code: string; message: string }
}

export type AdminOverview = {
  metrics: {
    todayConversations: number
    totalConversations: number
    todayVisitors?: number
    todayMessages?: number
    totalMessages?: number
    aiReplies?: number
    totalAiReplies?: number
    humanHandoffs?: number
    totalHumanHandoffs?: number
    effectiveLeads?: number
    totalEffectiveLeads?: number
    todayHighIntentLeads?: number
    paidOrPending?: number
    totalPaidOrPending?: number
    totalMissedQuestions?: number
    answeredQuestions?: number
    todayQuestions?: number
    totalLeads?: number
    timeSavedMinutes?: number
    todayTimeSavedMinutes?: number
    aiResolutionRate: number
    highIntentLeads: number
    pendingHandoffs: number
    missedQuestions: number
  }
  sessions: AdminConversation[]
  handoffReasons: Array<{ reason: string; count: number }>
  missedQuestionsList: AdminMissedQuestion[]
  channelLeads: Array<{ channel: string; value: number }>
  trend: Array<{ label: string; value: number }>
  funnel?: Array<{ key: string; label: string; value: number; rate: number; previousRate: number }>
  concernRanking?: Array<{ key: string; label: string; count: number; examples: string[] }>
  hotQuestions?: Array<{ question: string; count: number }>
  highIntentLeads?: AdminLead[]
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-"
  const date = new Date(value)
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function intentLabel(value: string | null | undefined) {
  return getIntentMeta(value).label
}

export function statusLabel(value: string | null | undefined) {
  const map: Record<string, string> = {
    AI_SERVING: "AI 接待中",
    PENDING_HANDOFF: "待人工接管",
    HUMAN_SERVING: "人工接待中",
    CLOSED: "已关闭",
  }
  return map[value ?? ""] ?? "未知"
}
