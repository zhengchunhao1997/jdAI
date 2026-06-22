import { NextResponse } from "next/server"

import { createConversationEventRecords } from "@/lib/customer-service-records"

export async function POST(request: Request) {
  const result = await createConversationEventRecords(await request.json())
  return NextResponse.json(result.body, { status: result.status })
}
