import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  return handleApprove(request)
}

export async function POST(request: Request) {
  return handleApprove(request)
}

async function handleApprove(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data: brief, error: briefErr } = await supabase
    .from("pb_content_queue")
    .select("id, theme, post_type, platform, overlay_caption, caption_a, week_number")
    .eq("id", id)
    .maybeSingle()

  if (briefErr) {
    console.error("petmaster-approve-post: fetch brief:", briefErr)
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

  const { error } = await supabase
    .from("pb_content_queue")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("petmaster-approve-post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { error: histError } = await supabase.from("pb_review_history").insert({
    brief_id: id,
    decision: "approved",
    theme: brief.theme ?? null,
    post_type: brief.post_type ?? null,
    platform: brief.platform ?? null,
    overlay_caption: brief.overlay_caption ?? null,
    instagram_caption: brief.caption_a ?? null,
    social_post_url: asset?.social_post_url ?? null,
    week_number: brief.week_number ?? null,
    reviewed_by: "Stephan",
    reviewed_at: new Date().toISOString(),
  })

  if (histError) {
    console.error("petmaster-approve-post: pb_review_history:", histError)
    return NextResponse.json({ error: histError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
