import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

/** UTC date bounds for "today" (matches typical DB date semantics for daily jobs). */
function utcTodayBounds(): { start: string; end: string } {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0))
  const end = new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0))
  return { start: start.toISOString(), end: end.toISOString() }
}

function rollingSevenDaysStart(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
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

  const { start, end } = utcTodayBounds()
  const since7d = rollingSevenDaysStart()

  const base = () => admin.from("pet_portraits").select("*", { count: "exact", head: true }).eq("is_test", false)

  const [previewsToday, paidToday, previews7d, paid7d] = await Promise.all([
    base().eq("status", "preview").gte("created_at", start).lt("created_at", end),
    base().eq("status", "completed").gte("created_at", start).lt("created_at", end),
    base().eq("status", "preview").gte("created_at", since7d),
    base().eq("status", "completed").gte("created_at", since7d),
  ])

  const errors = [previewsToday.error, paidToday.error, previews7d.error, paid7d.error].filter(Boolean)
  if (errors.length > 0) {
    console.error("petmaster-funnel:", errors[0])
    return NextResponse.json({ error: errors[0]?.message ?? "Query failed" }, { status: 500 })
  }

  const previews_7d = previews7d.count ?? 0
  const paid_7d = paid7d.count ?? 0

  return NextResponse.json({
    previews_today: previewsToday.count ?? 0,
    paid_today: paidToday.count ?? 0,
    previews_7d,
    paid_7d,
    conversion_7d_pct: previews_7d === 0 ? null : (paid_7d / previews_7d) * 100,
  })
}
