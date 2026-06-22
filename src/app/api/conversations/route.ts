import { NextResponse } from "next/server"

import { listConversations } from "@/lib/conversation-service"

export async function GET(request: Request) {
  const result = await listConversations(new URL(request.url).searchParams)
  return NextResponse.json(result.body, { status: result.status })
}
