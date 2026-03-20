import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  // These will surface as 500s at runtime; avoid throwing at import time in case of build-time env gaps
  console.warn(
    "[lookup-order] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured. Endpoint will return 500.",
  )
}

const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { found: false, error: "Server configuration error. Please try again later." },
      { status: 500 },
    )
  }

  const { payment_intent_id, email } = (await request.json().catch(() => ({}))) as {
    payment_intent_id?: string
    email?: string
  }

  const trimmedIntent = (payment_intent_id || "").trim()
  const trimmedEmail = (email || "").trim().toLowerCase()

  if (!trimmedIntent || !trimmedEmail) {
    return NextResponse.json(
      { found: false, error: "Missing order reference or email" },
      { status: 400 },
    )
  }

  const orderRef = trimmedIntent.toUpperCase()

  // Step 1 — Try to resolve by purchase (stripe_session_id suffix) for bundle / single purchases.
  const { data: purchase, error: purchaseError } = await supabase
    .from("portrait_purchases")
    .select(
      "id, email, stripe_session_id, package, portraits_total, portraits_used, portraits_remaining, created_at, payment_intent_id",
    )
    .ilike("email", trimmedEmail)
    .ilike("stripe_session_id", `%${orderRef}`)
    .maybeSingle()

  if (purchase && !purchaseError) {
    const purchasePi = (purchase.payment_intent_id as string | null | undefined)?.trim() || ""

    let portraitsQuery = supabase
      .from("pet_portraits")
      .select(
        "id, pet_name, theme, status, image_url, original_image_url, pet_image_url, landscape_url, portrait_url, payment_intent_id, created_at",
      )
      .ilike("user_email", trimmedEmail)

    if (purchasePi) {
      portraitsQuery = portraitsQuery.eq("payment_intent_id", purchasePi)
    }

    const { data: portraitsForEmail } = await portraitsQuery.order("created_at", {
      ascending: false,
    })

    return NextResponse.json({
      found: true,
      source: "purchase",
      purchase: {
        id: purchase.id,
        email: purchase.email,
        stripe_session_id: purchase.stripe_session_id,
        package: purchase.package,
        portraits_total: purchase.portraits_total,
        portraits_used: purchase.portraits_used,
        portraits_remaining: purchase.portraits_remaining,
        created_at: purchase.created_at,
      },
      portraits: portraitsForEmail ?? [],
    })
  }

  // Step 2 — Fall back to portrait lookup by payment_intent_id suffix (Stripe payment intent).
  // Look up portrait — email AND payment_intent_id must match.
  // Accept either full payment intent (pi_...) or the 7-character code shown on My Portraits.
  let portraitQuery = supabase
    .from("pet_portraits")
    .select(
      "id, pet_name, theme, original_image_url, landscape_url, portrait_url, status, payment_intent_id, user_email",
    )
    .ilike("user_email", trimmedEmail)

  if (trimmedIntent.startsWith("pi_")) {
    portraitQuery = portraitQuery.eq("payment_intent_id", trimmedIntent)
  } else {
    // Allow short codes (e.g. last 7 characters) by matching the end of the payment_intent_id.
    portraitQuery = portraitQuery.ilike("payment_intent_id", `%${trimmedIntent}`)
  }

  const { data, error } = await portraitQuery.single()

  if (error || !data) {
    return NextResponse.json({
      found: false,
      error: "We couldn't find an order matching that reference and email address.",
    })
  }

  const fullIntent = (data.payment_intent_id as string | null) || trimmedIntent

  // Check for existing open ticket on this order
  const { data: existingTicket } = await supabase
    .from("support_tickets")
    .select("id, status")
    .eq("payment_intent_id", fullIntent)
    .in("status", ["pending", "processing"])
    .maybeSingle()

  if (existingTicket) {
    return NextResponse.json({
      found: false,
      error:
        "You already have an open support request for this order. We will be in touch within 24 hours.",
    })
  }

  // Check if this order already had a remake (resolved ticket exists)
  const { data: resolvedTicket } = await supabase
    .from("support_tickets")
    .select("id, credit_added")
    .eq("payment_intent_id", fullIntent)
    .eq("status", "resolved")
    .eq("credit_added", true)
    .maybeSingle()

  const row = data as typeof data & { pet_image_url?: string | null }

  return NextResponse.json({
    found: true,
    portrait: {
      id: row.id,
      pet_name: row.pet_name,
      theme: row.theme,
      pet_image_url: row.pet_image_url ?? null,
      original_image_url: row.original_image_url,
      generated_image_url: row.landscape_url || row.portrait_url || null,
      status: row.status,
    },
    already_remade: !!resolvedTicket,
  })
}

