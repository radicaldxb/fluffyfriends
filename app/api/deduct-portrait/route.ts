import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { data: purchase, error: fetchError } = await supabase
    .from("portrait_purchases")
    .select("id, portraits_used, portraits_remaining")
    .eq("email", email)
    .gt("portraits_remaining", 0)
    .or(`expires_at.is.null,expires_at.gt."${now}"`)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (fetchError || !purchase) {
    return NextResponse.json(
      { error: "No portraits remaining for this email" },
      { status: 400 },
    )
  }

  const { error: updateError } = await supabase
    .from("portrait_purchases")
    .update({
      portraits_used: (purchase.portraits_used as number) + 1,
      portraits_remaining: (purchase.portraits_remaining as number) - 1,
    })
    .eq("id", purchase.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const remaining = (purchase.portraits_remaining as number) - 1

  return NextResponse.json({
    ok: true,
    portraits_remaining: remaining,
  })
}

