import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET?.trim()

/**
 * WF2 quality-check: n8n POSTs preview Cloudinary URL after generation.
 * Persists portrait_url + landscape_url (same AVIF for preview) + image_url + status on pet_portraits.
 * Uses service role so RLS does not block server-side updates.
 */
export async function POST(request: NextRequest) {
  if (WEBHOOK_SECRET) {
    const provided =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
    if (provided !== WEBHOOK_SECRET) {
      console.error("[quality-check] Unauthorized webhook call")
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
      return NextResponse.json({ error: "Empty request body." }, { status: 400 })
    }
    body = JSON.parse(raw) as Record<string, unknown>
    console.log("[quality-check] received body keys:", Object.keys(body))
  } catch (e) {
    console.error("[quality-check] Invalid JSON:", e)
    return NextResponse.json(
      { error: "Invalid JSON body.", details: e instanceof Error ? e.message : "parse error" },
      { status: 400 },
    )
  }

  const portraitId =
    typeof body.portrait_id === "string" ? (body.portrait_id as string).trim() : ""
  const imageUrl =
    typeof body.image_url === "string" ? (body.image_url as string).trim() : ""
  const statusFromBody =
    typeof body.status === "string" ? (body.status as string).trim() : ""
  const status = statusFromBody || "preview"

  if (!portraitId) {
    return NextResponse.json({ error: "Missing portrait_id." }, { status: 400 })
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image_url." }, { status: 400 })
  }

  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (e) {
    console.error("[quality-check] SUPABASE_SERVICE_ROLE_KEY not configured:", e)
    return NextResponse.json(
      {
        error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is required for webhook updates.",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 503 },
    )
  }

  const updatePayload = {
    image_url: imageUrl,
    portrait_url: imageUrl,
    landscape_url: imageUrl,
    status,
  }

  const { data: updatedRows, error } = await supabaseAdmin
    .from("pet_portraits")
    .update(updatePayload)
    .eq("id", portraitId)
    .select("id")

  if (error) {
    console.error("[quality-check] Supabase update error:", error)
    return NextResponse.json(
      { error: "Failed to update pet_portraits", details: error.message, code: error.code },
      { status: 400 },
    )
  }
  if (!updatedRows?.length) {
    console.error("[quality-check] No row updated for portrait_id:", portraitId)
    return NextResponse.json(
      { error: "No pet_portraits row found for portrait_id", portrait_id: portraitId },
      { status: 400 },
    )
  }

  console.log("[quality-check] Updated portrait:", portraitId)
  return NextResponse.json(
    {
      success: true,
      portrait_id: portraitId,
      image_url: imageUrl,
      portrait_url: imageUrl,
      landscape_url: imageUrl,
      status,
    },
    { status: 200 },
  )
}
