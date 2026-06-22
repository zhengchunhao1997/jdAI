import { NextResponse } from "next/server"

import { runCozeSync } from "@/lib/coze-sync"

export async function POST() {
  const result = await runCozeSync()
  return NextResponse.json(result.body, { status: result.status })
}
