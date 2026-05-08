import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  return handleReject(request)
}

export async function POST(request: Request) {
  return handleReject(request)
}

async function handleReject(request: Request) {
  const cookieStore = await cookies()
  const authError = await petmasterUnauthorizedResponse(cookieStore)
  if (authError) return authError

  let body: {
    id?: string
    rejection_category?: string
    rejection_reason?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const rejection_category =
    typeof body.rejection_category === "string" ? body.rejection_category.trim() : ""
  if (!rejection_category) {
    return NextResponse.json({ error: "rejection_category is required" }, { status: 400 })
  }

  const rejection_reason =
    body.rejection_reason == null || String(body.rejection_reason).trim() === ""
      ? null
      : String(body.rejection_reason).trim().slice(0, 200)

  const now = new Date().toISOString()

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data: brief, error: briefErr } = await supabase
    .from("pb_content_queue")
    .select("id, theme, post_type, platform, overlay_caption, caption_a, week_number, reset_count")
    .eq("id", id)
    .maybeSingle()

  if (briefErr) {
    console.error("petmaster-reject-post: fetch brief:", briefErr)
    return NextResponse.json({ error: briefErr.message }, { status: 500 })
  }
  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 })
  }

  const { data: asset } = await supabase
    .from("pb_asset_store")
    .select("social_post_url")
    .eq("brief_id", id)
    .maybeSingle()

  const nextReset = (brief.reset_count ?? 0) + 1

  const { error } = await supabase
    .from("pb_content_queue")
    .update({
      status: "pending_creative",
      rejection_category,
      rejection_reason,
      rejected_at: now,
      reset_count: nextReset,
      updated_at: now,
    })
    .eq("id", id)

  if (error) {
    console.error("petmaster-reject-post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { error: delErr } = await supabase.from("pb_asset_store").delete().eq("brief_id", id)

  if (delErr) {
    console.error("petmaster-reject-post: delete asset:", delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  const { error: histError } = await supabase.from("pb_review_history").insert({
    brief_id: id,
    decision: "rejected",
    rejection_category,
    rejection_reason,
    theme: brief.theme ?? null,
    post_type: brief.post_type ?? null,
    platform: brief.platform ?? null,
    overlay_caption: brief.overlay_caption ?? null,
    instagram_caption: brief.caption_a ?? null,
    social_post_url: asset?.social_post_url ?? null,
    week_number: brief.week_number ?? null,
    retry_count: brief.reset_count ?? 0,
    reviewed_by: "Stephan",
    reviewed_at: now,
  })

  if (histError) {
    console.error("petmaster-reject-post: pb_review_history:", histError)
    return NextResponse.json({ error: histError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
