import { NextResponse } from "next/server"

import { getConversation } from "@/lib/conversation-service"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const result = await getConversation(id)
  return NextResponse.json(result.body, { status: result.status })
}
