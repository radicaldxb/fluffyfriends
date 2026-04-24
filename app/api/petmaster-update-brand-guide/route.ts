import { NextResponse } from "next/server"
import { petmasterUnauthorizedResponse } from "@/lib/petmaster-api-guard"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type Body = { category?: string; key?: string; value?: string | null }

export async function PATCH(request: Request) {
  const denied = await petmasterUnauthorizedResponse()
  if (denied) return denied

  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const key = typeof body.key === "string" ? body.key.trim() : ""
  const category = typeof body.category === "string" ? body.category.trim() : ""
  if (!key || !category) {
    return NextResponse.json({ error: "category and key are required" }, { status: 400 })
  }
  const value = body.value == null ? null : String(body.value)

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase
    .from("pb_brand_guide")
    .update({ value, updated_at: new Date().toISOString() } as never)
    .eq("category", category)
    .eq("key", key)

  if (error) {
    console.error("petmaster-update-brand-guide:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function POST(request: Request) {
  return PATCH(request)
}
