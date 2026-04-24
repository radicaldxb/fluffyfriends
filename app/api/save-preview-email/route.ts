import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: { id?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body.id === "string" ? body.id.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!id || !email) {
    return NextResponse.json({ error: "Missing id or email" }, { status: 400 })
  }

  let supabase
  try {
    supabase = getSupabase()
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 })
  }

  const { error } = await supabase.from("pet_portraits").update({ user_email: email }).eq("id", id)

  if (error) {
    console.error("save-preview-email:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
