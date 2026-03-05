import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProduct, type ProductId } from "@/lib/products"
import Stripe from "stripe"

const VALID_IDS: ProductId[] = ["starter", "portrait_pack", "family_pack"]

function getStripeClient(secret: string) {
  return new Stripe(secret, {
    apiVersion: "2023-10-16",
  })
}

function getSiteUrl(fromEnv: string) {
  return fromEnv.replace(/\/+$/, "")
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL

    if (!stripeSecret) {
      console.error("[create-checkout] STRIPE_SECRET_KEY not configured")
      return NextResponse.json(
        { error: "Server configuration error: STRIPE_SECRET_KEY is missing." },
        { status: 500 },
      )
    }

    if (!rawSiteUrl) {
      console.error("[create-checkout] NEXT_PUBLIC_SITE_URL (or SITE_URL) not configured")
      return NextResponse.json(
        { error: "Server configuration error: NEXT_PUBLIC_SITE_URL (or SITE_URL) is missing." },
        { status: 500 },
      )
    }

    const body = await request.json()

    const email =
      typeof body.email === "string" ? body.email.trim() : ""
    const firstName =
      typeof body.first_name === "string" ? body.first_name.trim() : ""
    const lastName =
      typeof body.last_name === "string" ? body.last_name.trim() : ""
    const productId: ProductId | null = VALID_IDS.includes(body.product_id)
      ? body.product_id
      : null
    const portraitId =
      typeof body.portrait_id === "string" ? body.portrait_id.trim() : ""
    const themeFromBody =
      typeof body.theme === "string" ? body.theme.trim().toLowerCase() : ""

    if (!email || !firstName || !productId || !portraitId) {
      return NextResponse.json(
        { error: "Missing email, first_name, product_id, or portrait_id" },
        { status: 400 },
      )
    }

    const product = getProduct(productId)
    if (!product) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 },
      )
    }

    const amountCents = product.priceCents
    const creditsRemaining = product.perPortrait - 1
    let creditsValidUntil: string | null = null
    if (creditsRemaining > 0) {
      const d = new Date()
      d.setMonth(d.getMonth() + 12)
      creditsValidUntil = d.toISOString()
    }

    // 1) Create order + order_item in Supabase as pending
    const fullName = `${firstName} ${lastName}`.trim() || null

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        name: fullName,
        amount_cents: amountCents,
        status: "pending",
        payment_provider: "stripe",
      })
      .select("id")
      .single()

    if (orderError || !order?.id) {
      console.error("[create-checkout] Order insert error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      )
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      price_cents: amountCents,
      quantity: 1,
      portrait_ids: [portraitId],
      credits_remaining: creditsRemaining > 0 ? creditsRemaining : 0,
    })

    if (itemError) {
      console.error("[create-checkout] Order item insert error:", itemError)
      return NextResponse.json(
        { error: "Failed to create order item" },
        { status: 500 },
      )
    }

    // 2) Create Stripe Checkout Session
    const stripe = getStripeClient(stripeSecret)
    const siteUrl = getSiteUrl(rawSiteUrl)

    const successUrl = `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&portrait=${encodeURIComponent(
      portraitId,
    )}`

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        portrait_id: portraitId,
        product_id: productId,
        first_name: firstName,
        ...(themeFromBody && { theme: themeFromBody }),
      },
      success_url: successUrl,
      cancel_url: `${siteUrl}/checkout?portrait=${encodeURIComponent(portraitId)}`,
    })

    if (!session.url) {
      console.error("[create-checkout] Stripe session has no URL")
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        url: session.url,
        order_id: order.id,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("[create-checkout] Unexpected error:", err)
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 },
    )
  }
}

