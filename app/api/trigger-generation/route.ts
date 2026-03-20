import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const portraitId = typeof body.portrait_id === "string" ? body.portrait_id.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!portraitId || !email) {
    return NextResponse.json({ error: "Missing portrait_id or email" }, { status: 400 })
  }

  // Load portrait row
  const { data: portrait, error } = await supabase
    .from("pet_portraits")
    .select("id, pet_name, theme, original_image_url, showcase_consent, status")
    .eq("id", portraitId)
    .single()

  if (error || !portrait) {
    return NextResponse.json({ error: "Portrait not found" }, { status: 404 })
  }

  // Don't re-trigger if already generating or beyond
  if (["generating", "preview", "completed"].includes(portrait.status as string)) {
    return NextResponse.json({ ok: true, already_generating: true })
  }

  const petName = (portrait.pet_name as string) || "My Pet"
  const theme = ((portrait.theme as string) || "").toLowerCase()

  const orderPaidUrl = process.env.N8N_ORDER_PAID_WEBHOOK_URL || ""
  if (!orderPaidUrl) {
    return NextResponse.json(
      { error: "N8N_ORDER_PAID_WEBHOOK_URL not configured" },
      { status: 500 },
    )
  }

  // Look up latest bundle purchase for this email to recover Stripe payment_intent_id
  let payment_intent_id: string | null = null
  try {
    const { data: purchase } = await supabase
      .from("portrait_purchases")
      .select("stripe_session_id, payment_intent_id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    console.log("[trigger-generation] email used for lookup:", email)
    console.log("[trigger-generation] purchase found:", JSON.stringify(purchase))

    payment_intent_id = purchase?.payment_intent_id || null
  } catch (err) {
    console.error("[trigger-generation] Failed to resolve payment_intent_id for bundle order:", err)
  }

  const payload = {
    portrait_id: portrait.id,
    pet_image_url: (portrait.original_image_url as string) || "",
    pet_name: petName,
    theme,
    order_id: `bundle_${portraitId}`,
    payment_intent_id,
    user_email: email,
    user_first_name: "",
    total_cents: 0,
    currency: "usd",
    showcase_consent: Boolean(portrait.showcase_consent),
  }

  // Fire WF2
  const res = await fetch(orderPaidUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[trigger-generation] WF2 error:", res.status, text)
    return NextResponse.json({ error: "Failed to trigger generation" }, { status: 502 })
  }

  // Mark portrait as generating and link to email so My Portraits can find it
  const portraitEmailNorm = (email || "").trim().toLowerCase()
  await supabase
    .from("pet_portraits")
    .update({
      status: "generating",
      pet_image_url: (portrait.original_image_url as string) || null,
      ...(portraitEmailNorm ? { user_email: portraitEmailNorm } : {}),
    })
    .eq("id", portraitId)

  return NextResponse.json({ ok: true })
}
