import { z } from "zod"

import { prisma } from "@/lib/prisma"

const nullableString = z.preprocess(emptyToUndefined, z.string().optional())
const nullableInt = z.preprocess(emptyToUndefined, z.coerce.number().int().optional())
const nullableNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional())
const nullableBoolean = z.preprocess(emptyToUndefined, z.coerce.boolean().optional())

const collectionSchema = z.object({
  tenant_id: nullableString,
  tenant_code: nullableString,
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

const tenantConfigSchema = z.object({
  tenant_id: nullableString,
  tenant_code: nullableString,
  resource_id: z.string().min(1),
  collection_name: z.string().min(1),
  project: nullableString,
  doc_id: nullableString,
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

type TenantKnowledgeConfig = {
  resource_id?: string
  collection_name?: string
  project?: string
  doc_id?: string
}

export async function getVolcKnowledgeStatus(searchParams: URLSearchParams, headers?: Headers): Promise<VolcResult> {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const tenantResult = await resolveTenantKnowledgeConfig({
    tenant_id: searchParams.get("tenant_id") ?? undefined,
    tenant_code: searchParams.get("tenant_code") ?? undefined,
  })
  if (!tenantResult.ok) return tenantResult

  return {
    status: 200,
    body: {
      ok: true,
      configured: Boolean(process.env.VOLC_KNOWLEDGE_API_KEY),
      base_url: getBaseUrl(),
      tenant: tenantResult.tenant,
      resource_id_configured: Boolean(tenantResult.config.resource_id),
      collection_name_configured: Boolean(tenantResult.config.collection_name),
      project: tenantResult.config.project ?? "default",
      default_doc_id_configured: Boolean(tenantResult.config.doc_id),
    },
  }
}

export async function searchVolcKnowledge(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(searchSchema, body)
  if (!input.ok) return input

  const config = await resolveTenantKnowledgeConfig(input.data)
  if (!config.ok) return config

  return callVolcKnowledge(endpoints.searchKnowledge, {
    ...collectionPayload(input.data, config.config),
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

  const config = await resolveTenantKnowledgeConfig(input.data)
  if (!config.ok) return config

  return callVolcKnowledge(endpoints.listDocs, {
    ...collectionPayload(input.data, config.config),
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

  const config = await resolveTenantKnowledgeConfig(input.data)
  if (!config.ok) return config

  return callVolcKnowledge(endpoints.listPoints, {
    ...collectionPayload(input.data, config.config),
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

  const config = await resolveTenantKnowledgeConfig(body)
  if (!config.ok) return config

  const input = parseBody(addPointSchema, withDefaultDocId(body, config.config))
  if (!input.ok) return input
  if (!input.data.content && !input.data.question && !input.data.fields?.length) {
    return validationError("content, question or fields is required")
  }

  return callVolcKnowledge(endpoints.addPoint, {
    ...collectionPayload(input.data, config.config),
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
  const config = await resolveTenantKnowledgeConfig(input.data)
  if (!config.ok) return config

  return callVolcKnowledge(endpoints.updatePoint, {
    ...collectionPayload(input.data, config.config),
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
  const config = await resolveTenantKnowledgeConfig(input.data)
  if (!config.ok) return config

  return callVolcKnowledge(endpoints.deletePoint, {
    ...collectionPayload(input.data, config.config),
    point_id: input.data.point_id,
  })
}

export async function updateTenantVolcKnowledgeConfig(body: unknown, headers?: Headers) {
  const auth = verifyApiKey(headers)
  if (!auth.ok) return auth

  const input = parseBody(tenantConfigSchema, body)
  if (!input.ok) return input

  const tenant = await prisma.v2Tenant.findFirst({
    where: input.data.tenant_id ? { id: input.data.tenant_id } : { code: input.data.tenant_code },
    select: { id: true, code: true, name: true, settingsJson: true },
  })
  if (!tenant) {
    return {
      status: 404,
      body: {
        ok: false,
        error: {
          code: "TENANT_NOT_FOUND",
          message: "tenant not found",
        },
      },
    }
  }

  const currentSettings =
    tenant.settingsJson && typeof tenant.settingsJson === "object" && !Array.isArray(tenant.settingsJson)
      ? tenant.settingsJson as Record<string, unknown>
      : {}

  const settingsJson = {
    ...currentSettings,
    volc_knowledge: {
      resource_id: input.data.resource_id,
      collection_name: input.data.collection_name,
      project: input.data.project ?? "default",
      doc_id: input.data.doc_id,
    },
  }

  await prisma.v2Tenant.update({
    where: { id: tenant.id },
    data: { settingsJson },
  })

  return {
    status: 200,
    body: {
      ok: true,
      tenant: {
        id: tenant.id,
        code: tenant.code,
        name: tenant.name,
      },
      volc_knowledge: settingsJson.volc_knowledge,
    },
  }
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

async function resolveTenantKnowledgeConfig(input: unknown): Promise<
  | { ok: true; config: TenantKnowledgeConfig; tenant: { id: string; code: string; name: string } | null }
  | VolcResult & { ok: false }
> {
  const tenantInput = collectionSchema.partial().safeParse(input)
  if (!tenantInput.success) return validationError("invalid tenant knowledge config input")

  const tenantId = tenantInput.data.tenant_id
  const tenantCode = tenantInput.data.tenant_code
  if (!tenantId && !tenantCode) {
    return validationError("tenant_id or tenant_code is required")
  }

  const tenant = await prisma.v2Tenant.findFirst({
    where: tenantId ? { id: tenantId } : { code: tenantCode },
    select: { id: true, code: true, name: true, settingsJson: true },
  })
  if (!tenant) {
    return {
      ok: false,
      status: 404,
      body: {
        ok: false,
        error: {
          code: "TENANT_NOT_FOUND",
          message: "tenant not found",
        },
      },
    }
  }

  const config = getTenantKnowledgeConfig(tenant.settingsJson)
  return {
    ok: true,
    tenant: { id: tenant.id, code: tenant.code, name: tenant.name },
    config,
  }
}

function getTenantKnowledgeConfig(settingsJson: unknown): TenantKnowledgeConfig {
  if (!settingsJson || typeof settingsJson !== "object" || Array.isArray(settingsJson)) return {}
  const settings = settingsJson as Record<string, unknown>
  const volc = settings.volc_knowledge
  if (!volc || typeof volc !== "object" || Array.isArray(volc)) return {}

  const config = volc as Record<string, unknown>
  return {
    resource_id: stringOrUndefined(config.resource_id),
    collection_name: stringOrUndefined(config.collection_name),
    project: stringOrUndefined(config.project),
    doc_id: stringOrUndefined(config.doc_id),
  }
}

function collectionPayload(input: z.infer<typeof collectionSchema>, config: TenantKnowledgeConfig) {
  const resourceId = input.resource_id ?? config.resource_id
  const collectionName = input.collection_name ?? config.collection_name
  const project = input.project ?? config.project ?? "default"

  return {
    resource_id: resourceId,
    collection_name: collectionName,
    project,
  }
}

function withDefaultDocId(body: unknown, config: TenantKnowledgeConfig) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body
  if ("doc_id" in body) return body
  const docId = config.doc_id
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

function stringOrUndefined(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}
