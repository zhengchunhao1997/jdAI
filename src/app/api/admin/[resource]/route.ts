import { NextResponse } from "next/server"

import {
  createKnowledgeItem,
  getAdminAnalytics,
  getAdminHandoffs,
  getAdminLeads,
  getAdminMissedQuestions,
  getAdminOverview,
  getAdminSessions,
  getAdminSettings,
  getKnowledgeItems,
  updateAdminSettings,
} from "@/lib/admin-service"

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params
  const searchParams = new URL(request.url).searchParams
  const result = await dispatchGet(resource, searchParams)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params
  const body = await request.json()
  const result = await dispatchPost(resource, body)
  return NextResponse.json(result.body, { status: result.status })
}

function dispatchGet(resource: string, searchParams: URLSearchParams) {
  if (resource === "overview") return getAdminOverview(searchParams)
  if (resource === "sessions") return getAdminSessions(searchParams)
  if (resource === "leads") return getAdminLeads(searchParams)
  if (resource === "handoffs") return getAdminHandoffs(searchParams)
  if (resource === "missed-questions") return getAdminMissedQuestions(searchParams)
  if (resource === "knowledge") return getKnowledgeItems(searchParams)
  if (resource === "analytics") return getAdminAnalytics(searchParams)
  if (resource === "settings") return getAdminSettings(searchParams)
  return Promise.resolve({ status: 404, body: { error: "admin resource not found" } })
}

function dispatchPost(resource: string, body: unknown) {
  if (resource === "knowledge") return createKnowledgeItem(body)
  if (resource === "settings") return updateAdminSettings(body)
  return Promise.resolve({ status: 404, body: { error: "admin resource not found" } })
}
