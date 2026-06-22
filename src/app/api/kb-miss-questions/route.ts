import { NextResponse } from "next/server"

import { createKbMissQuestionRecords } from "@/lib/customer-service-records"

export async function POST(request: Request) {
  const result = await createKbMissQuestionRecords(await request.json())
  return NextResponse.json(result.body, { status: result.status })
}
