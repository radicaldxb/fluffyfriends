import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    if (!stripeSecret) {
      console.error("[validate-voucher] STRIPE_SECRET_KEY not configured")
      return NextResponse.json(
        { valid: false, error: "Server configuration error: STRIPE_SECRET_KEY is missing." },
        { status: 500 },
      )
    }

    const { code } = (await request.json().catch(() => ({}))) as { code?: string }

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 })
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" })

    const promotionCodes = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
    })

    if (!promotionCodes.data.length) {
      return NextResponse.json({ valid: false, error: "Invalid or expired code" })
    }

    const promotionCode = promotionCodes.data[0]
    const coupon = promotionCode.coupon

    let discountText = ""
    if (coupon.percent_off != null) {
      discountText = `${coupon.percent_off}% off`
    } else if (coupon.amount_off != null) {
      discountText = `$${(coupon.amount_off / 100).toFixed(2)} off`
    }

    return NextResponse.json({
      valid: true,
      promotionCodeId: promotionCode.id,
      discountText,
      code: promotionCode.code,
    })
  } catch (error) {
    console.error("[validate-voucher] Unexpected error:", error)
    return NextResponse.json({ valid: false, error: "Failed to validate code" }, { status: 500 })
  }
}

