import { AsyncJobStatus, FollowUpStatus, IntentLevel } from "@prisma/client"

import { formatHistory } from "@/lib/conversation"
import {
  runLeadWorkflow,
  runMissedWorkflow,
  runQualityWorkflow,
  runSummaryWorkflow,
} from "@/lib/coze"
import { prisma } from "@/lib/prisma"
import { serverEnv } from "./env"

type AnalysisPayload = {
  conversationId: string
  userMessageId?: string
  aiMessageId?: string
  userText?: string
  answer?: string
}

let stopped = false

process.on("SIGTERM", () => {
  stopped = true
})

process.on("SIGINT", () => {
  stopped = true
})

main().catch(async (error) => {
  console.error("[worker] fatal", error)
  await prisma.$disconnect()
  process.exit(1)
})

async function main() {
  console.log("[worker] starting")

  while (!stopped) {
    const processed = await processBatch()

    if (processed === 0) {
      await sleep(serverEnv.workerIntervalMs)
    }
  }

  await prisma.$disconnect()
  console.log("[worker] stopped")
}

async function processBatch() {
  const jobs = await prisma.asyncJob.findMany({
    where: { status: AsyncJobStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: serverEnv.workerBatchSize,
  })

  for (const job of jobs) {
    const locked = await prisma.asyncJob.updateMany({
      where: {
        id: job.id,
        status: AsyncJobStatus.PENDING,
      },
      data: {
        status: AsyncJobStatus.RUNNING,
      },
    })

    if (locked.count === 0) continue

    try {
      await runJob(job.id, job.jobType, job.conversationId, job.payload as AnalysisPayload)
      await prisma.asyncJob.update({
        where: { id: job.id },
        data: {
          status: AsyncJobStatus.SUCCESS,
          errorMessage: null,
        },
      })
    } catch (error) {
      const nextRetryCount = job.retryCount + 1
      await prisma.asyncJob.update({
        where: { id: job.id },
        data: {
          status: nextRetryCount >= 3 ? AsyncJobStatus.FAILED : AsyncJobStatus.PENDING,
          retryCount: nextRetryCount,
          errorMessage: error instanceof Error ? error.message : "unknown worker error",
        },
      })
      console.error(`[worker] job failed ${job.id}`, error)
    }
  }

  return jobs.length
}

async function runJob(
  jobId: string,
  jobType: string,
  conversationId: string,
  payload: AnalysisPayload,
) {
  if (jobType === "notify_staff") {
    console.log(`[worker] notify_staff queued for ${conversationId}`)
    return
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  })
  const conversationHistory = formatHistory(messages)

  if (jobType === "extract_lead") {
    const result = await runLeadWorkflow({ conversationHistory })

    await prisma.lead.upsert({
      where: { conversationId },
      update: {
        name: result.name,
        phone: result.phone,
        wechat: result.wechat,
        company: result.company,
        industry: result.industry,
        dailyConsultVolume: result.daily_consult_volume,
        targetChannel: result.target_channel,
        demand: result.demand,
        intentLevel: parseIntent(result.intent_level),
        tags: result.tags ?? [],
        nextAction: result.next_action,
      },
      create: {
        merchantId: await getMerchantId(conversationId),
        conversationId,
        name: result.name,
        phone: result.phone,
        wechat: result.wechat,
        company: result.company,
        industry: result.industry,
        dailyConsultVolume: result.daily_consult_volume,
        targetChannel: result.target_channel,
        demand: result.demand,
        intentLevel: parseIntent(result.intent_level),
        tags: result.tags ?? [],
        nextAction: result.next_action,
        followUpStatus: FollowUpStatus.PENDING,
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        intentLevel: parseIntent(result.intent_level),
        needFollowUp: result.need_follow_up ?? false,
      },
    })
    return
  }

  if (jobType === "summarize_conversation") {
    const result = await runSummaryWorkflow({ conversationHistory })
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { summary: result.summary },
    })
    return
  }

  if (jobType === "detect_missed_question") {
    const result = await runMissedWorkflow({
      userText: payload.userText ?? "",
      answer: payload.answer ?? "",
    })

    if (result.is_missed && result.question) {
      await prisma.missedQuestion.create({
        data: {
          merchantId: await getMerchantId(conversationId),
          conversationId,
          question: result.question,
          aiAnswer: payload.answer,
          reason: result.reason,
          suggestedAnswer: result.suggested_answer,
        },
      })
    }
    return
  }

  if (jobType === "quality_check") {
    const result = await runQualityWorkflow({
      userText: payload.userText ?? "",
      answer: payload.answer ?? "",
    })

    await prisma.qualityCheck.create({
      data: {
        conversationId,
        messageId: payload.aiMessageId,
        riskLevel: result.risk_level,
        riskFlags: result.risk_flags,
        shouldHandoff: result.should_handoff,
        reason: result.reason,
      },
    })
    return
  }

  throw new Error(`unknown job type: ${jobType} (${jobId})`)
}

async function getMerchantId(conversationId: string) {
  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    select: { merchantId: true },
  })

  return conversation.merchantId
}

function parseIntent(value: string | undefined) {
  if (value && value in IntentLevel) {
    return value as IntentLevel
  }

  return IntentLevel.UNKNOWN
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
