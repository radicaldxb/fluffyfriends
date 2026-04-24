import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

function mapPlaybookConfidence(
  raw: string | null | undefined,
): "high" | "medium" | "low" {
  const c = (raw ?? "").toLowerCase()
  if (c === "high") return "high"
  if (c === "low") return "low"
  return "medium"
}

export async function PATCH(request: Request) {
  return handleApprove(request)
}

export async function POST(request: Request) {
  return handleApprove(request)
}

async function handleApprove(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data: proposal, error: fetchErr } = await supabase
    .from("pb_playbook_proposals")
    .select("*")
    .eq("id", id)
    .eq("status", "pending_approval")
    .maybeSingle()

  if (fetchErr) {
    console.error("petmaster-approve-proposal fetch:", fetchErr)
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found or not pending" }, { status: 404 })
  }

  const proposed_rule = (proposal as { proposed_rule?: string | null }).proposed_rule
  const rationale = (proposal as { rationale?: string | null }).rationale
  const confidence = mapPlaybookConfidence(
    (proposal as { confidence?: string | null }).confidence ?? undefined,
  )

  if (!proposed_rule || !String(proposed_rule).trim()) {
    return NextResponse.json({ error: "Proposal has no rule text" }, { status: 400 })
  }

  const { error: upErr } = await supabase.from("pb_playbook_proposals").update({ status: "approved" }).eq("id", id)

  if (upErr) {
    console.error("petmaster-approve-proposal update:", upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const row = {
    category: "learned" as const,
    rule: String(proposed_rule).trim(),
    rationale: rationale == null ? null : String(rationale).trim(),
    confidence,
    source: "analytics_agent" as const,
    active: true,
  }

  const { error: insErr } = await supabase.from("pb_playbook").insert(row as never)

  if (insErr) {
    console.error("petmaster-approve-proposal insert:", insErr)
    await supabase.from("pb_playbook_proposals").update({ status: "pending_approval" }).eq("id", id)
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
