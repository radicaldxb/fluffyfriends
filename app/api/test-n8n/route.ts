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

  const body = await request.json()
  const test_image = typeof body.test_image === "string" ? body.test_image : ""
  const name = typeof body.name === "string" ? body.name : "Test Pet"

  const payload = { test_image, name }

  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("Error dispatching to n8n webhook", err)
  })

  // Immediately tell the client that the job has been queued
  return NextResponse.json({ queued: true })
}
