import { randomBytes } from "crypto"
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

  const token = randomBytes(24).toString("base64url")
  const revealedAt = new Date().toISOString()

  const { data: inserted, error: errFirst } = await supabase
    .from("pet_portraits")
    .update({
      user_email: email,
      preview_token: token,
      preview_revealed_at: revealedAt,
    })
    .eq("id", id)
    .is("preview_token", null)
    .select("id")

  if (errFirst) {
    console.error("save-preview-email:", errFirst)
    return NextResponse.json({ error: errFirst.message }, { status: 500 })
  }

  if (!inserted?.length) {
    const { error: errEmailOnly } = await supabase.from("pet_portraits").update({ user_email: email }).eq("id", id)
    if (errEmailOnly) {
      console.error("save-preview-email (email retry):", errEmailOnly)
      return NextResponse.json({ error: errEmailOnly.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
