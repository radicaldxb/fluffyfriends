import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getStripeClient } from "@/lib/stripe"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const body = await request.json().catch(() => ({}))
  const portraitId = typeof body.portrait_id === "string" ? body.portrait_id.trim() : ""
  const showcaseConsent = body.showcase_consent === true
  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : ""
  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!portraitId) {
    return NextResponse.json({ error: "Missing portrait_id" }, { status: 400 })
  }

  let authorized = false

  if (sessionId) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 })
    }
    try {
      const stripe = getStripeClient(stripeSecret)
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      const metaPid = (session.metadata?.portrait_id as string | undefined)?.trim() || ""
      if (metaPid === portraitId) {
        authorized = true
      } else {
        return NextResponse.json({ error: "Session does not match this portrait" }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid payment session" }, { status: 403 })
    }
  }

  if (!authorized && emailRaw) {
    const { data: row, error: fetchErr } = await supabase
      .from("pet_portraits")
      .select("id, user_email")
      .eq("id", portraitId)
      .maybeSingle()

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Portrait not found" }, { status: 404 })
    }
    const rowEmail = (row.user_email as string | null)?.trim().toLowerCase() || ""
    if (!rowEmail || rowEmail === emailRaw) {
      authorized = true
    }
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Missing session_id or valid email for this portrait" },
      { status: 403 },
    )
  }

  const { error } = await supabase
    .from("pet_portraits")
    .update({ showcase_consent: showcaseConsent })
    .eq("id", portraitId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
