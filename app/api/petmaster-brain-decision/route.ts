import { NextRequest, NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const ALLOWED_CAT = new Set([
  "campaign",
  "milestone",
  "strategic",
  "operator_note",
  "lesson_learned",
])

export async function GET() {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { data, error } = await supabase
    .from("pb_decision_log")
    .select("*")
    .eq("active", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: {
    category?: string
    title?: string
    body?: string
    tags?: string | string[]
    pinned?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const textBody = typeof body.body === "string" ? body.body.trim() : ""
  if (!title || !textBody) return NextResponse.json({ error: "Title and body required" }, { status: 400 })

  const catRaw = typeof body.category === "string" ? body.category.trim().toLowerCase() : "lesson_learned"
  const category = ALLOWED_CAT.has(catRaw) ? catRaw : "lesson_learned"

  let tagsArray: string[] = []
  if (Array.isArray(body.tags)) {
    tagsArray = body.tags.map((t) => String(t).trim()).filter(Boolean)
  } else if (typeof body.tags === "string") {
    tagsArray = body.tags.split(",").map((t) => t.trim()).filter(Boolean)
  }

  const pinned = Boolean(body.pinned)

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pb_decision_log").insert({
    category,
    title,
    body: textBody,
    tags: tagsArray,
    pinned,
    active: true,
  } as never)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: { id?: string; outcome?: string | null; pinned?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  let hasField = false
  if (body.outcome !== undefined) {
    updates.outcome =
      typeof body.outcome === "string" ? body.outcome.trim() || null : body.outcome === null ? null : null
    hasField = true
  }
  if (typeof body.pinned === "boolean") {
    updates.pinned = body.pinned
    hasField = true
  }

  if (!hasField) return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pb_decision_log").update(updates).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
