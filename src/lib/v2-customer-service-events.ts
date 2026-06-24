import { Prisma } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const nullableString = z.preprocess(emptyToNull, z.string().nullable().optional())
const nullableNumber = z.preprocess(emptyToNull, z.coerce.number().nullable().optional())
const nullableInt = z.preprocess(emptyToNull, z.coerce.number().int().nullable().optional())
const nullableDate = z.preprocess(parseNullableDate, z.date().nullable().optional())
const nullableJson = z.preprocess(parseJsonish, z.unknown().nullable().optional())
const jsonArray = z.preprocess(parseJsonishArray, z.array(z.unknown()).default([]))

const eventSchema = z.object({
  tenant: z
    .object({
      tenant_id: nullableString,
      code: nullableString,
      name: nullableString,
      industry: nullableString,
    })
    .default({}),
  channel: z.object({
    type: z.string().min(1),
    name: nullableString,
    external_app_id: nullableString,
    external_user_id: z.string().min(1),
    external_open_id: nullableString,
    external_union_id: nullableString,
    nickname: nullableString,
    raw: nullableJson,
  }),
  customer: z
    .object({
      nickname: nullableString,
      avatar_url: nullableString,
      phone: nullableString,
      wechat: nullableString,
      email: nullableString,
      location: nullableString,
    })
    .default({}),
  conversation: z
    .object({
      external_conversation_id: nullableString,
      source: nullableString,
      source_detail: nullableString,
      status_code: nullableString,
      intent_level_code: nullableString,
      stage_code: nullableString,
      summary: nullableString,
    })
    .default({}),
  messages: z.object({
    user_message: z.string().min(1),
    ai_answer: z.string().min(1),
    content_type: nullableString,
    external_user_message_id: nullableString,
    external_ai_message_id: nullableString,
    raw: nullableJson,
  }),
  ai_run: z
    .object({
      workflow_provider: nullableString,
      workflow_id: nullableString,
      workflow_version: nullableString,
      model_name: nullableString,
      prompt_version: nullableString,
      persona_version: nullableString,
      input: nullableJson,
      raw_output: nullableString,
      final_answer: nullableString,
      latency_ms: nullableInt,
      status: nullableString,
      error_message: nullableString,
    })
    .default({}),
  knowledge_refs: z.preprocess(parseJsonishArray, z.array(
    z.object({
      external_kb_id: nullableString,
      external_doc_id: nullableString,
      title: nullableString,
      content_snapshot: nullableString,
      matched_text: nullableString,
      similarity_score: nullableNumber,
      rank: nullableInt,
    }),
  ).default([])),
  profile: z
    .object({
      profile_json: nullableJson,
      tags: jsonArray,
      profile_score: nullableInt,
    })
    .nullable()
    .optional(),
  lead: z
    .object({
      intent_level_code: nullableString,
      stage_code: nullableString,
      status_code: nullableString,
      score: nullableInt,
      main_need: nullableString,
      main_concern: nullableString,
      recommended_solution: nullableString,
      next_action: nullableString,
      event_reason: nullableString,
    })
    .nullable()
    .optional(),
  quality: z
    .object({
      fidelity_score: nullableInt,
      tone_score: nullableInt,
      helpfulness_score: nullableInt,
      sales_guidance_score: nullableInt,
      risk_level_code: nullableString,
      issues: jsonArray,
      suggestion: nullableString,
      review_status_code: nullableString,
    })
    .nullable()
    .optional(),
  miss_question: z.preprocess(emptyToNull, z.object({
    question: nullableString,
    ai_answer: nullableString,
    miss_type_code: nullableString,
    miss_reason: nullableString,
    suggested_answer: nullableString,
    status_code: nullableString,
  }).nullable().optional()),
  deal: z.preprocess(emptyToNull, z.object({
    amount: nullableNumber,
    currency: nullableString,
    deal_status_code: nullableString,
    source: nullableString,
    external_order_id: nullableString,
    paid_at: nullableDate,
  }).nullable().optional()),
})

type EventInput = z.infer<typeof eventSchema>

export async function createV2CustomerServiceEvent(body: unknown, headers?: Headers) {
  const authResult = verifyApiKey(headers)
  if (!authResult.ok) return authResult

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
        },
      },
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const input = parsed.data
    const tenant = await resolveTenant(tx, input)
    const channel = await resolveChannel(tx, input, tenant.id)
    const customer = await resolveCustomer(tx, input, tenant.id, channel.id)
    const conversation = await resolveConversation(tx, input, tenant.id, channel.id, customer.id)
    const { userMessage, aiMessage } = await createMessages(tx, input, tenant.id, conversation.id, customer.id)
    const workflow = await resolveWorkflow(tx, input, tenant.id, channel.id)
    const aiRun = await createAiRun(tx, input, tenant.id, conversation.id, userMessage.id, aiMessage.id, workflow?.id)
    await createKnowledgeRefs(tx, input, tenant.id, aiRun.id, aiMessage.id)
    await upsertProfile(tx, input, tenant.id, customer.id)
    const lead = await upsertLead(tx, input, tenant.id, customer.id, conversation.id)
    await createQualityCheck(tx, input, tenant.id, conversation.id, aiMessage.id, aiRun.id)
    await upsertMissQuestion(tx, input, tenant.id, customer.id, conversation.id, aiMessage.id)
    await upsertDeal(tx, input, tenant.id, customer.id, conversation.id, lead?.id)

    await tx.v2Conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: input.messages.ai_answer,
        lastMessageAt: new Date(),
        messageCount: { increment: 2 },
        statusCode: input.conversation.status_code ?? conversation.statusCode,
        intentLevelCode: input.conversation.intent_level_code ?? input.lead?.intent_level_code ?? conversation.intentLevelCode,
        stageCode: input.conversation.stage_code ?? input.lead?.stage_code ?? conversation.stageCode,
        summary: input.conversation.summary ?? conversation.summary,
      },
    })

    return {
      tenant_id: tenant.id,
      customer_id: customer.id,
      conversation_id: conversation.id,
      user_message_id: userMessage.id,
      ai_message_id: aiMessage.id,
      ai_run_id: aiRun.id,
      lead_id: lead?.id ?? null,
    }
  })

  return { status: 201, body: { ok: true, data: result } }
}

function verifyApiKey(headers?: Headers) {
  const configuredKey = process.env.JIDAH_API_KEY
  if (!configuredKey) return { ok: true as const }

  const auth = headers?.get("authorization") ?? ""
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1]

  if (token === configuredKey) return { ok: true as const }

  return {
    ok: false as const,
    status: 401,
    body: {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "invalid api key",
      },
    },
  }
}

async function resolveTenant(tx: Prisma.TransactionClient, input: EventInput) {
  if (input.tenant.tenant_id) {
    const tenant = await tx.v2Tenant.findUnique({ where: { id: input.tenant.tenant_id } })
    if (tenant) return tenant
  }

  const code = input.tenant.code ?? "default"
  return tx.v2Tenant.upsert({
    where: { code },
    update: {
      name: input.tenant.name ?? undefined,
      industry: input.tenant.industry ?? undefined,
    },
    create: {
      code,
      name: input.tenant.name ?? code,
      industry: input.tenant.industry,
    },
  })
}

async function resolveChannel(tx: Prisma.TransactionClient, input: EventInput, tenantId: string) {
  const existing = await tx.v2Channel.findFirst({
    where: {
      tenantId,
      channelType: input.channel.type,
      externalAppId: input.channel.external_app_id,
    },
    orderBy: { createdAt: "desc" },
  })

  if (existing) return existing

  return tx.v2Channel.create({
    data: {
      tenantId,
      channelType: input.channel.type,
      channelName: input.channel.name ?? input.channel.type,
      externalAppId: input.channel.external_app_id,
      configJson: toPrismaJson(input.channel.raw),
    },
  })
}

async function resolveCustomer(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  channelId: string,
) {
  const identity = await tx.v2CustomerIdentity.findUnique({
    where: {
      tenantId_channelId_externalUserId: {
        tenantId,
        channelId,
        externalUserId: input.channel.external_user_id,
      },
    },
    include: { customer: true },
  })

  const customerData = {
    primaryChannelId: channelId,
    externalUserId: input.channel.external_user_id,
    nickname: input.customer.nickname ?? input.channel.nickname ?? undefined,
    avatarUrl: input.customer.avatar_url ?? undefined,
    phone: input.customer.phone ?? undefined,
    wechat: input.customer.wechat ?? undefined,
    email: input.customer.email ?? undefined,
    location: input.customer.location ?? undefined,
    lastSeenAt: new Date(),
  }

  if (identity) {
    await tx.v2CustomerIdentity.update({
      where: { id: identity.id },
      data: {
        externalOpenId: input.channel.external_open_id,
        externalUnionId: input.channel.external_union_id,
        nickname: input.channel.nickname,
        rawJson: toPrismaJson(input.channel.raw),
      },
    })

    return tx.v2Customer.update({
      where: { id: identity.customerId },
      data: customerData,
    })
  }

  const customer = await tx.v2Customer.create({
    data: {
      tenantId,
      firstSeenAt: new Date(),
      ...customerData,
    },
  })

  await tx.v2CustomerIdentity.create({
    data: {
      tenantId,
      customerId: customer.id,
      channelId,
      channelType: input.channel.type,
      externalUserId: input.channel.external_user_id,
      externalOpenId: input.channel.external_open_id,
      externalUnionId: input.channel.external_union_id,
      nickname: input.channel.nickname,
      rawJson: toPrismaJson(input.channel.raw),
    },
  })

  return customer
}

async function resolveConversation(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  channelId: string,
  customerId: string,
) {
  const externalConversationId = input.conversation.external_conversation_id
  const existing = await tx.v2Conversation.findFirst({
    where: {
      tenantId,
      channelId,
      customerId,
      ...(externalConversationId
        ? { externalConversationId }
        : { closedAt: null }),
    },
    orderBy: { updatedAt: "desc" },
  })

  if (existing) return existing

  return tx.v2Conversation.create({
    data: {
      tenantId,
      customerId,
      channelId,
      externalConversationId,
      source: input.conversation.source,
      sourceDetail: input.conversation.source_detail,
      statusCode: input.conversation.status_code ?? "AI_SERVING",
      intentLevelCode: input.conversation.intent_level_code ?? input.lead?.intent_level_code ?? "UNKNOWN",
      stageCode: input.conversation.stage_code ?? input.lead?.stage_code ?? "NEW",
      summary: input.conversation.summary,
    },
  })
}

async function createMessages(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  conversationId: string,
  customerId: string,
) {
  const latest = await tx.v2Message.findFirst({
    where: { conversationId },
    orderBy: { messageSeq: "desc" },
    select: { messageSeq: true },
  })
  const startSeq = latest ? latest.messageSeq + 1 : 1

  const userMessage = await tx.v2Message.create({
    data: {
      tenantId,
      conversationId,
      customerId,
      role: "USER",
      content: input.messages.user_message,
      contentType: input.messages.content_type ?? "text",
      messageSeq: startSeq,
      externalMessageId: input.messages.external_user_message_id,
      rawJson: toPrismaJson(input.messages.raw),
    },
  })

  const aiMessage = await tx.v2Message.create({
    data: {
      tenantId,
      conversationId,
      customerId,
      role: "AI",
      content: input.messages.ai_answer,
      contentType: input.messages.content_type ?? "text",
      messageSeq: startSeq + 1,
      externalMessageId: input.messages.external_ai_message_id,
      rawJson: toPrismaJson(input.messages.raw),
    },
  })

  return { userMessage, aiMessage }
}

async function resolveWorkflow(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  channelId: string,
) {
  if (!input.ai_run.workflow_id) return null

  const existing = await tx.v2Workflow.findFirst({
    where: {
      tenantId,
      provider: input.ai_run.workflow_provider ?? "coze",
      workflowId: input.ai_run.workflow_id,
    },
    orderBy: { createdAt: "desc" },
  })

  if (existing) {
    return tx.v2Workflow.update({
      where: { id: existing.id },
      data: {
        channelId,
        workflowVersion: input.ai_run.workflow_version,
        modelName: input.ai_run.model_name,
        promptVersion: input.ai_run.prompt_version,
        personaVersion: input.ai_run.persona_version,
      },
    })
  }

  return tx.v2Workflow.create({
    data: {
      tenantId,
      channelId,
      provider: input.ai_run.workflow_provider ?? "coze",
      workflowId: input.ai_run.workflow_id,
      workflowVersion: input.ai_run.workflow_version,
      modelName: input.ai_run.model_name,
      promptVersion: input.ai_run.prompt_version,
      personaVersion: input.ai_run.persona_version,
    },
  })
}

function createAiRun(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  conversationId: string,
  userMessageId: string,
  aiMessageId: string,
  workflowConfigId?: string,
) {
  return tx.v2AiRun.create({
    data: {
      tenantId,
      conversationId,
      userMessageId,
      aiMessageId,
      workflowConfigId,
      workflowProvider: input.ai_run.workflow_provider ?? "coze",
      workflowId: input.ai_run.workflow_id,
      workflowVersion: input.ai_run.workflow_version,
      modelName: input.ai_run.model_name,
      promptVersion: input.ai_run.prompt_version,
      personaVersion: input.ai_run.persona_version,
      inputJson: toPrismaJson(input.ai_run.input),
      rawOutput: input.ai_run.raw_output,
      finalAnswer: input.ai_run.final_answer ?? input.messages.ai_answer,
      latencyMs: input.ai_run.latency_ms,
      status: input.ai_run.status ?? "SUCCESS",
      errorMessage: input.ai_run.error_message,
    },
  })
}

async function createKnowledgeRefs(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  aiRunId: string,
  messageId: string,
) {
  if (input.knowledge_refs.length === 0) return

  await tx.v2MessageKnowledgeRef.createMany({
    data: input.knowledge_refs.map((ref) => ({
      tenantId,
      aiRunId,
      messageId,
      externalKbId: ref.external_kb_id,
      externalDocId: ref.external_doc_id,
      knowledgeTitle: ref.title,
      knowledgeContentSnapshot: ref.content_snapshot,
      matchedText: ref.matched_text,
      similarityScore: ref.similarity_score,
      rank: ref.rank,
    })),
  })
}

async function upsertProfile(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  customerId: string,
) {
  if (!input.profile) return

  await tx.v2CustomerProfile.upsert({
    where: { customerId },
    update: {
      profileJson: toPrismaJson(input.profile.profile_json),
      tags: toStringArray(input.profile.tags),
      profileScore: input.profile.profile_score ?? undefined,
      lastExtractedAt: new Date(),
    },
    create: {
      tenantId,
      customerId,
      profileJson: toPrismaJson(input.profile.profile_json),
      tags: toStringArray(input.profile.tags),
      profileScore: input.profile.profile_score ?? 0,
      lastExtractedAt: new Date(),
    },
  })
}

async function upsertLead(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  customerId: string,
  conversationId: string,
) {
  if (!input.lead) return null

  const existing = await tx.v2Lead.findFirst({
    where: { tenantId, customerId, conversationId },
    orderBy: { updatedAt: "desc" },
  })

  const data = {
    intentLevelCode: input.lead.intent_level_code ?? "UNKNOWN",
    stageCode: input.lead.stage_code ?? "NEW",
    statusCode: input.lead.status_code ?? "OPEN",
    score: input.lead.score ?? 0,
    mainNeed: input.lead.main_need,
    mainConcern: input.lead.main_concern,
    recommendedSolution: input.lead.recommended_solution,
    nextAction: input.lead.next_action,
  }

  const lead = existing
    ? await tx.v2Lead.update({
        where: { id: existing.id },
        data,
      })
    : await tx.v2Lead.create({
        data: {
          tenantId,
          customerId,
          conversationId,
          ...data,
        },
      })

  const changes = getLeadChanges(existing, data)
  if (changes.length === 0 && !input.lead.event_reason) return lead

  await tx.v2LeadEvent.createMany({
    data: (changes.length > 0 ? changes : [{ eventType: "NOTE", fromValue: null, toValue: null }]).map((change) => ({
      tenantId,
      leadId: lead.id,
      conversationId,
      eventType: change.eventType,
      fromValue: change.fromValue,
      toValue: change.toValue,
      reason: input.lead?.event_reason,
      operatorType: "AI",
    })),
  })

  return lead
}

function getLeadChanges(
  existing: { intentLevelCode: string; stageCode: string; statusCode: string; score: number } | null,
  next: { intentLevelCode: string; stageCode: string; statusCode: string; score: number },
) {
  if (!existing) {
    return [
      { eventType: "LEAD_CREATED", fromValue: null, toValue: next.intentLevelCode },
    ]
  }

  const changes: Array<{ eventType: string; fromValue: string | null; toValue: string | null }> = []
  if (existing.intentLevelCode !== next.intentLevelCode) {
    changes.push({ eventType: "INTENT_LEVEL_CHANGED", fromValue: existing.intentLevelCode, toValue: next.intentLevelCode })
  }
  if (existing.stageCode !== next.stageCode) {
    changes.push({ eventType: "STAGE_CHANGED", fromValue: existing.stageCode, toValue: next.stageCode })
  }
  if (existing.statusCode !== next.statusCode) {
    changes.push({ eventType: "STATUS_CHANGED", fromValue: existing.statusCode, toValue: next.statusCode })
  }
  if (existing.score !== next.score) {
    changes.push({ eventType: "SCORE_CHANGED", fromValue: String(existing.score), toValue: String(next.score) })
  }

  return changes
}

async function createQualityCheck(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  conversationId: string,
  messageId: string,
  aiRunId: string,
) {
  if (!input.quality) return

  await tx.v2AnswerQualityCheck.create({
    data: {
      tenantId,
      conversationId,
      messageId,
      aiRunId,
      fidelityScore: input.quality.fidelity_score,
      toneScore: input.quality.tone_score,
      helpfulnessScore: input.quality.helpfulness_score,
      salesGuidanceScore: input.quality.sales_guidance_score,
      riskLevelCode: input.quality.risk_level_code ?? "NONE",
      issuesJson: toPrismaJson(input.quality.issues),
      suggestion: input.quality.suggestion,
      reviewStatusCode: input.quality.review_status_code ?? "AUTO",
    },
  })
}

async function upsertMissQuestion(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  customerId: string,
  conversationId: string,
  messageId: string,
) {
  const miss = input.miss_question
  if (!miss) return

  const question = miss.question ?? input.messages.user_message
  if (!question) return

  const existing = await tx.v2KbMissQuestion.findFirst({
    where: {
      tenantId,
      question,
      missTypeCode: miss.miss_type_code ?? "NO_KB",
    },
    orderBy: { updatedAt: "desc" },
  })

  if (existing) {
    await tx.v2KbMissQuestion.update({
      where: { id: existing.id },
      data: {
        conversationId,
        messageId,
        customerId,
        aiAnswer: miss.ai_answer ?? input.messages.ai_answer,
        missReason: miss.miss_reason,
        suggestedAnswer: miss.suggested_answer,
        statusCode: miss.status_code ?? existing.statusCode,
        occurrenceCount: { increment: 1 },
        lastSeenAt: new Date(),
      },
    })
    return
  }

  await tx.v2KbMissQuestion.create({
    data: {
      tenantId,
      conversationId,
      messageId,
      customerId,
      question,
      aiAnswer: miss.ai_answer ?? input.messages.ai_answer,
      missTypeCode: miss.miss_type_code ?? "NO_KB",
      missReason: miss.miss_reason,
      suggestedAnswer: miss.suggested_answer,
      statusCode: miss.status_code ?? "PENDING",
    },
  })
}

async function upsertDeal(
  tx: Prisma.TransactionClient,
  input: EventInput,
  tenantId: string,
  customerId: string,
  conversationId: string,
  leadId?: string | null,
) {
  if (!input.deal || !leadId) return

  const data = {
    amount: input.deal.amount === null || input.deal.amount === undefined ? undefined : new Prisma.Decimal(input.deal.amount),
    currency: input.deal.currency ?? "CNY",
    dealStatusCode: input.deal.deal_status_code ?? "PENDING_PAYMENT",
    source: input.deal.source ?? "COZE",
    externalOrderId: input.deal.external_order_id,
    paidAt: input.deal.paid_at,
  }

  if (input.deal.external_order_id) {
    const existing = await tx.v2Deal.findFirst({
      where: { tenantId, externalOrderId: input.deal.external_order_id },
    })
    if (existing) {
      await tx.v2Deal.update({ where: { id: existing.id }, data })
      return
    }
  }

  await tx.v2Deal.create({
    data: {
      tenantId,
      leadId,
      customerId,
      conversationId,
      ...data,
    },
  })
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

function parseJsonish(value: unknown) {
  const next = emptyToNull(value)
  if (typeof next !== "string") return next

  try {
    return JSON.parse(next)
  } catch {
    return next
  }
}

function parseJsonishArray(value: unknown) {
  const parsed = parseJsonish(value)
  if (Array.isArray(parsed)) return parsed
  if (parsed === null || parsed === undefined) return []
  return []
}

function toStringArray(value: unknown[]) {
  return value.filter((item): item is string => typeof item === "string")
}

function toPrismaJson(value: unknown) {
  if (value === null || value === undefined) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}
