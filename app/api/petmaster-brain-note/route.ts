import { NextRequest, NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const PRI_RANK: Record<string, number> = { urgent: 0, normal: 1, low: 2 }

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

  const { data, error } = await supabase
    .from("pb_operator_notes")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const filtered = (data ?? []).filter((row) => {
    const expires = row.expires_at as string | null | undefined
    if (!expires) return true
    return new Date(expires).getTime() > now.getTime()
  })

  filtered.sort((a, b) => {
    const pa = PRI_RANK[String(a.priority ?? "normal")] ?? 99
    const pb = PRI_RANK[String(b.priority ?? "normal")] ?? 99
    if (pa !== pb) return pa - pb
    return new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime()
  })

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: { note?: string; priority?: string; expires_at?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const note = typeof body.note === "string" ? body.note.trim() : ""
  if (!note) return NextResponse.json({ error: "Note required" }, { status: 400 })

  const pr = typeof body.priority === "string" ? body.priority.trim().toLowerCase() : "normal"
  const priority =
    pr === "urgent" || pr === "normal" || pr === "low" ? pr : "normal"
  let expires_at: string | null = null
  if (typeof body.expires_at === "string" && body.expires_at.trim()) {
    expires_at = body.expires_at.trim()
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pb_operator_notes").insert({
    note,
    priority,
    expires_at,
    active: true,
  } as never)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pb_operator_notes").update({ active: false }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
