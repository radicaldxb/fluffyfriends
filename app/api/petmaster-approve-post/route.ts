import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

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

  const { error } = await supabase
    .from("pb_content_queue")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("petmaster-approve-post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
