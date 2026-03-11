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

  // Must start with pi_
  if (!trimmedIntent.startsWith("pi_")) {
    return NextResponse.json({
      found: false,
      error: "Invalid order reference format. It should start with pi_",
    })
  }

  // Look up portrait — email AND payment_intent_id must match
  const { data, error } = await supabase
    .from("pet_portraits")
    .select(
      "id, pet_name, theme, original_image_url, landscape_url, portrait_url, status, payment_intent_id, user_email",
    )
    .eq("payment_intent_id", trimmedIntent)
    .ilike("user_email", trimmedEmail)
    .single()

  if (error || !data) {
    return NextResponse.json({
      found: false,
      error: "We couldn't find an order matching that reference and email address.",
    })
  }

  // Check for existing open ticket on this order
  const { data: existingTicket } = await supabase
    .from("support_tickets")
    .select("id, status")
    .eq("payment_intent_id", trimmedIntent)
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
    .eq("payment_intent_id", trimmedIntent)
    .eq("status", "resolved")
    .eq("credit_added", true)
    .maybeSingle()

  return NextResponse.json({
    found: true,
    portrait: {
      id: data.id,
      pet_name: data.pet_name,
      theme: data.theme,
      original_image_url: data.original_image_url,
      generated_image_url: data.landscape_url || data.portrait_url || null,
      status: data.status,
    },
    already_remade: !!resolvedTicket,
  })
}

