import { NextResponse } from "next/server"

import { createCustomerLeadRecords } from "@/lib/customer-service-records"

export async function POST(request: Request) {
  const result = await createCustomerLeadRecords(await request.json())
  return NextResponse.json(result.body, { status: result.status })
}
