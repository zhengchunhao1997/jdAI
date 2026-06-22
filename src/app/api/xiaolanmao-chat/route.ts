const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://1.92.99.77:39080"

export async function POST(request: Request) {
  try {
    const targetUrl = new URL("/api/xiaolanmao-chat", apiProxyTarget)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    })

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (error) {
    return Response.json(
      {
        error: "xiaolanmao proxy failed",
        detail: error instanceof Error ? error.message : String(error),
        target: apiProxyTarget,
      },
      { status: 502 },
    )
  }
}
