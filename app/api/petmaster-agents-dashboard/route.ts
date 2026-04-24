import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import {
  buildCurrentISOWeekDayColumns,
  getISOCalendarInfoUTC,
  getScheduledUTCDayKey,
} from "@/lib/iso-week"

export const dynamic = "force-dynamic"

type QueueRow = {
  id: string
  theme: string | null
  post_type: string | null
  platform: string | null
  status: string | null
  overlay_caption: string | null
  scheduled_for: string | null
  week_number: number | null
}

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const now = new Date()
  const { weekNumber } = getISOCalendarInfoUTC(now)
  const weekColumns = buildCurrentISOWeekDayColumns(now)

  const [healthResult, queueResult, reportResult] = await Promise.all([
    supabase
      .from("pb_system_health_log")
      .select("check_type, severity, finding, action_taken, created_at")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("pb_content_queue")
      .select("id, theme, post_type, platform, status, overlay_caption, scheduled_for, week_number")
      .eq("week_number", weekNumber)
      .order("scheduled_for", { ascending: true }),
    supabase
      .from("pb_weekly_reports")
      .select(
        "week_number, week_year, report_type, key_insight, recommendations, created_at, top_posts, underperformers",
      )
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  if (healthResult.error) {
    console.error("petmaster-agents-dashboard health:", healthResult.error)
    return NextResponse.json({ error: healthResult.error.message }, { status: 500 })
  }
  if (queueResult.error) {
    console.error("petmaster-agents-dashboard queue:", queueResult.error)
    return NextResponse.json({ error: queueResult.error.message }, { status: 500 })
  }
  if (reportResult.error) {
    console.error("petmaster-agents-dashboard report:", reportResult.error)
    return NextResponse.json({ error: reportResult.error.message }, { status: 500 })
  }

  const queue = (queueResult.data ?? []) as QueueRow[]
  const queueByDay: Record<string, QueueRow[]> = {}
  for (const row of queue) {
    const k = getScheduledUTCDayKey(row.scheduled_for)
    if (!k) continue
    if (!queueByDay[k]) queueByDay[k] = []
    queueByDay[k].push(row)
  }

  return NextResponse.json({
    health: healthResult.data?.[0] ?? null,
    queue,
    queue_by_day: queueByDay,
    report: reportResult.data?.[0] ?? null,
    week_number: weekNumber,
    week_columns: weekColumns,
  })
}
