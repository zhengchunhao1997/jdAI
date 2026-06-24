import { serve } from "@hono/node-server"

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
import { sendChatMessage } from "@/lib/chat-service"
import { getConversation, handleHandoff, listConversations } from "@/lib/conversation-service"
import { runCozeSync } from "@/lib/coze-sync"
import {
  createConversationEventRecords,
  createCustomerLeadRecords,
  createKbMissQuestionRecords,
} from "@/lib/customer-service-records"
import { prisma } from "@/lib/prisma"
import { createV2CustomerServiceEvent } from "@/lib/v2-customer-service-events"
import { sendXiaolanmaoMessage } from "@/lib/xiaolanmao-chat-service"
import { serverEnv } from "./env"
import { handleRequest, route } from "./http"

const routes = [
  route("GET", /^\/health$/, async () => {
    await prisma.$queryRaw`SELECT 1`
    return {
      body: {
        ok: true,
        service: "jidah-api",
        time: new Date().toISOString(),
      },
    }
  }),
  route("POST", /^\/api\/chat$/, async (request) => {
    return sendChatMessage(await request.json())
  }),
  route("POST", /^\/api\/xiaolanmao-chat$/, async (request) => {
    return sendXiaolanmaoMessage(await request.json())
  }),
  route("GET", /^\/api\/conversations$/, async (request) => {
    return listConversations(request.url.searchParams)
  }),
  route("GET", /^\/api\/conversations\/[^/]+$/, async (request) => {
    const id = request.url.pathname.split("/").at(-1)
    return getConversation(id ?? "")
  }),
  route("POST", /^\/api\/handoff$/, async (request) => {
    return handleHandoff(await request.json())
  }),
  route("POST", /^\/api\/customer-leads$/, async (request) => {
    return createCustomerLeadRecords(await request.json())
  }),
  route("POST", /^\/api\/conversation-events$/, async (request) => {
    return createConversationEventRecords(await request.json())
  }),
  route("POST", /^\/api\/kb-miss-questions$/, async (request) => {
    return createKbMissQuestionRecords(await request.json())
  }),
  route("POST", /^\/api\/v2\/customer-service\/events$/, async (request) => {
    return createV2CustomerServiceEvent(await request.json(), request.headers)
  }),
  route("POST", /^\/api\/coze-sync\/run$/, async () => {
    return runCozeSync()
  }),
  route("GET", /^\/api\/admin\/overview$/, async (request) => {
    return getAdminOverview(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/sessions$/, async (request) => {
    return getAdminSessions(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/leads$/, async (request) => {
    return getAdminLeads(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/handoffs$/, async (request) => {
    return getAdminHandoffs(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/missed-questions$/, async (request) => {
    return getAdminMissedQuestions(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/knowledge$/, async (request) => {
    return getKnowledgeItems(request.url.searchParams)
  }),
  route("POST", /^\/api\/admin\/knowledge$/, async (request) => {
    return createKnowledgeItem(await request.json())
  }),
  route("GET", /^\/api\/admin\/analytics$/, async (request) => {
    return getAdminAnalytics(request.url.searchParams)
  }),
  route("GET", /^\/api\/admin\/settings$/, async (request) => {
    return getAdminSettings(request.url.searchParams)
  }),
  route("POST", /^\/api\/admin\/settings$/, async (request) => {
    return updateAdminSettings(await request.json())
  }),
]

serve(
  {
    port: serverEnv.port,
    fetch: (request) => handleRequest(request, routes, { corsOrigins: serverEnv.corsOrigins }),
  },
  (info) => {
    console.log(`[api] listening on http://0.0.0.0:${info.port}`)
  },
)

startCozeSyncScheduler()

function startCozeSyncScheduler() {
  if (!serverEnv.cozeSyncEnabled) return

  let running = false

  async function runScheduledSync() {
    if (running) return

    running = true
    try {
      const result = await runCozeSync()
      console.log("[coze-sync]", JSON.stringify(result.body))
    } catch (error) {
      console.error("[coze-sync] failed", error)
    } finally {
      running = false
    }
  }

  setTimeout(() => {
    void runScheduledSync()
  }, 5000)
  setInterval(() => {
    void runScheduledSync()
  }, serverEnv.cozeSyncIntervalMs)
}
