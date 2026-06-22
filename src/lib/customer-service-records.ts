import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const nullableString = z.preprocess(emptyToNull, z.string().nullable().optional())
const nullableDate = z.preprocess(parseNullableDate, z.date().nullable().optional())
const nullableJson = z.preprocess(emptyToNull, z.unknown().nullable().optional())
const boolValue = z.preprocess((value) => {
  if (typeof value === "string") return value.toLowerCase() === "true"
  return value ?? false
}, z.boolean())

const customerLeadSchema = z.object({
  coze_record_id: nullableString,
  sys_platform: nullableString,
  uuid: nullableString,
  bstudio_create_time: nullableDate,
  user_id: z.string().min(1),
  nickname: nullableString,
  height: nullableString,
  weight: nullableString,
  target_weight: nullableString,
  main_concern: nullableString,
  risk_flag: boolValue.default(false),
  risk_type: nullableString,
  intent_level: nullableString,
  current_stage: nullableString,
  recommended_package: nullableString,
  last_user_message: nullableString,
  last_ai_reply: nullableString,
  lead_summary: nullableString,
  next_action: nullableString,
  follow_up_time: nullableDate,
  profile_json: nullableJson,
  owner: nullableString,
  created_at: nullableDate,
  updated_at: nullableDate,
})

const conversationEventSchema = z.object({
  coze_record_id: nullableString,
  sys_platform: nullableString,
  uuid: nullableString,
  bstudio_create_time: nullableDate,
  event_id: nullableString,
  lead_id: nullableString,
  user_id: z.string().min(1),
  event_type: nullableString,
  user_message: nullableString,
  ai_reply: nullableString,
  intent_level: nullableString,
  next_action: nullableString,
  risk_flag: boolValue.default(false),
  risk_type: nullableString,
  message_summary: nullableString,
  created_at: nullableDate,
})

const kbMissQuestionSchema = z.object({
  coze_record_id: nullableString,
  sys_platform: nullableString,
  uuid: nullableString,
  bstudio_create_time: nullableDate,
  miss_id: nullableString,
  user_id: nullableString,
  chat_history: nullableString,
  ai_reply: nullableString,
  nickname: nullableString,
  miss_reason: nullableString,
  route: nullableString,
  status: nullableString,
  suggested_answer: nullableString,
  created_at: nullableDate,
  updated_at: nullableDate,
  user_message: nullableString,
})

export async function createCustomerLeadRecords(body: unknown) {
  const records = normalizeRecords(body).map((record) => customerLeadSchema.parse(record))
  if (records.length === 0) return { status: 400, body: { error: "records is required" } }

  const ids = []

  for (const record of records) {
    const row = await prisma.customerLeadRecord.create({
      data: mapCustomerLead(record),
      select: { id: true },
    })

    ids.push(row.id)
  }

  return { status: 201, body: { ok: true, count: ids.length, ids } }
}

export async function createConversationEventRecords(body: unknown) {
  const records = normalizeRecords(body).map((record) => conversationEventSchema.parse(record))
  if (records.length === 0) return { status: 400, body: { error: "records is required" } }

  const ids = []

  for (const record of records) {
    const row = await prisma.conversationEventRecord.create({
      data: mapConversationEvent(record),
      select: { id: true },
    })

    ids.push(row.id)
  }

  return { status: 201, body: { ok: true, count: ids.length, ids } }
}

export async function createKbMissQuestionRecords(body: unknown) {
  const records = normalizeRecords(body).map((record) => kbMissQuestionSchema.parse(record))
  if (records.length === 0) return { status: 400, body: { error: "records is required" } }

  const ids = []

  for (const record of records) {
    const row = await prisma.kbMissQuestionRecord.create({
      data: mapKbMissQuestion(record),
      select: { id: true },
    })

    ids.push(row.id)
  }

  return { status: 201, body: { ok: true, count: ids.length, ids } }
}

function normalizeRecords(body: unknown) {
  if (Array.isArray(body)) return body
  if (body && typeof body === "object" && Array.isArray((body as { records?: unknown }).records)) {
    return (body as { records: unknown[] }).records
  }
  if (body && typeof body === "object") return [body]
  return []
}

function mapCustomerLead(record: z.infer<typeof customerLeadSchema>) {
  return {
    cozeRecordId: record.coze_record_id,
    sysPlatform: record.sys_platform,
    uuid: record.uuid,
    bstudioCreateTime: record.bstudio_create_time,
    userId: record.user_id,
    nickname: record.nickname,
    height: record.height,
    weight: record.weight,
    targetWeight: record.target_weight,
    mainConcern: record.main_concern,
    riskFlag: record.risk_flag,
    riskType: record.risk_type,
    intentLevel: record.intent_level,
    currentStage: record.current_stage,
    recommendedPackage: record.recommended_package,
    lastUserMessage: record.last_user_message,
    lastAiReply: record.last_ai_reply,
    leadSummary: record.lead_summary,
    nextAction: record.next_action,
    followUpTime: record.follow_up_time,
    profileJson: toPrismaJson(record.profile_json),
    owner: record.owner,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
  }
}

function mapConversationEvent(record: z.infer<typeof conversationEventSchema>) {
  return {
    cozeRecordId: record.coze_record_id,
    sysPlatform: record.sys_platform,
    uuid: record.uuid,
    bstudioCreateTime: record.bstudio_create_time,
    eventId: record.event_id,
    leadId: record.lead_id,
    userId: record.user_id,
    eventType: record.event_type,
    userMessage: record.user_message,
    aiReply: record.ai_reply,
    intentLevel: record.intent_level,
    nextAction: record.next_action,
    riskFlag: record.risk_flag,
    riskType: record.risk_type,
    messageSummary: record.message_summary,
    createdAt: record.created_at ?? undefined,
  }
}

function mapKbMissQuestion(record: z.infer<typeof kbMissQuestionSchema>) {
  return {
    cozeRecordId: record.coze_record_id,
    sysPlatform: record.sys_platform,
    uuid: record.uuid,
    bstudioCreateTime: record.bstudio_create_time,
    missId: record.miss_id,
    userId: record.user_id,
    chatHistory: record.chat_history,
    aiReply: record.ai_reply,
    nickname: record.nickname,
    missReason: record.miss_reason,
    route: record.route,
    status: record.status,
    suggestedAnswer: record.suggested_answer,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
    userMessage: record.user_message,
  }
}

function emptyToNull(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value === "string" && value.trim() === "") return null
  return value
}

function parseNullableDate(value: unknown) {
  const next = emptyToNull(value)
  if (!next) return null
  if (next instanceof Date) return isValidBusinessDate(next) ? next : null

  if (typeof next !== "string") return next

  const normalized = next
    .replace(/\s+CST$/, "")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
  const date = new Date(normalized)

  return isValidBusinessDate(date) ? date : null
}

function isValidBusinessDate(date: Date) {
  return !Number.isNaN(date.getTime()) && date.getUTCFullYear() >= 1970
}

function toPrismaJson(value: unknown) {
  if (value === null || value === undefined) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export {
  customerLeadSchema,
  conversationEventSchema,
  kbMissQuestionSchema,
  mapCustomerLead,
  mapConversationEvent,
  mapKbMissQuestion,
}
