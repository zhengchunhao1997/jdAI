import { NextResponse } from "next/server"

import {
  addVolcKnowledgePoint,
  deleteVolcKnowledgePoint,
  getVolcKnowledgeStatus,
  listVolcKnowledgeDocs,
  listVolcKnowledgePoints,
  searchVolcKnowledge,
  updateTenantVolcKnowledgeConfig,
  updateVolcKnowledgePoint,
} from "@/lib/volcengine-knowledge"

export async function GET(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params
  const searchParams = new URL(request.url).searchParams
  const result = action === "status"
    ? await getVolcKnowledgeStatus(searchParams, request.headers)
    : { status: 404, body: { ok: false, error: { code: "NOT_FOUND", message: "knowledge action not found" } } }

  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params
  const body = await request.json()
  const result = await dispatchPost(action, body, request.headers)
  return NextResponse.json(result.body, { status: result.status })
}

function dispatchPost(action: string, body: unknown, headers: Headers) {
  if (action === "search") return searchVolcKnowledge(body, headers)
  if (action === "docs") return listVolcKnowledgeDocs(body, headers)
  if (action === "points") return listVolcKnowledgePoints(body, headers)
  if (action === "points-add") return addVolcKnowledgePoint(body, headers)
  if (action === "points-update") return updateVolcKnowledgePoint(body, headers)
  if (action === "points-delete") return deleteVolcKnowledgePoint(body, headers)
  if (action === "tenant-config") return updateTenantVolcKnowledgeConfig(body, headers)

  return Promise.resolve({
    status: 404,
    body: {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "knowledge action not found",
      },
    },
  })
}
