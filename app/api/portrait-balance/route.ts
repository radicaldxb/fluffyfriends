import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("portrait_purchases")
    .select(
      "id, package, portraits_total, portraits_used, portraits_remaining, created_at, expires_at",
    )
    .eq("email", email)
    .gt("portraits_remaining", 0)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalRemaining =
    data?.reduce((sum, row) => sum + (row.portraits_remaining as number), 0) || 0

  return NextResponse.json({
    email,
    portraits_remaining: totalRemaining,
    purchases: data || [],
    has_portraits: totalRemaining > 0,
  })
}

