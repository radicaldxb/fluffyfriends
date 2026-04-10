import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

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
    .from("ff_analytics_daily")
    .select("*")
    .order("date", { ascending: false })
    .limit(7)

  if (error) {
    console.error("petmaster-analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rows: data ?? [] })
}
