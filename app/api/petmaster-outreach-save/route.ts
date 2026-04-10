import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const instagram_handle = typeof b.instagram_handle === "string" ? b.instagram_handle.trim() : ""
  const influencer_name = typeof b.influencer_name === "string" ? b.influencer_name.trim() : ""
  const pet_name = typeof b.pet_name === "string" ? b.pet_name.trim() : ""
  const followers =
    typeof b.followers === "number" && !Number.isNaN(b.followers)
      ? Math.round(b.followers)
      : null
  const post_reference =
    typeof b.post_reference === "string" && b.post_reference.trim()
      ? b.post_reference.trim()
      : null
  const observation =
    typeof b.observation === "string" && b.observation.trim() ? b.observation.trim() : null
  const dm_sent_at = typeof b.dm_sent_at === "string" ? b.dm_sent_at.trim() : ""

  if (!instagram_handle || !influencer_name || !pet_name || !dm_sent_at) {
    return NextResponse.json(
      { error: "instagram_handle, influencer_name, pet_name, and dm_sent_at are required" },
      { status: 400 },
    )
  }

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await admin.from("influencer_outreach").insert({
    instagram_handle,
    influencer_name,
    pet_name,
    followers,
    post_reference,
    observation,
    dm_sent_at,
  })

  if (error) {
    console.error("petmaster-outreach-save:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
