import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getStripeClient } from "@/lib/stripe"

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

      try {
        const portraitIdRaw = (metadata.portrait_id as string | undefined) || null
        const portraitId = portraitIdRaw?.trim() || ""

        if (!portraitId) {
          console.error("[stripe-webhook] Missing portrait_id in session metadata")
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
            const theme = (
              ((portraitRow.theme as string | null) || "").trim() ||
              (metadata.theme as string | undefined) ||
              ""
            ).toLowerCase()

            const customerEmail =
              session.customer_details?.email ||
              (session.customer_email as string | null) ||
              ""
            const customerName = session.customer_details?.name || ""
            const firstName = (customerName || "").split(" ")[0] || ""

            const totalCents =
              typeof session.amount_total === "number" ? session.amount_total : null

            const payload = {
              portrait_id: portraitRow.id,
              pet_image_url: (portraitRow.original_image_url as string | null) || "",
              pet_name: resolvedPetName,
              theme,
              order_id: session.id,
              user_email: customerEmail,
              user_first_name: firstName,
              total_cents: totalCents,
              currency: session.currency || "usd",
              showcase_consent: Boolean(portraitRow.showcase_consent),
            }

            // Record portrait purchase for this session (portrait pack system)
            const packageName = (metadata.package as string | undefined) || "starter"
            const portraitsMap: Record<string, number> = {
              starter: 1,
              portrait_pack: 4,
              family_pack: 8,
            }
            const portraitsTotal = portraitsMap[packageName] || 1

            // Handle both string and object forms of session.payment_intent
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null

            if (customerEmail) {
              const { error: purchaseError } = await supabase
                .from("portrait_purchases")
                .insert({
                  email: customerEmail,
                  stripe_session_id: session.id,
                  package: packageName,
                  portraits_total: portraitsTotal,
                  portraits_used: 0,
                  portraits_remaining: portraitsTotal,
                  payment_intent_id: paymentIntentId,
                })

              if (purchaseError) {
                console.error(
                  "[stripe-webhook] Failed to create portrait_purchases row:",
                  purchaseError,
                )
              }
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
                console.log(
                  "[stripe-webhook] Calling WF2",
                  JSON.stringify({
                    portrait_id: payload.portrait_id,
                    orderPaidUrl,
                    total_cents: payload.total_cents,
                    currency: payload.currency,
                  }),
                )

                const res = await fetch(orderPaidUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                })

                const text = await res.text().catch(() => "")
                if (!res.ok) {
                  console.error(
                    "[stripe-webhook] WF2 responded with non-200",
                    JSON.stringify({
                      status: res.status,
                      body: text.slice(0, 200),
                    }),
                  )
                } else {
                  console.log(
                    "[stripe-webhook] WF2 call ok",
                    JSON.stringify({
                      status: res.status,
                    }),
                  )
                }

                // Mark portrait as generating once we've handed it off to n8n
                // Also set user_email so My Portraits can find this portrait by email (case-insensitive)
                const portraitEmail = (customerEmail || "").trim().toLowerCase()
                const { error: portraitStatusError } = await supabase
                  .from("pet_portraits")
                  .update({
                    status: "generating",
                    ...(portraitEmail ? { user_email: portraitEmail } : {}),
                  })
                  .eq("id", portraitRow.id)

                if (portraitStatusError) {
                  console.error(
                    "[stripe-webhook] Failed to update pet_portraits status to generating:",
                    portraitStatusError,
                  )
                }
              } catch (err) {
                console.error("[stripe-webhook] Failed to call n8n order-paid webhook:", err)
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

