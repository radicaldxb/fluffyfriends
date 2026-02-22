import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProduct, type ProductId } from "@/lib/products"

const VALID_IDS: ProductId[] = ["single_4k", "pack_4_4k"]

/**
 * Create an order (test flow — no Stripe yet).
 * Body: { email: string, name?: string, product_id: ProductId, portrait_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const name = typeof body.name === "string" ? body.name.trim() : null
    const productId = VALID_IDS.includes(body.product_id) ? body.product_id : null
    const portraitId = typeof body.portrait_id === "string" ? body.portrait_id.trim() : null

    if (!email || !productId || !portraitId) {
      return NextResponse.json(
        { error: "Missing email, product_id, or portrait_id" },
        { status: 400 }
      )
    }

    const product = getProduct(productId)
    if (!product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 })
    }

    const amountCents = product.priceCents
    const creditsRemaining = product.perPortrait - 1
    let creditsValidUntil: string | null = null
    if (creditsRemaining > 0) {
      const d = new Date()
      d.setMonth(d.getMonth() + 12)
      creditsValidUntil = d.toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        name: name || null,
        amount_cents: amountCents,
        status: "pending",
        credits_valid_until: creditsValidUntil,
      })
      .select("id")
      .single()

    if (orderError || !order?.id) {
      console.error("[orders] Insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
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
      console.error("[orders] Order item insert error:", itemError)
      return NextResponse.json({ error: "Failed to create order item" }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      email,
      product_id: productId,
      amount_cents: amountCents,
      credits_remaining: creditsRemaining > 0 ? creditsRemaining : 0,
      credits_valid_until: creditsValidUntil,
    })
  } catch (err) {
    console.error("[orders]", err)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
