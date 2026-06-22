import { NextResponse } from "next/server"

import { handleHandoff } from "@/lib/conversation-service"

export async function POST(request: Request) {
  const result = await handleHandoff(await request.json())
  return NextResponse.json(result.body, { status: result.status })
}
