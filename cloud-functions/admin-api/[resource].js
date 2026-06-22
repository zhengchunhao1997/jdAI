const DEFAULT_BACKEND_URL = "http://1.92.99.77:39080";
const ALLOWED_RESOURCES = new Set([
  "overview",
  "sessions",
  "leads",
  "handoffs",
  "missed-questions",
  "knowledge",
  "analytics",
  "settings",
]);

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequest(context) {
  const resource = context.params.resource;
  if (!ALLOWED_RESOURCES.has(resource)) {
    return json({ error: "admin resource not found" }, 404);
  }

  const backendUrl = context.env.API_PROXY_TARGET || context.env.BACKEND_API_URL || DEFAULT_BACKEND_URL;
  const incomingUrl = new URL(context.request.url);
  const targetUrl = new URL(`/api/admin/${resource}${incomingUrl.search}`, backendUrl);
  const method = context.request.method.toUpperCase();
  const headers = {
    "Content-Type": context.request.headers.get("Content-Type") || "application/json",
  };

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : await context.request.text(),
    });
    const responseHeaders = corsHeaders();
    responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "application/json");
    responseHeaders.set("Cache-Control", "no-store");

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return json(
      {
        error: "admin proxy failed",
        message: error instanceof Error ? error.message : "unknown error",
      },
      502,
    );
  }
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}
