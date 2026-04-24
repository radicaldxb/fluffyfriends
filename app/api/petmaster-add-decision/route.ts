import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type Body = {
  decision_date?: string
  title?: string
  decision?: string
  rationale?: string
  content_impact?: string
  owner?: string
}

export async function POST(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const decision = typeof body.decision === "string" ? body.decision.trim() : ""
  if (!title || !decision) {
    return NextResponse.json({ error: "title and decision are required" }, { status: 400 })
  }

  const decision_date =
    typeof body.decision_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.decision_date.trim())
      ? body.decision_date.trim()
      : new Date().toISOString().slice(0, 10)

  const row = {
    decision_date,
    title,
    decision,
    rationale: body.rationale == null ? null : String(body.rationale),
    content_impact: body.content_impact == null ? null : String(body.content_impact),
    owner: typeof body.owner === "string" && body.owner.trim() ? body.owner.trim() : "Stephan",
    status: "active" as const,
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pb_product_decisions").insert(row as never)

  if (error) {
    console.error("petmaster-add-decision:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
