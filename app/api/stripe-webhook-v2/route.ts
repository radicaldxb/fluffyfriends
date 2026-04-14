import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getStripeClient } from "@/lib/stripe"
import type Stripe from "stripe"

const N8N_UPSCALE_WEBHOOK =
  "https://n8n.srv943460.hstgr.cloud/webhook/upscale-and-deliver-v2"
const WEBHOOK_SECRET = "2f6d19c4493bbd81c05ba706d9fc1d5b4dc8bd6189cdbec0"

const PORTRAITS_MAP: Record<string, number> = {
  starter: 1,
  portrait_pack: 4,
  family_pack: 8,
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_V2

    if (!stripeSecret) {
      console.error("[stripe-webhook-v2] STRIPE_SECRET_KEY not configured")
      return NextResponse.json(
        { error: "Server configuration error: STRIPE_SECRET_KEY is missing." },
        { status: 500 },
      )
    }

    if (!webhookSecret) {
      console.error("[stripe-webhook-v2] STRIPE_WEBHOOK_SECRET_V2 not configured")
      return NextResponse.json(
        { error: "Server configuration error: STRIPE_WEBHOOK_SECRET_V2 is missing." },
        { status: 500 },
      )
    }

    const stripe = getStripeClient(stripeSecret)
    const rawBody = await request.text()
    const sig = request.headers.get("stripe-signature") || ""

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch (err) {
      console.error("[stripe-webhook-v2] Webhook signature failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const portrait_id = session.metadata?.portrait_id?.trim() || ""
    const user_email =
      (session.customer_details?.email || (session.customer_email as string | null) || "").trim()
    const payment_intent_id =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || ""
    const total_cents = session.amount_total || 0
    const currency = session.currency || "usd"

    if (!portrait_id) {
      console.error("[stripe-webhook-v2] No portrait_id in Stripe metadata")
      return NextResponse.json({ error: "Missing portrait_id" }, { status: 400 })
    }

    const { data: portrait, error: fetchError } = await supabase
      .from("pet_portraits")
      .select("pet_name, gemini_image_url, image_url, theme, pet_image_url")
      .eq("id", portrait_id)
      .single()

    if (fetchError || !portrait) {
      console.error("[stripe-webhook-v2] Portrait fetch failed:", fetchError)
      return NextResponse.json({ error: "Portrait not found" }, { status: 404 })
    }

    const portraitRow = portrait as {
      pet_name: string | null
      gemini_image_url?: string | null
      image_url: string | null
      theme?: string | null
      pet_image_url?: string | null
    }

    // gemini_image_url is the clean Gemini output stored by WF2
    // image_url is the AVIF preview — valid fallback for upscaling
    const original_image_url = portrait.gemini_image_url || portrait.image_url

    if (!original_image_url) {
      console.error("No image URL available for portrait:", portrait_id)
      return NextResponse.json({ error: "Portrait has no image yet" }, { status: 400 })
    }

    const productIdRaw = (session.metadata?.product_id as string) || ""
    const packageFromMeta = (session.metadata?.package as string) || ""
    const packageName =
      productIdRaw && PORTRAITS_MAP[productIdRaw] !== undefined
        ? productIdRaw
        : packageFromMeta && PORTRAITS_MAP[packageFromMeta] !== undefined
          ? packageFromMeta
          : "starter"
    const portraitsTotal = PORTRAITS_MAP[packageName] ?? 1

    if (user_email) {
      const { error: purchaseError } = await supabase.from("portrait_purchases").insert({
        email: user_email,
        stripe_session_id: session.id,
        payment_intent_id,
        package: packageName,
        portraits_total: portraitsTotal,
        portraits_used: 1,
        portraits_remaining: portraitsTotal - 1,
      })

      if (purchaseError) {
        console.error("[stripe-webhook-v2] portrait_purchases insert failed:", purchaseError)
      }
    }

    const { error: portraitUpdateError } = await supabase
      .from("pet_portraits")
      .update({
        payment_intent_id,
        ...(user_email ? { user_email: user_email.toLowerCase() } : {}),
        status: "upscaling",
      })
      .eq("id", portrait_id)

    if (portraitUpdateError) {
      console.error("[stripe-webhook-v2] pet_portraits update failed:", portraitUpdateError)
    }

    const firstName = user_email.split("@")[0] || "there"

    console.log("Firing WF3-NEW for portrait:", portrait_id, "image:", original_image_url)
    fetch(N8N_UPSCALE_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        portrait_id,
        original_image_url,
        user_email,
        user_first_name: firstName,
        pet_name: portraitRow.pet_name,
        order_id: session.id,
        payment_intent_id,
        total_cents,
        currency,
        avif_url: portraitRow.image_url,
      }),
    }).catch((err) => {
      console.error("WF3-NEW trigger failed:", err)
    })
    console.log("WF3-NEW fired successfully for portrait:", portrait_id)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[stripe-webhook-v2] Unexpected error:", err)
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error"
    return NextResponse.json(
      { error: "Internal error in stripe-webhook-v2", details: message },
      { status: 500 },
    )
  }
}
