import { ConversationStatus, Prisma, SenderType } from "@prisma/client"
import { z } from "zod"

import { formatHistory, shouldCreateMissedJob, shouldCreateQualityJob } from "@/lib/conversation"
import { runMainChatflow } from "@/lib/coze"
import { prisma } from "@/lib/prisma"

type AnalysisJobInput = {
  conversationId: string
  userMessageId: string
  aiMessageId: string
  userText: string
  answer: string
}

type PendingAnalysisJob = {
  conversationId: string
  jobType: string
  payload: Prisma.InputJsonValue
}

export const chatSchema = z.object({
  merchant_id: z.string().optional(),
  visitor_id: z.string().min(1),
  message: z.string().min(1).max(2000),
  channel: z.string().default("website"),
  product_context: z.string().max(2000).optional(),
})

export async function sendChatMessage(body: unknown) {
  const input = chatSchema.parse(body)
  const merchantId = input.merchant_id ?? process.env.DEFAULT_MERCHANT_ID

  if (!merchantId) {
    return { status: 400, body: { error: "merchant_id is required" } }
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  })

  if (!merchant) {
    return { status: 404, body: { error: "merchant not found" } }
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      merchantId,
      visitorId: input.visitor_id,
      channel: input.channel,
      closedAt: null,
    },
  })

  const conversation = existingConversation
    ? await prisma.conversation.update({
        where: { id: existingConversation.id },
        data: { latestMessage: input.message },
      })
    : await prisma.conversation.create({
        data: {
          merchantId,
          visitorId: input.visitor_id,
          channel: input.channel,
          latestMessage: input.message,
        },
      })

  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: SenderType.VISITOR,
      content: input.message,
    },
  })

  if (conversation.status === ConversationStatus.HUMAN_SERVING) {
    await prisma.asyncJob.create({
      data: {
        conversationId: conversation.id,
        jobType: "notify_staff",
        payload: { userMessageId: userMessage.id },
      },
    })

    return {
      status: 200,
      body: {
        conversation_id: conversation.id,
        mode: "human",
        answer: merchant.handoffMessage,
      },
    }
  }

  const recentMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const cozeResult = await runMainChatflow({
    userMessage: input.message,
    conversationHistory: formatHistory(recentMessages.reverse()),
    merchantName: merchant.publicName,
    visitorId: input.visitor_id,
    conversationName: `${merchant.publicName}-${input.channel}`,
    productContext: input.product_context,
  })

  const answer = cozeResult.answer

  const aiMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: SenderType.AI,
      content: answer,
      rawAiResponse: cozeResult.raw ? (cozeResult.raw as object) : cozeResult,
      knowledgeUsed: cozeResult.knowledge_used,
      riskFlags: cozeResult.need_handoff ? [cozeResult.handoff_reason ?? "需要人工确认"] : [],
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      latestMessage: answer,
      status: cozeResult.need_handoff ? ConversationStatus.PENDING_HANDOFF : conversation.status,
    },
  })

  if (cozeResult.need_handoff) {
    await prisma.handoffEvent.create({
      data: {
        conversationId: conversation.id,
        reason: cozeResult.handoff_reason ?? "AI 判断需要人工确认",
        triggerType: "ai",
      },
    })
  }

  await enqueueAnalysisJobs({
    conversationId: conversation.id,
    userMessageId: userMessage.id,
    aiMessageId: aiMessage.id,
    userText: input.message,
    answer,
  })

  return {
    status: 200,
    body: {
      conversation_id: conversation.id,
      answer,
      suggested_questions: cozeResult.suggested_questions ?? [],
      need_handoff: cozeResult.need_handoff ?? false,
    },
  }
}

async function enqueueAnalysisJobs(input: AnalysisJobInput) {
  const jobs: PendingAnalysisJob[] = [
    {
      conversationId: input.conversationId,
      jobType: "extract_lead",
      payload: input,
    },
  ]

  const messageCount = await prisma.message.count({
    where: { conversationId: input.conversationId },
  })

  if (messageCount >= 6 && messageCount % 6 === 0) {
    jobs.push({
      conversationId: input.conversationId,
      jobType: "summarize_conversation",
      payload: { conversationId: input.conversationId },
    })
  }

  if (shouldCreateMissedJob(`${input.userText}\n${input.answer}`)) {
    jobs.push({
      conversationId: input.conversationId,
      jobType: "detect_missed_question",
      payload: input,
    })
  }

  if (shouldCreateQualityJob(`${input.userText}\n${input.answer}`)) {
    jobs.push({
      conversationId: input.conversationId,
      jobType: "quality_check",
      payload: input,
    })
  }

  await prisma.asyncJob.createMany({ data: jobs })
}
