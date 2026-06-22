import { prisma } from "@/lib/prisma"
import {
  customerLeadSchema,
  conversationEventSchema,
  kbMissQuestionSchema,
  mapConversationEvent,
  mapCustomerLead,
  mapKbMissQuestion,
} from "@/lib/customer-service-records"

type SyncSource = {
  source: string
  databaseId?: string
  cursorField?: "created_at" | "updated_at"
  mode: "upsert" | "insert-only"
  fullScan?: boolean
}

type SyncResult = {
  source: string
  databaseId?: string
  skippedReason?: string
  fetched: number
  created: number
  updated: number
  skipped: number
  lastSyncAt?: string
}

const pageSize = Number(process.env.COZE_SYNC_PAGE_SIZE ?? 1000)
const lookbackMs = Number(process.env.COZE_SYNC_LOOKBACK_MINUTES ?? 2) * 60 * 1000
const initialLookbackHours = Number(process.env.COZE_SYNC_INITIAL_LOOKBACK_HOURS ?? 168)

const sources: SyncSource[] = [
  {
    source: "customer_leads",
    databaseId: process.env.COZE_CUSTOMER_LEADS_DATABASE_ID ?? "7653331147044290612",
    mode: "upsert",
    fullScan: true,
  },
  {
    source: "conversation_events",
    databaseId: process.env.COZE_CONVERSATION_EVENTS_DATABASE_ID ?? "7653461773185548323",
    cursorField: "created_at",
    mode: "insert-only",
  },
  {
    source: "kb_miss_questions",
    databaseId: process.env.COZE_KB_MISS_QUESTIONS_DATABASE_ID ?? "7653767982828552228",
    cursorField: "created_at",
    mode: "insert-only",
  },
]

export async function runCozeSync() {
  const results = []

  for (const source of sources) {
    results.push(await syncSource(source))
  }

  return {
    status: 200,
    body: {
      ok: results.every((result) => !result.skippedReason),
      results,
    },
  }
}

async function syncSource(source: SyncSource): Promise<SyncResult> {
  if (!source.databaseId) {
    return {
      source: source.source,
      skippedReason: "database id is not configured",
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
    }
  }

  const state = await prisma.cozeSyncState.upsert({
    where: { source: source.source },
    create: {
      source: source.source,
      databaseId: source.databaseId,
      cursorField: source.cursorField ?? "none",
    },
    update: {
      databaseId: source.databaseId,
      cursorField: source.cursorField ?? "none",
    },
  })

  try {
    const queryAfter = new Date(
      (state.lastSyncAt?.getTime() ?? Date.now() - initialLookbackHours * 60 * 60 * 1000) - lookbackMs,
    )
    const items = await queryCozeDatabase(source.databaseId, source.cursorField, queryAfter)
    let created = 0
    let updated = 0
    let skipped = 0
    let maxCursor = state.lastSyncAt ?? queryAfter

    for (const item of items) {
      const result = await persistItem(source, item)
      created += result.created
      updated += result.updated
      skipped += result.skipped

      const cursor = source.cursorField ? parseCozeDate(item[source.cursorField]) : null
      if (cursor && cursor > maxCursor) maxCursor = cursor
    }

    await prisma.cozeSyncState.update({
      where: { source: source.source },
      data: {
        lastSyncAt: maxCursor,
        lastRunAt: new Date(),
        lastStatus: "success",
        lastError: null,
        fetchedCount: items.length,
        createdCount: created,
        updatedCount: updated,
        skippedCount: skipped,
      },
    })

    return {
      source: source.source,
      databaseId: source.databaseId,
      fetched: items.length,
      created,
      updated,
      skipped,
      lastSyncAt: maxCursor.toISOString(),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown coze sync error"

    await prisma.cozeSyncState.update({
      where: { source: source.source },
      data: {
        lastRunAt: new Date(),
        lastStatus: "failed",
        lastError: message,
      },
    })

    return {
      source: source.source,
      databaseId: source.databaseId,
      skippedReason: message,
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
    }
  }
}

async function queryCozeDatabase(databaseId: string, cursorField: string | undefined, after: Date) {
  const token =
    process.env.COZE_DATABASE_API_TOKEN ??
    process.env.COZE_XIAOLANMAO_API_TOKEN ??
    process.env.COZE_API_TOKEN

  if (!token) throw new Error("COZE_DATABASE_API_TOKEN, COZE_XIAOLANMAO_API_TOKEN or COZE_API_TOKEN is required")

  const response = await fetch(`https://api.coze.cn/v1/databases/${databaseId}/records/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: Math.min(Math.max(pageSize, 1), 1000),
      ...(cursorField
        ? {
            filter: {
        logic: "and",
        conditions: [
          {
            left: cursorField,
            operation: "greater_than",
            right: formatCozeDate(after),
          },
        ],
      },
          }
        : {}),
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.code !== 0) {
    throw new Error(`Coze query failed: ${response.status} ${payload?.msg ?? response.statusText}`)
  }

  return Array.isArray(payload.data?.items) ? payload.data.items : []
}

async function persistItem(source: SyncSource, item: Record<string, unknown>) {
  if (source.source === "customer_leads") {
    const record = customerLeadSchema.parse({ ...item, coze_record_id: String(item.id) })
    const existing = await prisma.customerLeadRecord.findUnique({
      where: { cozeRecordId: String(item.id) },
      select: { id: true },
    })

    await prisma.customerLeadRecord.upsert({
      where: { cozeRecordId: String(item.id) },
      create: mapCustomerLead(record),
      update: mapCustomerLead(record),
    })

    return { created: existing ? 0 : 1, updated: existing ? 1 : 0, skipped: 0 }
  }

  if (source.source === "conversation_events") {
    const record = conversationEventSchema.parse({ ...item, coze_record_id: String(item.id) })
    const result = await prisma.conversationEventRecord.createMany({
      data: [mapConversationEvent(record)],
      skipDuplicates: true,
    })

    return { created: result.count, updated: 0, skipped: result.count === 0 ? 1 : 0 }
  }

  const record = kbMissQuestionSchema.parse({ ...item, coze_record_id: String(item.id) })
  const result = await prisma.kbMissQuestionRecord.createMany({
    data: [mapKbMissQuestion(record)],
    skipDuplicates: true,
  })

  return { created: result.count, updated: 0, skipped: result.count === 0 ? 1 : 0 }
}

function parseCozeDate(value: unknown) {
  if (typeof value !== "string") return null
  const normalized = value
    .replace(/\s+CST$/, "")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1970) return null
  return date
}

function formatCozeDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second} +0800 CST`
}
