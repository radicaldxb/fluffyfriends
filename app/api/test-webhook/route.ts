import { NextResponse } from "next/server"

const PING_TIMEOUT_MS = 15_000

/**
 * POST /api/test-webhook
 * Pings the webhook URL and returns whether it responded and how long it took.
 * Uses N8N_PING_WEBHOOK_URL if set (e.g. test-production-url workflow), otherwise N8N_WEBHOOK_URL.
 * So you can keep N8N_WEBHOOK_URL for /create and set N8N_PING_WEBHOOK_URL for the Ping button.
 */
export async function POST() {
  const webhookUrl =
    process.env.N8N_PING_WEBHOOK_URL?.trim() || process.env.N8N_WEBHOOK_URL?.trim()
  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "No webhook URL set",
        hint: "Set N8N_WEBHOOK_URL or N8N_PING_WEBHOOK_URL in Netlify or .env.local.",
      },
      { status: 500 }
    )
  }

  const start = Date.now()
  let res: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
    res = await fetch(webhookUrl, {
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
      url: webhookUrl.replace(/\/[^/]+$/, "/…"),
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
    url: webhookUrl.replace(/\/[^/]+$/, "/…"),
  })
}
