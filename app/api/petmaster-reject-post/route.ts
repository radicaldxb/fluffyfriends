import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  return handleReject(request)
}

export async function POST(request: Request) {
  return handleReject(request)
}

async function handleReject(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: {
    id?: string
    rejection_category?: string
    rejection_reason?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const rejection_category =
    typeof body.rejection_category === "string" ? body.rejection_category.trim() : ""
  if (!rejection_category) {
    return NextResponse.json({ error: "rejection_category is required" }, { status: 400 })
  }

  const rejection_reason =
    body.rejection_reason == null || String(body.rejection_reason).trim() === ""
      ? null
      : String(body.rejection_reason).trim().slice(0, 200)

  const now = new Date().toISOString()

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase
    .from("pb_content_queue")
    .update({
      status: "pending_creative",
      rejection_category,
      rejection_reason,
      rejected_at: now,
      updated_at: now,
    } as never)
    .eq("id", id)

  if (error) {
    console.error("petmaster-reject-post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
