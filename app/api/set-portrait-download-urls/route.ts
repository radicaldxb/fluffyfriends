import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET?.trim()

/**
 * Called by n8n WF3 (upscale-and-email) after generating the print-ready files.
 * Stores landscape_url and portrait_url on the portrait row so My Portraits can show download links.
 * If your workflow already sends these links in the email, add an HTTP Request node that POSTs here
 * with the same portrait_id and URLs (e.g. from the same node that builds the email).
 */
export async function POST(request: NextRequest) {
  if (WEBHOOK_SECRET) {
    const provided =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Provide valid X-Webhook-Secret or Authorization: Bearer <secret>." },
        { status: 401 },
      )
    }
  }

  let body: Record<string, unknown>
  try {
    const raw = await request.text()
    if (!raw?.trim()) {
      return NextResponse.json(
        { error: "Empty body. Send JSON with portrait_id, landscape_url, portrait_url." },
        { status: 400 },
      )
    }
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    )
  }

  const portraitId =
    typeof body.portrait_id === "string" ? body.portrait_id.trim() : ""
  const landscapeUrl =
    typeof body.landscape_url === "string" ? body.landscape_url.trim() : ""
  const portraitUrl =
    typeof body.portrait_url === "string" ? body.portrait_url.trim() : ""

  if (!portraitId) {
    return NextResponse.json(
      { error: "Missing portrait_id." },
      { status: 400 },
    )
  }
  if (!landscapeUrl && !portraitUrl) {
    return NextResponse.json(
      { error: "Provide at least one of landscape_url or portrait_url." },
      { status: 400 },
    )
  }

  const updatePayload: Record<string, string> = {}
  if (landscapeUrl) updatePayload.landscape_url = landscapeUrl
  if (portraitUrl) updatePayload.portrait_url = portraitUrl

  const { error } = await supabase
    .from("pet_portraits")
    .update(updatePayload)
    .eq("id", portraitId)

  if (error) {
    console.error("[set-portrait-download-urls] Update error:", error)
    return NextResponse.json(
      { error: "Failed to update portrait", details: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
