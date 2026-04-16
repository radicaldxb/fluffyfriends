import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data, error } = await admin
    .from("pet_portraits")
    .select(
      "id, pet_name, theme, status, user_email, portrait_url, landscape_url, created_at, showcase_consent, location",
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("petmaster-users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
