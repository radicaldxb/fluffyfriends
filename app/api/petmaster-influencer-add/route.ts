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
  const name = typeof b.name === "string" ? b.name.trim() : ""
  const emailRaw = typeof b.email === "string" ? b.email.trim() : ""
  const petName = typeof b.petName === "string" ? b.petName.trim() : ""
  const handle = typeof b.handle === "string" ? b.handle.trim() : ""
  const location = typeof b.location === "string" ? b.location.trim() : ""
  const followers =
    typeof b.followers === "number" && !Number.isNaN(b.followers)
      ? Math.round(b.followers)
      : null
  const credits =
    typeof b.credits === "number" && !Number.isNaN(b.credits)
      ? Math.round(b.credits)
      : 4

  if (!name || !emailRaw) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 })
  }

  const email = emailRaw.toLowerCase()

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const now = new Date().toISOString()
  const { error: insertError } = await admin.from("influencer_outreach").insert({
    influencer_name: name,
    email,
    pet_name: petName || null,
    instagram_handle: handle || null,
    location: location || null,
    followers: followers ?? null,
    credits_given: credits ?? 4,
    accepted: true,
    accepted_at: now,
    dm_sent_at: now,
  })

  if (insertError) {
    console.error("petmaster-influencer-add insert:", insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (location) {
    const { error: locError } = await admin
      .from("pet_portraits")
      .update({ location })
      .ilike("user_email", email)
      .is("location", null)

    if (locError) {
      console.error("petmaster-influencer-add location update:", locError)
      return NextResponse.json({ error: locError.message }, { status: 500 })
    }
  }

  const { error: showcaseError } = await admin
    .from("pet_portraits")
    .update({ showcase_consent: true })
    .ilike("user_email", email)
    .eq("showcase_consent", false)

  if (showcaseError) {
    console.error("petmaster-influencer-add showcase update:", showcaseError)
    return NextResponse.json({ error: showcaseError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
