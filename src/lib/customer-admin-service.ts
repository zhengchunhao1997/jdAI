import type {
  ConversationEventRecord,
  CustomerLeadRecord,
  KbMissQuestionRecord,
} from "@prisma/client"

import { getIntentMeta, normalizeIntentLevel } from "@/lib/intent-level"
import { prisma } from "@/lib/prisma"

const TAKE_LIMIT = 300
const TIME_SAVED_MINUTES_PER_MESSAGE = 2

type AdminLeadShape = ReturnType<typeof mapLead>

type AdminConversationShape = {
  id: string
  visitorId: string
  channel: string
  status: string
  intentLevel: string
  latestMessage: string | null
  summary: string | null
  needFollowUp: boolean
  updatedAt: Date
  lead?: AdminLeadShape | null
  messages?: Array<{ content: string; createdAt: Date }>
  handoffEvents?: Array<{ reason: string; createdAt: Date }>
  missedQuestions?: Array<{ question: string; reason: string | null }>
}

type DashboardDataset = {
  events: ConversationEventRecord[]
  leads: CustomerLeadRecord[]
  missedQuestions: KbMissQuestionRecord[]
  todayEvents: ConversationEventRecord[]
  todayLeads: CustomerLeadRecord[]
  todayMissedQuestions: KbMissQuestionRecord[]
}

export async function getCustomerAdminOverview() {
  const dataset = await loadDataset()
  const sessions = buildSessions(dataset.events, dataset.leads).slice(0, 120)
  const highIntentLeads = dataset.leads.filter(isHighIntentLead)
  const todayHighIntentLeads = dataset.todayLeads.filter(isHighIntentLead)
  const handoffs = sessions.filter((item) => item.needFollowUp)

  const body = {
    metrics: buildMetrics(dataset, sessions, highIntentLeads, todayHighIntentLeads, handoffs),
    sessions,
    handoffReasons: getHandoffReasons(sessions),
    missedQuestionsList: dataset.missedQuestions.slice(0, 30).map(mapMissedQuestion),
    channelLeads: getChannelLeads(dataset.leads),
    trend: getTodayTrend(dataset.todayEvents),
    funnel: buildFunnel(dataset.leads, dataset.events),
    concernRanking: buildConcernRanking(dataset.leads, dataset.events, dataset.missedQuestions),
    hotQuestions: buildHotQuestions(dataset.events, dataset.missedQuestions),
    highIntentLeads: highIntentLeads.map(mapLead),
  }

  return { status: 200, body }
}

export async function getCustomerAdminSessions(searchParams: URLSearchParams) {
  const query = searchParams.get("q")?.trim().toLowerCase()
  const { events, leads } = await loadDataset()

  const sessions = buildSessions(events, leads).filter((item) => {
    if (!query) return true
    return [item.visitorId, item.channel, item.latestMessage, item.summary, item.lead?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  return { status: 200, body: { sessions } }
}

export async function getCustomerAdminLeads(searchParams: URLSearchParams) {
  const intent = searchParams.get("intent")
  const leads = await prisma.customerLeadRecord.findMany({
    orderBy: { updatedAt: "desc" },
    take: TAKE_LIMIT,
  })

  return {
    status: 200,
    body: {
      leads: leads
        .filter((lead) => !intent || normalizeIntent(lead.intentLevel, { riskFlag: lead.riskFlag }) === normalizeIntent(intent))
        .map(mapLead),
    },
  }
}

export async function getCustomerAdminHandoffs() {
  const { events, leads } = await loadDataset()

  return {
    status: 200,
    body: {
      handoffs: buildSessions(events, leads).filter((item) => item.needFollowUp),
    },
  }
}

export async function getCustomerAdminMissedQuestions(searchParams: URLSearchParams) {
  const status = searchParams.get("status")
  const questions = await prisma.kbMissQuestionRecord.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: TAKE_LIMIT,
  })

  return {
    status: 200,
    body: {
      missedQuestions: questions.map(mapMissedQuestion),
    },
  }
}

export async function getCustomerAdminKnowledge() {
  return {
    status: 200,
    body: {
      knowledgeItems: [],
    },
  }
}

export async function getCustomerAdminAnalytics() {
  const overview = await getCustomerAdminOverview()
  const body = overview.body

  return {
    status: 200,
    body: {
      trend: body.trend,
      channelLeads: body.channelLeads,
      handoffReasons: body.handoffReasons,
      funnel: body.funnel,
      concernRanking: body.concernRanking,
      hotQuestions: body.hotQuestions,
      metrics: body.metrics,
    },
  }
}

export async function getCustomerAdminSettings() {
  return {
    status: 200,
    body: {
      merchant: {
        id: "customer-demo",
        name: "客户智能客服",
        publicName: "客户智能客服",
        websiteUrl: null,
        adminEmail: null,
        notificationUrl: null,
        welcomeMessage: "您好，我是 AI 客服，请问有什么可以帮您？",
        handoffMessage: "这个问题我会转给人工同事继续跟进。",
        businessHours: "7x24 小时",
        contactInfo: null,
        cozeBotId: null,
        cozeWorkflowId: null,
      },
    },
  }
}

async function loadDataset(): Promise<DashboardDataset> {
  const today = startOfToday()
  const [events, leads, missedQuestions, todayEvents, todayLeads, todayMissedQuestions] = await Promise.all([
    prisma.conversationEventRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: TAKE_LIMIT,
    }),
    prisma.customerLeadRecord.findMany({
      orderBy: { updatedAt: "desc" },
      take: TAKE_LIMIT,
    }),
    prisma.kbMissQuestionRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: TAKE_LIMIT,
    }),
    prisma.conversationEventRecord.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
      take: TAKE_LIMIT,
    }),
    prisma.customerLeadRecord.findMany({
      where: { updatedAt: { gte: today } },
      orderBy: { updatedAt: "desc" },
      take: TAKE_LIMIT,
    }),
    prisma.kbMissQuestionRecord.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
      take: TAKE_LIMIT,
    }),
  ])

  return { events, leads, missedQuestions, todayEvents, todayLeads, todayMissedQuestions }
}

function buildMetrics(
  dataset: DashboardDataset,
  sessions: AdminConversationShape[],
  highIntentLeads: CustomerLeadRecord[],
  todayHighIntentLeads: CustomerLeadRecord[],
  handoffs: AdminConversationShape[],
) {
  const todayVisitors = new Set([
    ...dataset.todayEvents.map((event) => event.userId),
    ...dataset.todayLeads.map((lead) => lead.userId),
  ]).size
  const totalVisitors = new Set([
    ...dataset.events.map((event) => event.userId),
    ...dataset.leads.map((lead) => lead.userId),
  ]).size
  const todayMessages = dataset.todayEvents.filter(hasCustomerOrAiMessage).length
  const totalMessages = dataset.events.filter(hasCustomerOrAiMessage).length
  const aiReplies = dataset.todayEvents.filter((event) => Boolean(event.aiReply)).length
  const totalAiReplies = dataset.events.filter((event) => Boolean(event.aiReply)).length
  const totalHandoffs = buildSessions(dataset.events, dataset.leads).filter((item) => item.needFollowUp).length
  const effectiveLeads = dataset.todayLeads.filter(isEffectiveLead).length
  const totalEffectiveLeads = dataset.leads.filter(isEffectiveLead).length
  const paidOrPending = dataset.todayLeads.filter(isPaidOrPendingLead).length
  const totalPaidOrPending = dataset.leads.filter(isPaidOrPendingLead).length
  const answeredQuestions = dataset.events.filter(hasCustomerOrAiMessage).length
  const resolutionBase = Math.max(1, answeredQuestions + dataset.missedQuestions.length)

  return {
    todayConversations: todayVisitors,
    totalConversations: totalVisitors || sessions.length,
    todayVisitors,
    todayMessages,
    totalMessages,
    aiReplies,
    totalAiReplies,
    humanHandoffs: handoffs.length,
    totalHumanHandoffs: totalHandoffs,
    effectiveLeads,
    totalEffectiveLeads,
    highIntentLeads: highIntentLeads.length,
    todayHighIntentLeads: todayHighIntentLeads.length,
    paidOrPending,
    totalPaidOrPending,
    missedQuestions: dataset.todayMissedQuestions.length,
    totalMissedQuestions: dataset.missedQuestions.length,
    answeredQuestions,
    todayQuestions: todayMessages,
    totalLeads: dataset.leads.length,
    timeSavedMinutes: answeredQuestions * TIME_SAVED_MINUTES_PER_MESSAGE,
    todayTimeSavedMinutes: todayMessages * TIME_SAVED_MINUTES_PER_MESSAGE,
    aiResolutionRate: Math.round(((answeredQuestions / resolutionBase) * 100) * 10) / 10,
    pendingHandoffs: handoffs.length,
  }
}

function buildFunnel(leads: CustomerLeadRecord[], events: ConversationEventRecord[]) {
  const userIds = new Set([...leads.map((lead) => lead.userId), ...events.map((event) => event.userId)])
  const totalConsult = userIds.size
  const providedProfile = countUniqueUsers([
    ...leads.filter(hasBodyProfile).map((lead) => lead.userId),
    ...events.filter((event) => includesAny(eventText(event), ["身高", "体重", "目标", "多少斤"])).map((event) => event.userId),
  ])
  const askedPrice = countUniqueUsers([
    ...leads.filter((lead) => includesAny(leadText(lead), ["价格", "多少钱", "套餐", "费用", "买几套"])).map((lead) => lead.userId),
    ...events.filter((event) => includesAny(eventText(event), ["价格", "多少钱", "套餐", "费用", "买几套"])).map((event) => event.userId),
  ])
  const recommendedPackage = countUniqueUsers([
    ...leads.filter((lead) => Boolean(lead.recommendedPackage)).map((lead) => lead.userId),
    ...events.filter((event) => includesAny(eventText(event), ["推荐", "套餐", "适合你"])).map((event) => event.userId),
  ])
  const handoffOrder = countUniqueUsers([
    ...leads.filter((lead) => includesAny(leadText(lead), ["转人工", "下单", "付款", "待付款", "购买"])).map((lead) => lead.userId),
    ...events.filter((event) => event.riskFlag || includesAny(eventText(event), ["转人工", "下单", "付款", "待付款", "购买"])).map((event) => event.userId),
  ])
  const paid = countUniqueUsers(leads.filter((lead) => includesAny(leadText(lead), ["已下单", "已付款", "成交", "支付成功"])).map((lead) => lead.userId))

  const steps = [
    { key: "consult", label: "咨询人数", value: totalConsult },
    { key: "profile", label: "提供身高/体重/目标", value: providedProfile },
    { key: "price", label: "问价格/套餐", value: askedPrice },
    { key: "package", label: "推荐套餐", value: recommendedPackage },
    { key: "handoff", label: "转人工下单", value: handoffOrder },
    { key: "paid", label: "成交", value: paid },
  ]

  return steps.map((step, index) => ({
    ...step,
    rate: totalConsult > 0 ? Math.round((step.value / totalConsult) * 1000) / 10 : 0,
    previousRate: index > 0 && steps[index - 1].value > 0 ? Math.round((step.value / steps[index - 1].value) * 1000) / 10 : 100,
  }))
}

function buildConcernRanking(
  leads: CustomerLeadRecord[],
  events: ConversationEventRecord[],
  missedQuestions: KbMissQuestionRecord[],
) {
  const categories = [
    { key: "price", label: "价格", keywords: ["价格", "多少钱", "费用", "贵", "便宜", "套餐"] },
    { key: "effect", label: "效果", keywords: ["效果", "多久能瘦", "瘦多少", "有效", "没效果"] },
    { key: "safety", label: "安全", keywords: ["安全", "副作用", "哺乳期", "孕", "能不能用", "禁忌"] },
    { key: "usage", label: "用法", keywords: ["怎么用", "用法", "一天几次", "什么时候吃", "流程"] },
    { key: "rebound", label: "反弹", keywords: ["反弹", "复胖"] },
    { key: "authentic", label: "正品", keywords: ["正品", "真假", "授权", "官方"] },
    { key: "shipping", label: "发货", keywords: ["发货", "快递", "物流", "多久到"] },
    { key: "order", label: "下单", keywords: ["下单", "付款", "支付", "怎么买", "购买"] },
  ]

  const texts = [
    ...leads.map(leadText),
    ...events.map(eventText),
    ...missedQuestions.map(missText),
  ].filter(Boolean)

  return categories
    .map((category) => ({
      key: category.key,
      label: category.label,
      count: texts.filter((text) => includesAny(text, category.keywords)).length,
      examples: getExamples(texts, category.keywords),
    }))
    .sort((left, right) => right.count - left.count)
}

function buildHotQuestions(events: ConversationEventRecord[], missedQuestions: KbMissQuestionRecord[]) {
  const questions = [
    ...events.map((event) => event.userMessage),
    ...missedQuestions.map((item) => item.userMessage ?? item.chatHistory),
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => normalizeQuestion(value))

  const counts = new Map<string, number>()
  for (const question of questions) {
    counts.set(question, (counts.get(question) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8)
}

function buildSessions(events: ConversationEventRecord[], leads: CustomerLeadRecord[]) {
  const leadByUserId = new Map(leads.map((lead) => [lead.userId, lead]))
  const seen = new Set<string>()
  const sessions: AdminConversationShape[] = []

  for (const event of events) {
    const key = event.userId || event.leadId || String(event.id)
    if (seen.has(key)) continue
    seen.add(key)

    const lead = leadByUserId.get(event.userId)
    sessions.push(mapSession(event, lead))
  }

  for (const lead of leads) {
    if (seen.has(lead.userId)) continue
    seen.add(lead.userId)
    sessions.push(mapSessionFromLead(lead))
  }

  return sessions.sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
}

function mapSession(event: ConversationEventRecord, lead?: CustomerLeadRecord): AdminConversationShape {
  const intentLevel = normalizeIntent(event.intentLevel ?? lead?.intentLevel, {
    riskFlag: event.riskFlag || lead?.riskFlag,
  })
  const needFollowUp = Boolean(event.nextAction || lead?.nextAction || intentLevel === "HIGH" || intentLevel === "RISK")
  const latestMessage = event.userMessage ?? lead?.lastUserMessage ?? null
  const aiReply = event.aiReply ?? lead?.lastAiReply ?? null

  return {
    id: `event-${event.id}`,
    visitorId: lead?.nickname ?? event.userId,
    channel: normalizeChannel(event.sysPlatform ?? event.eventType ?? lead?.sysPlatform),
    status: needFollowUp ? "PENDING_HANDOFF" : "AI_SERVING",
    intentLevel,
    latestMessage,
    summary: event.messageSummary ?? lead?.leadSummary ?? null,
    needFollowUp,
    updatedAt: event.createdAt,
    lead: lead ? mapLead(lead) : null,
    messages: [latestMessage, aiReply]
      .filter((content): content is string => Boolean(content))
      .map((content) => ({ content, createdAt: event.createdAt })),
    handoffEvents: needFollowUp
      ? [{ reason: event.nextAction ?? lead?.nextAction ?? event.riskType ?? lead?.riskType ?? "高意向客户需要跟进", createdAt: event.createdAt }]
      : [],
    missedQuestions: [],
  }
}

function mapSessionFromLead(lead: CustomerLeadRecord): AdminConversationShape {
  const intentLevel = normalizeIntent(lead.intentLevel, { riskFlag: lead.riskFlag })
  const needFollowUp = Boolean(lead.nextAction || intentLevel === "HIGH" || intentLevel === "RISK")

  return {
    id: `lead-${lead.id}`,
    visitorId: lead.nickname ?? lead.userId,
    channel: normalizeChannel(lead.sysPlatform),
    status: needFollowUp ? "PENDING_HANDOFF" : "AI_SERVING",
    intentLevel,
    latestMessage: lead.lastUserMessage,
    summary: lead.leadSummary,
    needFollowUp,
    updatedAt: lead.updatedAt,
    lead: mapLead(lead),
    messages: [lead.lastUserMessage, lead.lastAiReply]
      .filter((content): content is string => Boolean(content))
      .map((content) => ({ content, createdAt: lead.updatedAt })),
    handoffEvents: needFollowUp
      ? [{ reason: lead.nextAction ?? lead.riskType ?? "高意向客户需要跟进", createdAt: lead.updatedAt }]
      : [],
    missedQuestions: [],
  }
}

function mapLead(lead: CustomerLeadRecord) {
  const intentLevel = normalizeIntent(lead.intentLevel, { riskFlag: lead.riskFlag })

  return {
    id: String(lead.id),
    name: lead.nickname,
    phone: null,
    wechat: null,
    company: null,
    industry: null,
    dailyConsultVolume: null,
    targetChannel: normalizeChannel(lead.sysPlatform),
    demand: [lead.mainConcern, lead.recommendedPackage].filter(Boolean).join(" · ") || lead.leadSummary,
    intentLevel,
    intentGrade: intentGrade(intentLevel),
    height: lead.height,
    weight: lead.weight,
    targetWeight: lead.targetWeight,
    mainConcern: lead.mainConcern,
    recommendedPackage: lead.recommendedPackage,
    lastQuestion: lead.lastUserMessage,
    followUpSuggestion: lead.nextAction ?? inferFollowUpSuggestion(lead),
    tags: [lead.mainConcern, lead.currentStage, lead.riskType, lead.recommendedPackage]
      .filter((value): value is string => Boolean(value))
      .slice(0, 5),
    nextAction: lead.nextAction,
    followUpStatus: inferFollowUpStatus(lead),
    updatedAt: lead.updatedAt,
    conversation: {
      visitorId: lead.userId,
      channel: normalizeChannel(lead.sysPlatform),
      latestMessage: lead.lastUserMessage,
      summary: lead.leadSummary,
      updatedAt: lead.updatedAt,
    },
  }
}

function mapMissedQuestion(question: KbMissQuestionRecord) {
  return {
    id: String(question.id),
    question: question.userMessage ?? question.chatHistory ?? "未记录原始问题",
    aiAnswer: question.aiReply,
    reason: question.missReason ?? question.route,
    suggestedAnswer: question.suggestedAnswer,
    status: normalizeMissedStatus(question.status),
    count: 1,
    createdAt: question.createdAt,
    conversation: {
      visitorId: question.nickname ?? question.userId ?? "未知访客",
      channel: normalizeChannel(question.sysPlatform),
      updatedAt: question.updatedAt,
    },
  }
}

function getHandoffReasons(sessions: AdminConversationShape[]) {
  const counts = new Map<string, number>()

  for (const session of sessions.filter((item) => item.needFollowUp)) {
    const reason = session.handoffEvents?.[0]?.reason ?? "需要人工跟进"
    counts.set(reason, (counts.get(reason) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)
}

function getChannelLeads(leads: CustomerLeadRecord[]) {
  const counts = new Map<string, number>()

  for (const lead of leads.filter(isHighIntentLead)) {
    const channel = normalizeChannel(lead.sysPlatform)
    counts.set(channel, (counts.get(channel) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([channel, value]) => ({ channel, value }))
    .sort((left, right) => right.value - left.value)
}

function getTodayTrend(events: ConversationEventRecord[]) {
  const buckets = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"].map((label) => ({
    label,
    value: 0,
  }))

  for (const event of events) {
    const hour = event.createdAt.getHours()
    const index = Math.min(Math.max(Math.floor((hour - 8) / 2), 0), buckets.length - 1)
    buckets[index].value += 1
  }

  return buckets
}

function hasCustomerOrAiMessage(event: ConversationEventRecord) {
  return Boolean(event.userMessage || event.aiReply)
}

function isHighIntentLead(lead: CustomerLeadRecord) {
  return normalizeIntent(lead.intentLevel, { riskFlag: lead.riskFlag }) === "HIGH"
}

function isEffectiveLead(lead: CustomerLeadRecord) {
  return Boolean(lead.nickname || lead.height || lead.weight || lead.targetWeight || lead.mainConcern || lead.lastUserMessage)
}

function isPaidOrPendingLead(lead: CustomerLeadRecord) {
  return includesAny(leadText(lead), ["已下单", "待付款", "已付款", "付款", "成交", "支付"])
}

function hasBodyProfile(lead: CustomerLeadRecord) {
  return Boolean(lead.height || lead.weight || lead.targetWeight)
}

function inferFollowUpStatus(lead: CustomerLeadRecord) {
  if (isPaidOrPendingLead(lead)) return "QUOTED"
  const intentLevel = normalizeIntent(lead.intentLevel, { riskFlag: lead.riskFlag })
  if (lead.nextAction || intentLevel === "HIGH" || intentLevel === "RISK") return "PENDING"
  return "CONTACTED"
}

function inferFollowUpSuggestion(lead: CustomerLeadRecord) {
  if (isPaidOrPendingLead(lead)) return "确认付款状态，及时承接下单"
  if (includesAny(leadText(lead), ["考虑", "想想", "晚点"])) return "24 小时内二次跟进，补充案例和保障"
  if (includesAny(leadText(lead), ["价格", "多少钱", "套餐"])) return "围绕预算和目标推荐套餐"
  if (hasBodyProfile(lead)) return "根据身高体重目标给出具体方案"
  return "继续补齐需求信息"
}

function normalizeIntent(value: string | null | undefined, options?: { riskFlag?: boolean }) {
  return normalizeIntentLevel(value, options)
}

function intentGrade(intent: string) {
  const meta = getIntentMeta(intent)
  return meta.grade === "-" ? "待判定" : meta.grade
}

function normalizeMissedStatus(value: string | null | undefined) {
  const text = (value ?? "").trim().toLowerCase()
  if (["added", "done", "已补充", "已处理", "added_to_knowledge"].some((item) => text.includes(item))) {
    return "ADDED_TO_KNOWLEDGE"
  }
  if (["ignore", "ignored", "忽略"].some((item) => text.includes(item))) return "IGNORED"
  if (["sensitive", "敏感"].some((item) => text.includes(item))) return "SENSITIVE"
  return "PENDING"
}

function normalizeChannel(value: string | null | undefined) {
  const text = value?.trim()
  if (!text) return "Coze"
  if (/wechat|weixin|微信/i.test(text)) return "微信"
  if (/web|website|官网/i.test(text)) return "官网"
  if (/douyin|抖音/i.test(text)) return "抖音"
  if (/xhs|小红书/i.test(text)) return "小红书"
  return text
}

function leadText(lead: CustomerLeadRecord) {
  return [
    lead.nickname,
    lead.height,
    lead.weight,
    lead.targetWeight,
    lead.mainConcern,
    lead.riskType,
    lead.intentLevel,
    lead.currentStage,
    lead.recommendedPackage,
    lead.lastUserMessage,
    lead.lastAiReply,
    lead.leadSummary,
    lead.nextAction,
  ].filter(Boolean).join(" ")
}

function eventText(event: ConversationEventRecord) {
  return [
    event.eventType,
    event.userMessage,
    event.aiReply,
    event.intentLevel,
    event.nextAction,
    event.riskType,
    event.messageSummary,
  ].filter(Boolean).join(" ")
}

function missText(question: KbMissQuestionRecord) {
  return [
    question.userMessage,
    question.chatHistory,
    question.aiReply,
    question.missReason,
    question.route,
    question.suggestedAnswer,
  ].filter(Boolean).join(" ")
}

function includesAny(text: string, keywords: string[]) {
  const source = text.toLowerCase()
  return keywords.some((keyword) => source.includes(keyword.toLowerCase()))
}

function countUniqueUsers(userIds: string[]) {
  return new Set(userIds.filter(Boolean)).size
}

function getExamples(texts: string[], keywords: string[]) {
  return texts
    .filter((text) => includesAny(text, keywords))
    .map((text) => normalizeQuestion(text))
    .slice(0, 3)
}

function normalizeQuestion(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
