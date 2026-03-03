import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { getPromptAndNameTagConfig } from "@/lib/theme-prompts"
import { DEFAULT_NAMETAG_INSTRUCTION } from "@/lib/themes"

function getStripeClient(secret: string) {
  return new Stripe(secret, {
    apiVersion: "2023-10-16",
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecret) {
      console.error("[stripe-webhook] STRIPE_SECRET_KEY not configured")
      return NextResponse.json(
        { error: "Server configuration error: STRIPE_SECRET_KEY is missing." },
        { status: 500 },
      )
    }

    if (!webhookSecret) {
      console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured")
      return NextResponse.json(
        { error: "Server configuration error: STRIPE_WEBHOOK_SECRET is missing." },
        { status: 500 },
      )
    }

    const stripe = getStripeClient(stripeSecret)

    const body = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const orderId = metadata.order_id

      try {
        if (!orderId) {
          console.error("[stripe-webhook] Missing order_id in session metadata")
        } else {
          // Mark order as paid
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "paid",
              payment_provider: "stripe",
              payment_id: session.id,
            })
            .eq("id", orderId)

          if (updateError) {
            console.error("[stripe-webhook] Failed to update order:", updateError)
          }

          // Fetch order + order_items so we can send an order-paid payload to n8n
          const { data: orderRow, error: orderError } = await supabase
            .from("orders")
            .select("id, email, name, amount_cents")
            .eq("id", orderId)
            .single()

          if (orderError || !orderRow) {
            console.error("[stripe-webhook] Failed to load order row:", orderError)
          } else {
            const { data: items, error: itemsError } = await supabase
              .from("order_items")
              .select("product_id, price_cents, credits_remaining, portrait_ids")
              .eq("order_id", orderId)

            if (itemsError || !items || items.length === 0) {
              console.error("[stripe-webhook] Failed to load order_items:", itemsError)
            } else {
              const item = items[0]
              // Prefer portrait_id from Stripe metadata (create-checkout sent this),
              // fall back to any portrait_ids stored on the order_items row.
              const portraitIdFromMetadata = (metadata.portrait_id as string | undefined) || null
              const portraitIds =
                portraitIdFromMetadata != null && portraitIdFromMetadata !== ""
                  ? [portraitIdFromMetadata]
                  : ((item.portrait_ids as string[]) || [])

              const portraitId = portraitIds[0]
              if (!portraitId) {
                console.error("[stripe-webhook] No portrait_id available on order_items/metadata")
              } else {
                const { data: portraitRow, error: portraitError } = await supabase
                  .from("pet_portraits")
                  .select("id, pet_name, theme, original_image_url, showcase_consent")
                  .eq("id", portraitId)
                  .single()

                if (portraitError || !portraitRow) {
                  console.error("[stripe-webhook] Failed to load pet_portraits row:", portraitError)
                } else {
                  const rawPetName = (portraitRow.pet_name as string | null) || "My Pet"
                  const resolvedPetName = rawPetName.trim() || "My Pet"
                  const theme = ((portraitRow.theme as string | null) || "").toLowerCase()

                  let prompt = ""
                  try {
                    if (!theme) {
                      console.error("[stripe-webhook] Missing theme on pet_portraits row")
                    } else {
                      const { prompt: basePrompt, hasNameTag, nameTagInstruction } =
                        await getPromptAndNameTagConfig(theme)

                      prompt = basePrompt
                      // Append name-tag instruction if needed
                      if (hasNameTag && !/\{\{\s*PET_NAME\s*\}\}/i.test(prompt)) {
                        const appendix = nameTagInstruction ?? DEFAULT_NAMETAG_INSTRUCTION
                        prompt = `${prompt}\n\n9. NAME PATCH: ${appendix}`
                      }

                      // Replace {{PET_NAME}} placeholders
                      const placeholderRegex = /\{\{\s*PET_NAME\s*\}\}/gi
                      prompt = prompt.replace(placeholderRegex, resolvedPetName)
                    }
                  } catch (err) {
                    console.error("[stripe-webhook] Failed to build prompt for order-paid payload:", err)
                  }

                  const firstName =
                    (orderRow.name || "").split(" ")[0] || (metadata.first_name as string | undefined) || ""

                  const payload = {
                    pet_image_url: (portraitRow.original_image_url as string | null) || "",
                    pet_name: resolvedPetName,
                    theme,
                    prompt,
                    order_id: orderRow.id,
                    user_email: orderRow.email,
                    user_first_name: firstName,
                    total_cents: item.price_cents ?? orderRow.amount_cents,
                    currency: session.currency || "usd",
                    showcase_consent: Boolean(portraitRow.showcase_consent),
                  }

                  const orderPaidUrl =
                    process.env.N8N_ORDER_PAID_WEBHOOK_URL ||
                    process.env.N8N_ORDER_PAID_URL ||
                    ""

                  if (!orderPaidUrl) {
                    console.error(
                      "[stripe-webhook] N8N order-paid webhook URL not configured (set N8N_ORDER_PAID_WEBHOOK_URL)",
                    )
                  } else {
                    try {
                      await fetch(orderPaidUrl, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                      })
                    } catch (err) {
                      console.error("[stripe-webhook] Failed to call n8n order-paid webhook:", err)
                    }
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("[stripe-webhook] Error handling checkout.session.completed:", err)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error("[stripe-webhook] Unexpected error:", err)
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error"
    return NextResponse.json(
      { error: "Internal error in stripe-webhook", details: message },
      { status: 500 },
    )
  }
}

