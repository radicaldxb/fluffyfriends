import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  // Purchases: all for this email
  const { data: purchaseRows, error: purchaseError } = await supabase
    .from("portrait_purchases")
    .select("id, package, portraits_total, portraits_used, portraits_remaining, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })

  if (purchaseError) {
    return NextResponse.json({ error: purchaseError.message }, { status: 500 })
  }

  const purchases = (purchaseRows || []).map((p) => ({
    id: p.id,
    package: p.package,
    portraits_total: p.portraits_total,
    portraits_used: p.portraits_used,
    portraits_remaining: p.portraits_remaining,
    created_at: p.created_at,
  }))

  const totalRemaining =
    (purchaseRows || []).reduce(
      (sum, row) =>
        sum +
        (typeof row.portraits_remaining === "number" ? row.portraits_remaining : 0),
      0,
    ) || 0

  // User by email
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (!userRow?.id) {
    return NextResponse.json({
      purchases,
      portraits: [],
      totalRemaining,
    })
  }

  // Portraits for this user including download URLs (server-side = same data as backend)
  const { data: portraitRows, error: portraitError } = await supabase
    .from("pet_portraits")
    .select("id, pet_name, theme, image_url, original_image_url, landscape_url, portrait_url, created_at, status")
    .eq("user_id", userRow.id)
    .eq("status", "completed")
    .order("created_at", { ascending: true })

  if (portraitError) {
    return NextResponse.json(
      { error: portraitError.message, purchases, portraits: [], totalRemaining },
      { status: 500 },
    )
  }

  const portraits = (portraitRows || []).map((p) => {
    const rawLandscape = p.landscape_url != null ? String(p.landscape_url).trim() : ""
    const rawPortrait = p.portrait_url != null ? String(p.portrait_url).trim() : ""
    return {
      id: p.id,
      pet_name: p.pet_name ?? null,
      theme: p.theme ?? null,
      image_url: p.image_url ?? null,
      original_image_url: p.original_image_url ?? null,
      landscape_url: rawLandscape || null,
      portrait_url: rawPortrait || null,
      created_at: p.created_at,
    }
  })

  return NextResponse.json({
    purchases,
    portraits,
    totalRemaining,
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Pragma": "no-cache",
    },
  })
}
