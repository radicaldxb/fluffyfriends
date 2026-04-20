import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type PortraitFilter = "all" | "test" | "real"

function parseFilter(value: string | null): PortraitFilter {
  if (value === "test" || value === "real") return value
  return "all"
}

/** Real tab: is_test false plus email rules (applied in code — PostgREST not/neq drops NULL emails). */
function matchesRealEmailRules(userEmail: string | null | undefined): boolean {
  if (userEmail == null || String(userEmail).trim() === "") return true
  const lower = String(userEmail).trim().toLowerCase()
  if (lower.includes("yopmail")) return false
  if (lower === "stephan@radical-thinking.net") return false
  return true
}

export async function GET(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const mode = parseFilter(searchParams.get("filter"))

  let query = admin
    .from("pet_portraits")
    .select(
      "id, pet_name, theme, status, user_email, portrait_url, landscape_url, created_at, showcase_consent, location, is_test",
    )

  if (mode === "test") {
    query = query.eq("is_test", true)
  } else if (mode === "real") {
    query = query.eq("is_test", false)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("petmaster-users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let rows = data ?? []
  if (mode === "real") {
    rows = rows.filter((row) => matchesRealEmailRules(row.user_email as string | null))
  }

  return NextResponse.json(rows)
}
