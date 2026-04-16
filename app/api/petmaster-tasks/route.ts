import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

function uaeTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export async function GET(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  const url = new URL(request.url)
  const raw = url.searchParams.get("date")?.trim()
  const taskDate =
    raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : uaeTodayYmd()

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data, error } = await admin
    .from("ff_daily_tasks")
    .select("*")
    .eq("task_date", taskDate)
    .order("time_uae", { ascending: true })
    .order("type", { ascending: true })

  if (error) {
    console.error("petmaster-tasks:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
