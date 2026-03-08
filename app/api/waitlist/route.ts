import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const type = typeof body.type === "string" ? body.type.trim() : "gift"

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, type })

  if (error) {
    console.error("[waitlist] Insert error:", error)
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
