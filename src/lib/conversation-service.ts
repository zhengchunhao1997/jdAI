import { ConversationStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

export async function listConversations(searchParams: URLSearchParams) {
  const merchantId = searchParams.get("merchant_id") ?? process.env.DEFAULT_MERCHANT_ID

  if (!merchantId) {
    return { status: 400, body: { error: "merchant_id is required" } }
  }

  const conversations = await prisma.conversation.findMany({
    where: { merchantId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      lead: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  return { status: 200, body: { conversations } }
}

export async function getConversation(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      lead: true,
      missedQuestions: {
        orderBy: { createdAt: "desc" },
      },
      qualityChecks: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!conversation) {
    return { status: 404, body: { error: "conversation not found" } }
  }

  return { status: 200, body: { conversation } }
}

const handoffSchema = z.object({
  conversation_id: z.string(),
  action: z.enum(["takeover", "resume_ai", "close"]),
  staff_id: z.string().optional(),
})

export async function handleHandoff(body: unknown) {
  const input = handoffSchema.parse(body)

  const status =
    input.action === "takeover"
      ? ConversationStatus.HUMAN_SERVING
      : input.action === "resume_ai"
        ? ConversationStatus.AI_SERVING
        : ConversationStatus.CLOSED

  const conversation = await prisma.conversation.update({
    where: { id: input.conversation_id },
    data: {
      status,
      assignedStaffId: input.action === "takeover" ? input.staff_id : undefined,
      closedAt: input.action === "close" ? new Date() : undefined,
    },
  })

  if (input.action === "takeover") {
    await prisma.handoffEvent.updateMany({
      where: { conversationId: input.conversation_id, handledAt: null },
      data: {
        handledAt: new Date(),
        handledBy: input.staff_id,
      },
    })
  }

  return { status: 200, body: { conversation } }
}
