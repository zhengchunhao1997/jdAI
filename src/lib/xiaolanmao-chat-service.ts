import { z } from "zod"

import { runXiaolanmaoWorkflow } from "@/lib/coze"

const xiaolanmaoChatSchema = z.object({
  nickname: z.preprocess(normalizeOptionalString, z.string().max(80).optional()),
  user_id: z.preprocess(normalizeOptionalString, z.string().max(120).optional()),
  user_message: z.string().min(1).max(2000),
})

export async function sendXiaolanmaoMessage(body: unknown) {
  const input = xiaolanmaoChatSchema.parse(body)
  const nickname = input.nickname ?? "测试客户"
  const userId = input.user_id ?? "xiaolanmao_guest"
  const result = await runXiaolanmaoWorkflow({
    nickname,
    userId,
    userMessage: input.user_message,
  })

  return {
    status: 200,
    body: {
      conversation_id: userId,
      answer: result.answer,
      suggested_questions: ["我适合买几套？", "多久能看到效果？", "可以转人工下单吗？"],
    },
  }
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}
