import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type Body = {
  id?: string
  caption_a?: string | null
  hashtags?: string | null
}

export async function PATCH(request: Request) {
  return handleEdit(request)
}

export async function POST(request: Request) {
  return handleEdit(request)
}

async function handleEdit(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const caption_a = body.caption_a == null ? null : String(body.caption_a)
  const hashtags = body.hashtags == null ? null : String(body.hashtags)

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase
    .from("pb_content_queue")
    .update({
      caption_a,
      hashtags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("petmaster-edit-post:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
