import { NextRequest, NextResponse } from "next/server"
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

    const productId: ProductId | null = VALID_IDS.includes(body.product_id)
      ? body.product_id
      : null

    // Normalise portrait ID (defensive: some flows were sending a leading "=")
    const portraitIdRaw =
      typeof body.portrait_id === "string" ? body.portrait_id.trim() : ""
    const portraitId = portraitIdRaw.startsWith("=")
      ? portraitIdRaw.slice(1)
      : portraitIdRaw
    const themeFromBody =
      typeof body.theme === "string" ? body.theme.trim().toLowerCase() : ""

    if (!productId || !portraitId) {
      return NextResponse.json(
        { error: "Missing product_id or portrait_id" },
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

    // Create Stripe Checkout Session only – orders are created in the Stripe webhook
    const stripe = getStripeClient(stripeSecret)
    const siteUrl = getSiteUrl(rawSiteUrl)

    const successUrl = `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&portrait=${encodeURIComponent(
      portraitId,
    )}`

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
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
        portrait_id: portraitId,
        product_id: productId,
        ...(themeFromBody && { theme: themeFromBody }),
      },
      success_url: successUrl,
      cancel_url: `${siteUrl}/create`,
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

