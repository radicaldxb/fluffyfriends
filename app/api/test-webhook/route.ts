import { NextResponse } from "next/server"

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const PING_TIMEOUT_MS = 15_000

/**
 * POST /api/test-webhook
 * Calls N8N_WEBHOOK_URL and returns whether it responded and how long it took.
 * Use with the diagnostic workflow (docs/n8n-diagnostic-webhook.json) to verify
 * the app can reach n8n without running the full transform-pet flow.
 */
export async function POST() {
  if (!WEBHOOK_URL?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "N8N_WEBHOOK_URL is not set",
        hint: "Set it in Netlify or .env.local (e.g. to the diagnostic webhook URL for this test).",
      },
      { status: 500 }
    )
  }

  const start = Date.now()
  let res: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
    res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ping: true, at: new Date().toISOString() }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch (err) {
    const responseTimeMs = Date.now() - start
    const message = err instanceof Error ? err.message : "Request failed"
    const isTimeout = message.includes("abort") || message.includes("timeout")
    return NextResponse.json({
      ok: false,
      error: isTimeout ? "Request timed out (15s)" : message,
      responseTimeMs,
      url: WEBHOOK_URL.replace(/\/[^/]+$/, "/…"),
    })
  }

  const responseTimeMs = Date.now() - start
  let bodyPreview: string | null = null
  try {
    const text = await res.text()
    bodyPreview = text.length > 200 ? text.slice(0, 200) + "…" : text || null
  } catch {
    // ignore
  }

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    responseTimeMs,
    bodyPreview: bodyPreview ?? undefined,
    url: WEBHOOK_URL.replace(/\/[^/]+$/, "/…"),
  })
}
