import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

type OutreachListRow = {
  id: string
  created_at: string
  influencer_name: string | null
  email: string | null
  pet_name: string | null
  instagram_handle: string | null
  location: string | null
  followers: number | null
  credits_given: number | null
}

function hasPortraitUrl(row: {
  landscape_url?: string | null
  portrait_url?: string | null
  image_url?: string | null
}): boolean {
  const l = row.landscape_url?.trim()
  const p = row.portrait_url?.trim()
  const i = row.image_url?.trim()
  return Boolean(
    (l && l.length > 0) || (p && p.length > 0) || (i && i.length > 0),
  )
}

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data: rows, error } = await admin
    .from("influencer_outreach")
    .select(
      "id, created_at, influencer_name, email, pet_name, instagram_handle, location, followers, credits_given",
    )
    .not("email", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("petmaster-influencers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = (rows ?? []) as OutreachListRow[]
  const emails = [
    ...new Set(
      list
        .map((r: OutreachListRow) => r.email?.trim().toLowerCase())
        .filter((e: string | undefined): e is string => Boolean(e)),
    ),
  ]

  const portraitByEmail = new Set<string>()
  await Promise.all(
    emails.map(async (email) => {
      const { data: hits } = await admin
        .from("pet_portraits")
        .select("landscape_url, portrait_url, image_url")
        .ilike("user_email", email)
        .limit(25)
      if (hits?.some(hasPortraitUrl)) portraitByEmail.add(email)
    }),
  )

  const payload = list.map((row: OutreachListRow) => {
    const e = row.email?.trim().toLowerCase() ?? ""
    return {
      ...row,
      portrait_created: e ? portraitByEmail.has(e) : false,
    }
  })

  return NextResponse.json(payload)
}
