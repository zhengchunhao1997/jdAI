import { NextResponse } from "next/server"

import { createV2CustomerServiceEvent } from "@/lib/v2-customer-service-events"

export async function POST(request: Request) {
  const result = await createV2CustomerServiceEvent(await request.json(), request.headers)
  return NextResponse.json(result.body, { status: result.status })
}
