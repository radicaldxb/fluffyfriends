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
    portrait_id?: string
    pet_name?: string
    theme?: string
    issue_type?: string
    message?: string
    original_image_url?: string | null
    generated_image_url?: string | null
    already_remade?: boolean
  }

  const trimmedMessage = (message || "").trim()

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

  // Insert ticket
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      email,
      name,
      payment_intent_id,
      portrait_id,
      pet_name,
      theme,
      issue_type,
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
  const n8nBase = process.env.N8N_WEBHOOK_URL
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET

  if (n8nBase) {
    try {
      await fetch(`${n8nBase.replace(/\/+$/, "")}/support-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nSecret ? { "X-Webhook-Secret": n8nSecret } : {}),
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          name,
          email,
          payment_intent_id,
          portrait_id,
          pet_name,
          theme,
          issue_type,
          message: trimmedMessage,
          original_image_url,
          generated_image_url,
          already_remade: Boolean(already_remade),
          site_url: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      })
    } catch (err) {
      console.error("[submit-support] Failed to call n8n support-request webhook:", err)
    }
  } else {
    console.warn("[submit-support] N8N_WEBHOOK_URL not configured; skipping WF4 trigger.")
  }

  return NextResponse.json({ success: true, ticket_id: ticket.id })
}

