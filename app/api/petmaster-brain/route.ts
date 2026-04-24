import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const [posRes, guideRes, decisionsRes, playbookRes] = await Promise.all([
    supabase.from("pb_brand_positioning").select("*").order("key", { ascending: true }),
    supabase.from("pb_brand_guide").select("*").order("category", { ascending: true }).order("key", { ascending: true }),
    supabase
      .from("pb_product_decisions")
      .select("id, decision_date, title, decision, rationale, content_impact, owner, status, updated_at")
      .eq("status", "active")
      .order("decision_date", { ascending: false }),
    supabase
      .from("pb_playbook")
      .select("id, category, rule, confidence, source, rationale, active, created_at, updated_at")
      .eq("active", true),
  ])

  if (posRes.error) {
    console.error("petmaster-brain positioning:", posRes.error)
    return NextResponse.json({ error: posRes.error.message }, { status: 500 })
  }
  if (guideRes.error) {
    console.error("petmaster-brain brand_guide:", guideRes.error)
    return NextResponse.json({ error: guideRes.error.message }, { status: 500 })
  }
  if (decisionsRes.error) {
    console.error("petmaster-brain decisions:", decisionsRes.error)
    return NextResponse.json({ error: decisionsRes.error.message }, { status: 500 })
  }
  if (playbookRes.error) {
    console.error("petmaster-brain playbook:", playbookRes.error)
    return NextResponse.json({ error: playbookRes.error.message }, { status: 500 })
  }

  // Sort playbook: confidence desc then category - Supabase may need multi-column; client can refine
  const playbook = [...(playbookRes.data ?? [])]
  const confOrder: Record<string, number> = {
    proven: 5,
    high: 4,
    medium: 3,
    low: 2,
    assumed: 1,
  }
  playbook.sort((a, b) => {
    const ca = String((a as { confidence?: string }).confidence ?? "").toLowerCase()
    const cb = String((b as { confidence?: string }).confidence ?? "").toLowerCase()
    const oa = confOrder[ca] ?? 0
    const ob = confOrder[cb] ?? 0
    if (ob !== oa) return ob - oa
    const catA = String((a as { category?: string }).category ?? "")
    const catB = String((b as { category?: string }).category ?? "")
    return catA.localeCompare(catB)
  })

  return NextResponse.json({
    positioning: posRes.data ?? [],
    brand_guide: guideRes.data ?? [],
    decisions: decisionsRes.data ?? [],
    playbook,
  })
}
