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
  const portraitIdRaw = (metadata.portrait_id as string | undefined) || null
  const portraitId = portraitIdRaw?.trim() || ""

  if (!portraitId) {
    throw new Error("Missing portrait_id in Stripe session metadata")
  }

  const { data: portraitRow, error: portraitError } = await supabase
    .from("pet_portraits")
    .select("id, pet_name, image_url, original_image_url, created_at, status")
    .eq("id", portraitId)
    .single()

  if (portraitError || !portraitRow) {
    throw new Error("Failed to load pet_portraits row for approve-portrait")
  }

  const rawPetName = (portraitRow.pet_name as string | null) || "My Pet"
  const resolvedPetName = rawPetName.trim() || "My Pet"

  let imageUrl = (portraitRow.image_url as string | null) || ""
  let effectivePortraitId = portraitRow.id as string

  if (!imageUrl) {
    console.warn("[approve-portrait][GET] Portrait not ready yet", { portrait_id: portraitId })
  }

  const totalCents = typeof session.amount_total === "number" ? session.amount_total : 0
  const currency = session.currency || "usd"

  return {
    portraitId: effectivePortraitId,
    petName: resolvedPetName,
    imageUrl,
    originalImageUrl: (portraitRow.original_image_url as string | null) || null,
    totalCents,
    currency,
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim()
  // Log every request so Netlify shows something when you search "approve-portrait"
  console.log(
    "[approve-portrait][GET] request",
    sessionId ? `session_id=${sessionId.slice(0, 12)}…` : "missing session_id",
  )

  try {
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const ctx = await resolveSessionContext(sessionId)
    const hasImage = !!ctx.imageUrl
    console.log(
      "[approve-portrait][GET] resolved",
      JSON.stringify({
        portrait_id: ctx.portraitId,
        pet_name: ctx.petName,
        has_image: hasImage,
        status: hasImage ? 200 : 202,
      }),
    )

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
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const city = typeof body.city === "string" ? body.city.trim() : ""
    const country = typeof body.country === "string" ? body.country.trim() : ""
    const state = typeof body.state === "string" ? body.state.trim() : ""
    const newsletterConsent =
      typeof body.newsletter_consent === "boolean" ? body.newsletter_consent : false

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id in request body" },
        { status: 400 },
      )
    }

    if (!email || !fullName || !city || !country) {
      return NextResponse.json(
        { error: "Missing email, full_name, city, or country" },
        { status: 400 },
      )
    }

    const ctx = await resolveSessionContext(sessionId)
    let deductResult: { portraits_remaining?: number } | null = null

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

    // Upsert user
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          email,
          full_name: fullName,
          city,
          country,
          state: state || null,
          newsletter_consent: newsletterConsent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      )
      .select("id")
      .single()

    if (userError || !userRow) {
      console.error("[approve-portrait][POST] Failed to upsert user:", userError)
      return NextResponse.json(
        { error: "Failed to save your details. Please try again." },
        { status: 500 },
      )
    }

    // Attach user to portrait
    const { error: portraitUpdateError } = await supabase
      .from("pet_portraits")
      .update({ user_id: userRow.id })
      .eq("id", ctx.portraitId)

    if (portraitUpdateError) {
      console.error("[approve-portrait][POST] Failed to attach user to portrait:", portraitUpdateError)
      return NextResponse.json(
        { error: "Failed to link your portrait. Please try again." },
        { status: 500 },
      )
    }

    const upscalerUrl = process.env.N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL?.trim()
    if (!upscalerUrl) {
      throw new Error("N8N_UPSCALE_AND_EMAIL_WEBHOOK_URL is not configured")
    }

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
          user_email: email,
          user_first_name: fullName.split(" ")[0] || fullName,
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

    // Deduct portrait from balance after WF3 is triggered
    if (email) {
      try {
        const deductRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/deduct-portrait`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          },
        )
        if (!deductRes.ok) {
          console.error("[approve-portrait][POST] Failed to deduct portrait from balance")
        } else {
          deductResult = await deductRes.json().catch(() => null)
        }
      } catch (err) {
        console.error("[approve-portrait][POST] Error calling deduct-portrait:", err)
      }
    }

    // After WF3 completes, poll Supabase briefly for updated URLs so we can
    // return download links directly on the success page.
    const maxAttempts = 15
    const delayMs = 2000
    let updatedPortrait: { landscape_url: string | null; portrait_url: string | null } | null = null
    let lastError: unknown = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await supabase
        .from("pet_portraits")
        .select("landscape_url, portrait_url")
        .eq("id", ctx.portraitId)
        .single()

      if (!error && data?.landscape_url && data?.portrait_url) {
        updatedPortrait = data as { landscape_url: string; portrait_url: string }
        break
      }

      lastError = error
      // Small delay before trying again to give WF3 time to finish.
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    if (!updatedPortrait?.landscape_url || !updatedPortrait?.portrait_url) {
      console.error(
        "[approve-portrait][POST] Timed out waiting for upscaled URLs",
        lastError,
      )
      return NextResponse.json(
        {
          error:
            "Upscale completed, but we could not load your download links yet. Please refresh this page in a moment.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        landscape_url: updatedPortrait.landscape_url,
        portrait_url: updatedPortrait.portrait_url,
        portraits_remaining: deductResult?.portraits_remaining ?? null,
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

