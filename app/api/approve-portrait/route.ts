import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

function getStripeClient(secret: string) {
  return new Stripe(secret, {
    apiVersion: "2023-10-16",
  })
}

async function resolveSessionContext(sessionId: string) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY

  if (!stripeSecret) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }

  const stripe = getStripeClient(stripeSecret)
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  const metadata = session.metadata || {}
  const orderId = (metadata.order_id as string | undefined) || null
  const portraitIdFromMetadata = (metadata.portrait_id as string | undefined) || null

  if (!orderId) {
    throw new Error("Missing order_id in Stripe session metadata")
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, email, name, amount_cents")
    .eq("id", orderId)
    .single()

  if (orderError || !orderRow) {
    throw new Error("Failed to load order for approve-portrait")
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, price_cents, credits_remaining, portrait_ids")
    .eq("order_id", orderId)

  if (itemsError || !items || items.length === 0) {
    throw new Error("Failed to load order_items for approve-portrait")
  }

  const item = items[0]
  const portraitIds: string[] =
    portraitIdFromMetadata != null && portraitIdFromMetadata !== ""
      ? [portraitIdFromMetadata]
      : ((item.portrait_ids as string[]) || [])

  const portraitId = portraitIds[0]
  if (!portraitId) {
    throw new Error("No portrait_id available for approve-portrait")
  }

  const { data: portraitRow, error: portraitError } = await supabase
    .from("pet_portraits")
    .select("id, pet_name, image_url, original_image_url")
    .eq("id", portraitId)
    .single()

  if (portraitError || !portraitRow) {
    throw new Error("Failed to load pet_portraits row for approve-portrait")
  }

  const rawPetName = (portraitRow.pet_name as string | null) || "My Pet"
  const resolvedPetName = rawPetName.trim() || "My Pet"

  const firstNameFromOrder = (orderRow.name || "").split(" ")[0] || ""
  const firstNameFromMetadata = (metadata.first_name as string | undefined) || ""
  const firstName = firstNameFromOrder || firstNameFromMetadata || ""

  const totalCents =
    (item.price_cents as number | null | undefined) != null
      ? (item.price_cents as number)
      : (orderRow.amount_cents as number | null | undefined) || 0

  const currency = session.currency || "usd"

  return {
    orderId: orderRow.id as string,
    email: orderRow.email as string,
    firstName,
    totalCents,
    currency,
    portraitId: portraitRow.id as string,
    petName: resolvedPetName,
    imageUrl: (portraitRow.image_url as string | null) || "",
    originalImageUrl: (portraitRow.original_image_url as string | null) || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")?.trim()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const ctx = await resolveSessionContext(sessionId)

    // Only expose the preview once the portrait actually has an image_url.
    // Until then, keep the frontend in the loading state and let it poll.
    if (!ctx.imageUrl) {
      return NextResponse.json(
        {
          error: "Portrait is still generating. Please wait a bit longer.",
          code: "PORTRAIT_NOT_READY",
        },
        { status: 202 },
      )
    }

    return NextResponse.json(
      {
        portrait_id: ctx.portraitId,
        pet_name: ctx.petName,
        order_id: ctx.orderId,
        amount_cents: ctx.totalCents,
        currency: ctx.currency,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("[approve-portrait][GET] Error:", err)
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error"
    return NextResponse.json(
      { error: "Failed to resolve session", details: message },
      { status: 400 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const sessionId =
      typeof body.session_id === "string" ? body.session_id.trim() : ""

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id in request body" },
        { status: 400 },
      )
    }

    const ctx = await resolveSessionContext(sessionId)

    const originalImageUrl = ctx.originalImageUrl || ctx.imageUrl
    if (!originalImageUrl) {
      return NextResponse.json(
        {
          error:
            "Portrait does not have an original_image_url or image_url available for upscaling.",
        },
        { status: 400 },
      )
    }

    const upscalerUrl =
      process.env.N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL?.trim() ||
      "https://n8n.srv943460.hstgr.cloud/webhook/upscale-and-email"

    try {
      const res = await fetch(upscalerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portrait_id: ctx.portraitId,
          original_image_url: originalImageUrl,
          avif_url: ctx.imageUrl || null,
          order_id: ctx.orderId,
          user_email: ctx.email,
          user_first_name: ctx.firstName,
          total_cents: ctx.totalCents,
          currency: ctx.currency,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        console.error("[approve-portrait][POST] n8n responded with error:", res.status, text)
        return NextResponse.json(
          {
            error: "Upscale + email workflow call failed",
            status: res.status,
            body: text.slice(0, 200),
          },
          { status: 502 },
        )
      }
    } catch (err) {
      console.error("[approve-portrait][POST] Failed to call n8n upscaler:", err)
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error"
      return NextResponse.json(
        { error: "Failed to call upscaler workflow", details: message },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "Portrait approved. We’ll upscale your image and email your print‑ready files shortly.",
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("[approve-portrait][POST] Unexpected error:", err)
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error"
    return NextResponse.json(
      { error: "Internal error in approve-portrait", details: message },
      { status: 500 },
    )
  }
}

