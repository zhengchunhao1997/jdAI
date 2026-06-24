import { z } from "zod"

const nullableString = z.preprocess(emptyToUndefined, z.string().optional())
const nullableInt = z.preprocess(emptyToUndefined, z.coerce.number().int().optional())
const nullableNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional())
const nullableBoolean = z.preprocess(emptyToUndefined, z.coerce.boolean().optional())

const collectionSchema = z.object({
  resource_id: nullableString,
  collection_name: nullableString,
  project: nullableString,
})

const searchSchema = collectionSchema.extend({
  query: z.string().min(1),
  limit: nullableInt.default(5),
  dense_weight: nullableNumber.default(0.5),
})

const listDocsSchema = collectionSchema.extend({
  offset: nullableInt.default(0),
  limit: nullableInt.default(50),
  doc_type: nullableString,
  return_token_usage: nullableBoolean.default(false),
})

const listPointsSchema = collectionSchema.extend({
  offset: nullableInt.default(0),
  limit: nullableInt.default(50),
  doc_ids: z.array(z.string()).optional(),
  point_ids: z.array(z.string()).optional(),
  get_attachment_link: nullableBoolean.default(false),
})

const addPointSchema = collectionSchema.extend({
  doc_id: z.string().min(1),
  chunk_type: z.string().min(1).default("text"),
  chunk_title: nullableString,
  content: nullableString,
  question: nullableString,
  fields: z.array(z.record(z.string(), z.unknown())).optional(),
})

const updatePointSchema = collectionSchema.extend({
  point_id: z.string().min(1),
  chunk_title: nullableString,
  content: nullableString,
  question: nullableString,
  fields: z.array(z.record(z.string(), z.unknown())).optional(),
})

const deletePointSchema = collectionSchema.extend({
  point_id: z.string().min(1),
})

const endpoints = {
  searchKnowledge: "/api/knowledge/collection/search_knowledge",
  listDocs: "/api/knowledge/doc/list",
  listPoints: "/api/knowledge/point/list",
  addPoint: "/api/knowledge/point/add",
  updatePoint: "/api/knowledge/point/update",
  deletePoint: "/api/knowledge/point/delete",
} as const

type VolcResult = {
  status: number
  body: unknown
}

export function getVolcKnowledgeStatus(headers?: Headers): VolcResult {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  return {
    status: 200,
    body: {
      ok: true,
      configured: Boolean(process.env.VOLC_KNOWLEDGE_API_KEY),
      base_url: getBaseUrl(),
      resource_id_configured: Boolean(process.env.VOLC_KNOWLEDGE_RESOURCE_ID),
      collection_name_configured: Boolean(process.env.VOLC_KNOWLEDGE_COLLECTION_NAME),
      project: process.env.VOLC_KNOWLEDGE_PROJECT ?? "default",
      default_doc_id_configured: Boolean(process.env.VOLC_KNOWLEDGE_DOC_ID),
    },
  }
}

export async function searchVolcKnowledge(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(searchSchema, body)
  if (!input.ok) return input

  return callVolcKnowledge(endpoints.searchKnowledge, {
    ...collectionPayload(input.data),
    query: input.data.query,
    limit: input.data.limit,
    dense_weight: input.data.dense_weight,
  })
}

export async function listVolcKnowledgeDocs(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(listDocsSchema, body)
  if (!input.ok) return input

  return callVolcKnowledge(endpoints.listDocs, {
    ...collectionPayload(input.data),
    offset: input.data.offset,
    limit: input.data.limit,
    doc_type: input.data.doc_type,
    return_token_usage: input.data.return_token_usage,
  })
}

export async function listVolcKnowledgePoints(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(listPointsSchema, body)
  if (!input.ok) return input

  return callVolcKnowledge(endpoints.listPoints, {
    ...collectionPayload(input.data),
    offset: input.data.offset,
    limit: input.data.limit,
    doc_ids: input.data.doc_ids,
    point_ids: input.data.point_ids,
    get_attachment_link: input.data.get_attachment_link,
  })
}

export async function addVolcKnowledgePoint(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(addPointSchema, withDefaultDocId(body))
  if (!input.ok) return input
  if (!input.data.content && !input.data.question && !input.data.fields?.length) {
    return validationError("content, question or fields is required")
  }

  return callVolcKnowledge(endpoints.addPoint, {
    ...collectionPayload(input.data),
    doc_id: input.data.doc_id,
    chunk_type: input.data.chunk_type,
    chunk_title: input.data.chunk_title,
    content: input.data.content,
    question: input.data.question,
    fields: input.data.fields,
  })
}

export async function updateVolcKnowledgePoint(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(updatePointSchema, body)
  if (!input.ok) return input

  return callVolcKnowledge(endpoints.updatePoint, {
    ...collectionPayload(input.data),
    point_id: input.data.point_id,
    chunk_title: input.data.chunk_title,
    content: input.data.content,
    question: input.data.question,
    fields: input.data.fields,
  })
}

export async function deleteVolcKnowledgePoint(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(deletePointSchema, body)
  if (!input.ok) return input

  return callVolcKnowledge(endpoints.deletePoint, {
    ...collectionPayload(input.data),
    point_id: input.data.point_id,
  })
}

async function callVolcKnowledge(path: string, payload: Record<string, unknown>): Promise<VolcResult> {
  const apiKey = process.env.VOLC_KNOWLEDGE_API_KEY
  if (!apiKey) {
    return {
      status: 500,
      body: {
        ok: false,
        error: {
          code: "VOLC_KNOWLEDGE_NOT_CONFIGURED",
          message: "VOLC_KNOWLEDGE_API_KEY is not configured",
        },
      },
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(removeUndefined(payload)),
  })

  const text = await response.text()
  const parsed = parseJson(text)

  return {
    status: response.ok ? 200 : response.status,
    body: {
      ok: response.ok,
      upstream_status: response.status,
      data: parsed ?? text,
    },
  }
}

function verifyApiKey(headers?: Headers): VolcResult & { ok: false } | { ok: true } {
  const configuredKey = process.env.JIDAH_API_KEY
  if (!configuredKey) return { ok: true }

  const auth = headers?.get("authorization") ?? ""
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1]
  if (token === configuredKey) return { ok: true }

  return {
    ok: false,
    status: 401,
    body: {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "invalid api key",
      },
    },
  }
}

function parseBody<T>(schema: z.ZodType<T>, body: unknown): { ok: true; data: T } | VolcResult & { ok: false } {
  const parsed = schema.safeParse(body)
  if (parsed.success) return { ok: true, data: parsed.data }
  return validationError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "))
}

function validationError(message: string): VolcResult & { ok: false } {
  return {
    ok: false,
    status: 400,
    body: {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    },
  }
}

function collectionPayload(input: z.infer<typeof collectionSchema>) {
  const resourceId = input.resource_id ?? process.env.VOLC_KNOWLEDGE_RESOURCE_ID
  const collectionName = input.collection_name ?? process.env.VOLC_KNOWLEDGE_COLLECTION_NAME
  const project = input.project ?? process.env.VOLC_KNOWLEDGE_PROJECT ?? "default"

  return {
    resource_id: resourceId,
    collection_name: collectionName,
    project,
  }
}

function withDefaultDocId(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body
  if ("doc_id" in body) return body
  const docId = process.env.VOLC_KNOWLEDGE_DOC_ID
  if (!docId) return body
  return { ...body, doc_id: docId }
}

function getBaseUrl() {
  return process.env.VOLC_KNOWLEDGE_BASE_URL ?? "https://api-knowledgebase.mlp.cn-beijing.volces.com"
}

function removeUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function emptyToUndefined(value: unknown) {
  if (value === undefined || value === null) return undefined
  if (typeof value === "string" && value.trim() === "") return undefined
  return value
}
