import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  // Purchases: all for this email (case-insensitive like portrait-balance)
  const { data: purchaseRows, error: purchaseError } = await supabase
    .from("portrait_purchases")
    .select("id, package, portraits_total, portraits_used, portraits_remaining, created_at")
    .ilike("email", email)
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

  // User by email (case-insensitive so URL ?email= matches stored casing)
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  const seenIds = new Set<string>()

  // Portraits by user_id (when they submitted approve form)
  let portraitRows: Array<{
    id: string
    pet_name: string | null
    theme: string | null
    image_url: string | null
    original_image_url: string | null
    landscape_url: string | null
    portrait_url: string | null
    created_at: string
    payment_intent_id?: string | null
  }> = []

  if (userRow?.id) {
    const { data: byUserId, error: portraitError } = await supabase
      .from("pet_portraits")
      .select("id, pet_name, theme, image_url, original_image_url, landscape_url, portrait_url, created_at, status, payment_intent_id")
      .eq("user_id", userRow.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    if (portraitError) {
      return NextResponse.json(
        { error: portraitError.message, purchases, portraits: [], totalRemaining },
        { status: 500 },
      )
    }
    portraitRows = (byUserId || []).map((p) => ({
      id: p.id as string,
      pet_name: p.pet_name ?? null,
      theme: p.theme ?? null,
      image_url: p.image_url ?? null,
      original_image_url: p.original_image_url ?? null,
      landscape_url: p.landscape_url != null ? String(p.landscape_url).trim() : null,
      portrait_url: p.portrait_url != null ? String(p.portrait_url).trim() : null,
      created_at: p.created_at,
      payment_intent_id: (p as any).payment_intent_id ?? null,
    })).filter((p) => {
      if (seenIds.has(p.id)) return false
      seenIds.add(p.id)
      return true
    })
  }

  // Fallback: portraits by user_email (e.g. set by Stripe/n8n before user_id) so we don't miss any
  const { data: byEmailRows } = await supabase
    .from("pet_portraits")
    .select("id, pet_name, theme, image_url, original_image_url, landscape_url, portrait_url, created_at, status, payment_intent_id")
    .ilike("user_email", email)
    .eq("status", "completed")
    .order("created_at", { ascending: false })

  for (const p of byEmailRows || []) {
    const id = p.id as string
    if (seenIds.has(id)) continue
    seenIds.add(id)
    portraitRows.push({
      id: p.id as string,
      pet_name: p.pet_name ?? null,
      theme: p.theme ?? null,
      image_url: p.image_url ?? null,
      original_image_url: p.original_image_url ?? null,
      landscape_url: p.landscape_url != null ? String(p.landscape_url).trim() : null,
      portrait_url: p.portrait_url != null ? String(p.portrait_url).trim() : null,
      created_at: p.created_at,
      payment_intent_id: (p as any).payment_intent_id ?? null,
    })
  }

  // Sort merged list by created_at (latest first)
  portraitRows.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

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
      order_reference: p.payment_intent_id ?? null,
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
