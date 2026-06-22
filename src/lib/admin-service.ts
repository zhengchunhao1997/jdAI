import {
  ConversationStatus,
  FollowUpStatus,
  IntentLevel,
  MissedQuestionStatus,
  Prisma,
} from "@prisma/client"
import { z } from "zod"

import {
  getCustomerAdminAnalytics,
  getCustomerAdminHandoffs,
  getCustomerAdminKnowledge,
  getCustomerAdminLeads,
  getCustomerAdminMissedQuestions,
  getCustomerAdminOverview,
  getCustomerAdminSessions,
  getCustomerAdminSettings,
} from "@/lib/customer-admin-service"
import { prisma } from "@/lib/prisma"

const demoLeadNames = ["张女士", "王先生", "李经理", "陈总监", "赵主管", "周老师"]
const demoCompanies = ["某教育机构", "某本地生活品牌", "某招商加盟公司", "某企业服务团队", "某连锁门店"]
const demoPhones = ["138****6821", "186****4092", "159****7316", "177****2058", "131****8860"]
const demoWechats = ["wx_****91", "sales_****28", "mkt_****06", "client_****73", "consult_****15"]

function getMerchantId(searchParams?: URLSearchParams) {
  return searchParams?.get("merchant_id") ?? process.env.DEFAULT_MERCHANT_ID
}

function isDemoMode(searchParams?: URLSearchParams) {
  return searchParams?.get("mode") !== "internal"
}

function shouldUseCustomerDashboard(searchParams?: URLSearchParams) {
  return searchParams?.get("mode") !== "internal"
}

function missingMerchant() {
  return { status: 400, body: { error: "merchant_id is required" } }
}

export async function getAdminOverview(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminOverview()

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()
  const demoMode = isDemoMode(searchParams)

  const since = startOfToday()

  const [
    todayConversations,
    totalConversations,
    highIntentLeads,
    pendingHandoffs,
    missedQuestions,
    solvedMessages,
    totalAiMessages,
    recentConversations,
    handoffReasons,
    missedList,
    channelLeads,
    trend,
  ] = await Promise.all([
    prisma.conversation.count({ where: { merchantId, createdAt: { gte: since } } }),
    prisma.conversation.count({ where: { merchantId } }),
    prisma.lead.count({ where: { merchantId, intentLevel: IntentLevel.HIGH } }),
    prisma.conversation.count({ where: { merchantId, status: ConversationStatus.PENDING_HANDOFF } }),
    prisma.missedQuestion.count({ where: { merchantId, status: MissedQuestionStatus.PENDING } }),
    prisma.message.count({
      where: {
        conversation: { merchantId },
        senderType: "AI",
        knowledgeUsed: true,
      },
    }),
    prisma.message.count({
      where: {
        conversation: { merchantId },
        senderType: "AI",
      },
    }),
    findSessions(merchantId, {}),
    prisma.handoffEvent.groupBy({
      by: ["reason"],
      where: { conversation: { merchantId }, handledAt: null },
      _count: { _all: true },
      orderBy: { _count: { reason: "desc" } },
      take: 5,
    }),
    prisma.missedQuestion.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.lead.groupBy({
      by: ["targetChannel"],
      where: { merchantId, intentLevel: IntentLevel.HIGH },
      _count: { _all: true },
      orderBy: { _count: { targetChannel: "desc" } },
      take: 6,
    }),
    getConversationTrend(merchantId),
  ])

  const body = {
    metrics: {
      todayConversations: demoCount(todayConversations, 8),
      totalConversations: demoCount(totalConversations, 28),
      aiResolutionRate: totalAiMessages > 0 ? Math.round((solvedMessages / totalAiMessages) * 1000) / 10 : 86.5,
      highIntentLeads: demoCount(highIntentLeads, 6),
      pendingHandoffs: demoCount(pendingHandoffs, 3),
      missedQuestions: demoCount(missedQuestions, 4),
    },
    sessions: recentConversations,
    handoffReasons: handoffReasons.map((item) => ({
      reason: scrubText(item.reason),
      count: item._count._all,
    })),
    missedQuestionsList: missedList,
    channelLeads: withDemoChannelLeads(channelLeads.map((item) => ({
      channel: item.targetChannel ?? "未标注",
      value: item._count._all,
    }))),
    trend: withDemoTrend(trend),
  }

  return {
    status: 200,
    body: demoMode ? anonymizeOverview(body) : body,
  }
}

export async function getAdminSessions(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminSessions(searchParams)

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()
  const sessions = await findSessions(merchantId, {
    status: searchParams.get("status") ?? undefined,
    query: searchParams.get("q") ?? undefined,
  })

  return {
    status: 200,
    body: {
      sessions: isDemoMode(searchParams) ? sessions.map((session, index) => anonymizeConversation(session, index)) : sessions,
    },
  }
}

export async function getAdminLeads(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminLeads(searchParams)

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const leads = await prisma.lead.findMany({
    where: {
      merchantId,
      intentLevel: parseIntent(searchParams.get("intent")),
      followUpStatus: parseFollowUp(searchParams.get("status")),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      conversation: {
        select: {
          visitorId: true,
          channel: true,
          latestMessage: true,
          summary: true,
          updatedAt: true,
        },
      },
    },
  })

  return { status: 200, body: { leads: isDemoMode(searchParams) ? leads.map((lead, index) => anonymizeLead(lead, index)) : leads } }
}

export async function getAdminHandoffs(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminHandoffs()

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const conversations = await prisma.conversation.findMany({
    where: {
      merchantId,
      status: ConversationStatus.PENDING_HANDOFF,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      handoffEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      lead: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  return {
    status: 200,
    body: { handoffs: isDemoMode(searchParams) ? conversations.map((item, index) => anonymizeConversation(item, index)) : conversations },
  }
}

export async function getAdminMissedQuestions(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminMissedQuestions(searchParams)

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const questions = await prisma.missedQuestion.findMany({
    where: {
      merchantId,
      status: parseMissedStatus(searchParams.get("status")),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      conversation: {
        select: {
          visitorId: true,
          channel: true,
          updatedAt: true,
        },
      },
    },
  })

  return {
    status: 200,
    body: {
      missedQuestions: isDemoMode(searchParams) ? questions.map((item, index) => anonymizeMissedQuestion(item, index)) : questions,
    },
  }
}

const knowledgeSchema = z.object({
  merchant_id: z.string().optional(),
  title: z.string().min(1),
  category: z.string().min(1).default("通用"),
  question: z.string().min(1),
  answer: z.string().min(1),
  enabled: z.boolean().default(true),
})

export async function getKnowledgeItems(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminKnowledge()

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const items = await prisma.knowledgeItem.findMany({
    where: {
      merchantId,
      enabled: searchParams.get("enabled") === null ? undefined : searchParams.get("enabled") === "true",
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  })

  return { status: 200, body: { knowledgeItems: items } }
}

export async function createKnowledgeItem(body: unknown) {
  const input = knowledgeSchema.parse(body)
  const merchantId = input.merchant_id ?? process.env.DEFAULT_MERCHANT_ID
  if (!merchantId) return missingMerchant()

  const item = await prisma.knowledgeItem.create({
    data: {
      merchantId,
      title: input.title,
      category: input.category,
      question: input.question,
      answer: input.answer,
      enabled: input.enabled,
    },
  })

  return { status: 201, body: { knowledgeItem: item } }
}

const settingsSchema = z.object({
  merchant_id: z.string().optional(),
  publicName: z.string().optional(),
  websiteUrl: z.string().optional().nullable(),
  adminEmail: z.string().optional().nullable(),
  notificationUrl: z.string().optional().nullable(),
  welcomeMessage: z.string().optional(),
  handoffMessage: z.string().optional(),
  businessHours: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  cozeBotId: z.string().optional().nullable(),
  cozeWorkflowId: z.string().optional().nullable(),
})

export async function getAdminSettings(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminSettings()

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })
  if (!merchant) return { status: 404, body: { error: "merchant not found" } }

  return { status: 200, body: { merchant: isDemoMode(searchParams) ? anonymizeMerchant(merchant) : merchant } }
}

export async function updateAdminSettings(body: unknown) {
  const input = settingsSchema.parse(body)
  const merchantId = input.merchant_id ?? process.env.DEFAULT_MERCHANT_ID
  if (!merchantId) return missingMerchant()

  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      publicName: input.publicName,
      websiteUrl: input.websiteUrl,
      adminEmail: input.adminEmail,
      notificationUrl: input.notificationUrl,
      welcomeMessage: input.welcomeMessage,
      handoffMessage: input.handoffMessage,
      businessHours: input.businessHours,
      contactInfo: input.contactInfo,
      cozeBotId: input.cozeBotId,
      cozeWorkflowId: input.cozeWorkflowId,
    },
  })

  return { status: 200, body: { merchant } }
}

export async function getAdminAnalytics(searchParams: URLSearchParams) {
  if (shouldUseCustomerDashboard(searchParams)) return getCustomerAdminAnalytics()

  const merchantId = getMerchantId(searchParams)
  if (!merchantId) return missingMerchant()

  const [trend, channelLeads, statusGroups, intentGroups] = await Promise.all([
    getConversationTrend(merchantId),
    prisma.lead.groupBy({
      by: ["targetChannel"],
      where: { merchantId },
      _count: { _all: true },
      orderBy: { _count: { targetChannel: "desc" } },
    }),
    prisma.conversation.groupBy({
      by: ["status"],
      where: { merchantId },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["intentLevel"],
      where: { merchantId },
      _count: { _all: true },
    }),
  ])

  return {
    status: 200,
    body: {
      trend: isDemoMode(searchParams) ? withDemoTrend(trend) : trend,
      channelLeads: isDemoMode(searchParams)
        ? withDemoChannelLeads(channelLeads.map((item) => ({ channel: item.targetChannel ?? "未标注", value: item._count._all })))
        : channelLeads,
      statusGroups,
      intentGroups,
    },
  }
}

async function findSessions(
  merchantId: string,
  filters: { status?: string; query?: string },
) {
  const where: Prisma.ConversationWhereInput = {
    merchantId,
    status: parseConversationStatus(filters.status),
  }

  if (filters.query) {
    where.OR = [
      { visitorId: { contains: filters.query, mode: "insensitive" } },
      { latestMessage: { contains: filters.query, mode: "insensitive" } },
      { summary: { contains: filters.query, mode: "insensitive" } },
    ]
  }

  return prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      handoffEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      missedQuestions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
}

async function getConversationTrend(merchantId: string) {
  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const rows = await prisma.conversation.findMany({
    where: { merchantId, createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const buckets = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"].map((label) => ({
    label,
    value: 0,
  }))

  for (const row of rows) {
    const hour = row.createdAt.getHours()
    const index = Math.min(Math.max(Math.floor((hour - 8) / 2), 0), buckets.length - 1)
    buckets[index].value += 1
  }

  return buckets
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function parseConversationStatus(value: string | null | undefined) {
  if (value && value in ConversationStatus) return value as ConversationStatus
  return undefined
}

function parseIntent(value: string | null | undefined) {
  if (value && value in IntentLevel) return value as IntentLevel
  return undefined
}

function parseFollowUp(value: string | null | undefined) {
  if (value && value in FollowUpStatus) return value as FollowUpStatus
  return undefined
}

function parseMissedStatus(value: string | null | undefined) {
  if (value && value in MissedQuestionStatus) return value as MissedQuestionStatus
  return undefined
}

function anonymizeOverview<T extends {
  sessions: unknown[]
  missedQuestionsList: unknown[]
}>(body: T) {
  return {
    ...body,
    sessions: body.sessions.map((session, index) => anonymizeConversation(session, index)),
    missedQuestionsList: body.missedQuestionsList.map((item, index) => anonymizeMissedQuestion(item, index)),
  }
}

function anonymizeConversation<T>(conversation: T, index: number): T {
  if (!conversation || typeof conversation !== "object") return conversation
  const record = conversation as Record<string, unknown>

  return {
    ...record,
    visitorId: demoVisitorId(index),
    latestMessage: scrubText(record.latestMessage),
    summary: scrubText(record.summary),
    lead: record.lead ? anonymizeLead(record.lead, index) : record.lead,
    messages: Array.isArray(record.messages)
      ? record.messages.map((message) => sanitizeMessage(message as Record<string, unknown>))
      : record.messages,
    handoffEvents: Array.isArray(record.handoffEvents)
      ? record.handoffEvents.map((event) => anonymizeObjectText(event as Record<string, unknown>, ["reason"]))
      : record.handoffEvents,
    missedQuestions: Array.isArray(record.missedQuestions)
      ? record.missedQuestions.map((item) => anonymizeMissedQuestion(item, index))
      : record.missedQuestions,
  } as T
}

function sanitizeMessage(message: Record<string, unknown>) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderType: message.senderType,
    senderName: message.senderName,
    content: scrubText(message.content),
    knowledgeUsed: message.knowledgeUsed,
    riskFlags: Array.isArray(message.riskFlags) ? message.riskFlags.map((flag) => scrubText(flag)) : [],
    createdAt: message.createdAt,
  }
}

function anonymizeLead<T>(lead: T, index: number): T {
  if (!lead || typeof lead !== "object") return lead
  const record = lead as Record<string, unknown>

  return {
    ...record,
    name: record.name ? demoLeadNames[index % demoLeadNames.length] : record.name,
    phone: record.phone ? demoPhones[index % demoPhones.length] : record.phone,
    wechat: record.wechat ? demoWechats[index % demoWechats.length] : record.wechat,
    company: record.company ? demoCompanies[index % demoCompanies.length] : record.company,
    demand: scrubText(record.demand),
    nextAction: scrubText(record.nextAction),
    conversation: record.conversation
      ? {
          ...(record.conversation as Record<string, unknown>),
          visitorId: demoVisitorId(index),
          latestMessage: scrubText((record.conversation as Record<string, unknown>).latestMessage),
          summary: scrubText((record.conversation as Record<string, unknown>).summary),
        }
      : record.conversation,
  } as T
}

function anonymizeMissedQuestion<T>(item: T, index: number): T {
  if (!item || typeof item !== "object") return item
  const record = item as Record<string, unknown>

  return {
    ...record,
    question: scrubText(record.question),
    aiAnswer: scrubText(record.aiAnswer),
    reason: scrubText(record.reason),
    suggestedAnswer: scrubText(record.suggestedAnswer),
    conversation: record.conversation
      ? {
          ...(record.conversation as Record<string, unknown>),
          visitorId: demoVisitorId(index),
        }
      : record.conversation,
  } as T
}

function anonymizeMerchant<T>(merchant: T): T {
  if (!merchant || typeof merchant !== "object") return merchant
  const record = merchant as Record<string, unknown>

  return {
    ...record,
    adminEmail: record.adminEmail ? "ad***@jidah.ai" : record.adminEmail,
    notificationUrl: record.notificationUrl ? "https://api.example.com/webhook/***" : record.notificationUrl,
    contactInfo: scrubText(record.contactInfo),
    cozeBotId: record.cozeBotId ? maskMiddle(String(record.cozeBotId)) : record.cozeBotId,
    cozeWorkflowId: record.cozeWorkflowId ? maskMiddle(String(record.cozeWorkflowId)) : record.cozeWorkflowId,
  } as T
}

function anonymizeObjectText<T extends Record<string, unknown>>(record: T, keys: string[]) {
  return keys.reduce<Record<string, unknown>>(
    (next, key) => ({
      ...next,
      [key]: scrubText(next[key]),
    }),
    { ...record },
  )
}

function scrubText(value: unknown) {
  if (typeof value !== "string") return value

  return value
    .replace(/1[3-9]\d{9}/g, (match) => `${match.slice(0, 3)}****${match.slice(-4)}`)
    .replace(/[a-zA-Z][-_a-zA-Z0-9]{5,}/g, (match) => {
      if (/^https?:\/\//.test(match)) return match
      return maskMiddle(match)
    })
    .replace(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g, (match) => {
      const [name, domain] = match.split("@")
      return `${name.slice(0, 2)}***@${domain}`
    })
}

function maskMiddle(value: string) {
  if (value.length <= 6) return `${value.slice(0, 1)}***`
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

function demoVisitorId(index: number) {
  return `访客 A-${String(1024 + index).padStart(4, "0")}`
}

function demoCount(value: number, fallback: number) {
  return value > 0 ? value : fallback
}

function withDemoTrend(trend: Array<{ label: string; value: number }>) {
  if (trend.some((item) => item.value > 0)) return trend

  return [
    { label: "09:00", value: 2 },
    { label: "11:00", value: 5 },
    { label: "13:00", value: 3 },
    { label: "15:00", value: 7 },
    { label: "17:00", value: 6 },
    { label: "19:00", value: 4 },
    { label: "21:00", value: 1 },
  ]
}

function withDemoChannelLeads(channelLeads: Array<{ channel: string; value: number }>) {
  if (channelLeads.length > 0) return channelLeads

  return [
    { channel: "官网咨询", value: 4 },
    { channel: "企业微信", value: 2 },
    { channel: "小红书", value: 1 },
  ]
}
