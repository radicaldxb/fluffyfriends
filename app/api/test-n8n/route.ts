import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export async function POST(request: NextRequest) {
  if (!WEBHOOK_URL?.trim()) {
    return NextResponse.json(
      {
        error: "N8N_WEBHOOK_URL is not set",
        hint: "Add N8N_WEBHOOK_URL in Netlify: Site settings → Build & deploy → Environment variables",
      },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const test_image = typeof body.test_image === "string" ? body.test_image : ""
    const name = typeof body.name === "string" ? body.name : "Test Pet"

    const payload = { test_image, name }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    let res: Response
    try {
      res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } catch (fetchErr) {
      clearTimeout(timeoutId)
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        throw new Error("Request timeout after 30 seconds")
      }
      throw new Error(`Network error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`)
    }
    clearTimeout(timeoutId)

    const text = await res.text()
    let data: unknown = text
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      // leave as text
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "n8n webhook error",
          status: res.status,
          statusText: res.statusText,
          body: data,
          url: WEBHOOK_URL,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, response: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed"
    const stack = err instanceof Error ? err.stack : undefined
    return NextResponse.json(
      {
        error: message,
        stack: process.env.NODE_ENV === "development" ? stack : undefined,
        url: WEBHOOK_URL,
      },
      { status: 500 }
    )
  }
}
