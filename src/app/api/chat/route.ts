import { NextResponse } from "next/server"

import { sendChatMessage } from "@/lib/chat-service"

export async function POST(request: Request) {
  const result = await sendChatMessage(await request.json())
  return NextResponse.json(result.body, { status: result.status })
}
