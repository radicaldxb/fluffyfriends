import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[submit-support] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured. Endpoint will return 500.",
  )
}

const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

const ERR_BAD_IMAGE_MAX =
  "You've already raised the maximum number of quality complaints for this order. Please contact us directly at hello@fluffyfriends.online"
const ERR_DUPLICATE_PORTRAIT =
  "A support request already exists for this portrait. Please contact us at hello@fluffyfriends.online if you need further help."
const ERR_OTHER_MAX =
  "You've reached the maximum number of support requests for this order. Please contact us directly at hello@fluffyfriends.online"

function ticketMatchesOrderRef(
  ticketPid: string | null | undefined,
  requestRef: string,
  canonicalPaymentIntentId: string,
): boolean {
  const t = (ticketPid || "").trim()
  if (!t) return false
  const req = requestRef.trim()
  const reqUpper = req.toUpperCase()
  if (canonicalPaymentIntentId && t === canonicalPaymentIntentId) return true
  if (req && t === req) return true
  if (reqUpper.length >= 6 && t.toUpperCase().endsWith(reqUpper)) return true
  return false
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Server configuration error. Please try again later." },
      { status: 500 },
    )
  }

  const {
    name,
    email,
    payment_intent_id,
    portrait_id,
    pet_name,
    theme,
    issue_type,
    message,
    original_image_url,
    generated_image_url,
    already_remade,
  } = (await request.json().catch(() => ({}))) as {
    name?: string
    email?: string
    payment_intent_id?: string
    portrait_id?: string | null
    pet_name?: string
    theme?: string
    issue_type?: string
    message?: string
    original_image_url?: string | null
    generated_image_url?: string | null
    already_remade?: boolean
  }

  const trimmedMessage = (message || "").trim()
  const trimmedEmail = (email || "").trim().toLowerCase()
  const refRaw = (payment_intent_id || "").trim()
  const issueNorm = (issue_type || "").trim()

  if (!trimmedEmail || !refRaw) {
    return NextResponse.json(
      { success: false, error: "Missing email or order reference." },
      { status: 400 },
    )
  }

  if (!issueNorm) {
    return NextResponse.json(
      { success: false, error: "Please choose the type of issue you need help with." },
      { status: 400 },
    )
  }

  if (issueNorm === "bad_image") {
    const pid = typeof portrait_id === "string" ? portrait_id.trim() : ""
    if (!pid) {
      return NextResponse.json(
        { success: false, error: "Please select the portrait this quality issue is about." },
        { status: 400 },
      )
    }
  }

  // Validate minimum message length
  if (!trimmedMessage || trimmedMessage.length < 50) {
    return NextResponse.json(
      {
        success: false,
        error: "Please provide more detail about your issue (minimum 50 characters).",
      },
      { status: 400 },
    )
  }

  const refUpper = refRaw.toUpperCase()
  let canonicalPaymentIntentId = refRaw
  let portraitsTotal: number | null = null

  const { data: purchaseRow } = await supabase
    .from("portrait_purchases")
    .select("payment_intent_id, stripe_session_id, portraits_total")
    .ilike("email", trimmedEmail)
    .or(
      `payment_intent_id.ilike.%${refUpper},stripe_session_id.ilike.%${refUpper}`,
    )
    .maybeSingle()

  if (purchaseRow) {
    const pt = purchaseRow.portraits_total
    portraitsTotal =
      typeof pt === "number" ? pt : pt != null ? Number(pt) : null
    const pi = purchaseRow.payment_intent_id
    if (typeof pi === "string" && pi.trim()) {
      canonicalPaymentIntentId = pi.trim()
    }
  }

  const { data: ticketRows, error: ticketFetchError } = await supabase
    .from("support_tickets")
    .select("id, portrait_id, issue_type, status, payment_intent_id")
    .ilike("email", trimmedEmail)

  if (ticketFetchError) {
    console.error("[submit-support] Failed to load existing tickets:", ticketFetchError)
    return NextResponse.json(
      { success: false, error: "Failed to validate request. Please try again." },
      { status: 500 },
    )
  }

  const existingTickets = (ticketRows || []).filter((t) =>
    ticketMatchesOrderRef(t.payment_intent_id, refRaw, canonicalPaymentIntentId),
  )

  const openTickets = existingTickets.filter((t) => t.status !== "resolved")

  const portraitIdForInsert =
    issueNorm === "bad_image" && typeof portrait_id === "string"
      ? portrait_id.trim()
      : null

  // Duplicate: same portrait_id + issue_type while not resolved
  if (portraitIdForInsert) {
    const dup = openTickets.find(
      (t) =>
        t.portrait_id === portraitIdForInsert &&
        (t.issue_type || "").trim() === issueNorm,
    )
    if (dup) {
      return NextResponse.json({ success: false, error: ERR_DUPLICATE_PORTRAIT }, { status: 400 })
    }
  }

  if (issueNorm === "bad_image") {
    const maxTickets =
      portraitsTotal === 1 ? 1 : portraitsTotal != null && portraitsTotal > 1 ? 3 : 1
    const badImageOpen = openTickets.filter((t) => (t.issue_type || "").trim() === "bad_image")
    if (badImageOpen.length >= maxTickets) {
      return NextResponse.json({ success: false, error: ERR_BAD_IMAGE_MAX }, { status: 400 })
    }
  } else {
    const otherOpen = openTickets.filter((t) => (t.issue_type || "").trim() !== "bad_image")
    if (otherOpen.length >= 2) {
      return NextResponse.json({ success: false, error: ERR_OTHER_MAX }, { status: 400 })
    }
  }

  // Insert ticket
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      email: trimmedEmail,
      name,
      payment_intent_id: canonicalPaymentIntentId,
      portrait_id: portraitIdForInsert,
      pet_name,
      theme,
      issue_type: issueNorm,
      message: trimmedMessage,
      original_image_url,
      generated_image_url,
      status: already_remade ? "escalated" : "pending",
      credit_added: false,
    })
    .select()
    .single()

  if (error || !ticket) {
    console.error("[submit-support] Failed to insert support_tickets row:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit request." },
      { status: 500 },
    )
  }

  // Trigger n8n WF4 support workflow (best-effort; we don't fail the request if this call fails)
  const n8nSupportUrl = process.env.N8N_SUPPORT_WEBHOOK_URL?.trim()
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET

  console.log("[submit-support] calling WF4:", process.env.N8N_SUPPORT_WEBHOOK_URL)

  if (n8nSupportUrl) {
    try {
      await fetch(n8nSupportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nSecret ? { "X-Webhook-Secret": n8nSecret } : {}),
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          name,
          email: trimmedEmail,
          payment_intent_id: canonicalPaymentIntentId,
          portrait_id: portraitIdForInsert,
          pet_name,
          theme,
          issue_type: issueNorm,
          message: trimmedMessage,
          original_image_url,
          generated_image_url,
          already_remade: Boolean(already_remade),
          site_url: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      })
    } catch (err) {
      console.error("[submit-support] Failed to call n8n support webhook (WF4):", err)
    }
  } else {
    console.warn(
      "[submit-support] N8N_SUPPORT_WEBHOOK_URL not configured; skipping WF4 trigger.",
    )
  }

  return NextResponse.json({ success: true, ticket_id: ticket.id })
}
