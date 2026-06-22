import { randomUUID } from "node:crypto"
import { URL } from "node:url"

export type JsonHandler = (request: ApiRequest) => Promise<ResponsePayload> | ResponsePayload

export type ResponsePayload = {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

export type ApiRequest = {
  method: string
  url: URL
  headers: Headers
  requestId: string
  json: <T>() => Promise<T>
}

export type Route = {
  method: string
  pattern: RegExp
  handler: JsonHandler
}

export function route(method: string, pattern: RegExp, handler: JsonHandler): Route {
  return { method, pattern, handler }
}

export async function readJson<T>(request: Request) {
  const text = await request.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export async function handleRequest(
  request: Request,
  routes: Route[],
  options: { corsOrigins: string[] },
) {
  const requestUrl = new URL(request.url)
  const requestId = randomUUID()
  const corsHeaders = getCorsHeaders(request, options.corsOrigins)

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    })
  }

  const matched = routes.find(
    (candidate) => candidate.method === request.method && candidate.pattern.test(requestUrl.pathname),
  )

  if (!matched) {
    return Response.json(
      { error: "not found", request_id: requestId },
      { status: 404, headers: corsHeaders },
    )
  }

  try {
    const payload = await matched.handler({
      method: request.method,
      url: requestUrl,
      headers: request.headers,
      requestId,
      json: () => readJson(request),
    })

    return Response.json(payload.body ?? {}, {
      status: payload.status ?? 200,
      headers: {
        ...corsHeaders,
        ...payload.headers,
        "X-Request-Id": requestId,
      },
    })
  } catch (error) {
    console.error(`[api] ${requestId}`, error)

    return Response.json(
      {
        error: error instanceof Error ? error.message : "internal server error",
        request_id: requestId,
      },
      { status: 500, headers: { ...corsHeaders, "X-Request-Id": requestId } },
    )
  }
}

function getCorsHeaders(request: Request, allowedOrigins: string[]) {
  const origin = request.headers.get("origin")
  const allowOrigin =
    origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) ? origin : allowedOrigins[0]

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
  }
}
