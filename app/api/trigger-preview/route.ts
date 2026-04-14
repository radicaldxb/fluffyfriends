import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const N8N_PREVIEW_WEBHOOK = "https://n8n.srv943460.hstgr.cloud/webhook/generate-preview-v2"
const WEBHOOK_SECRET = "2f6d19c4493bbd81c05ba706d9fc1d5b4dc8bd6189cdbec0"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { portrait_id, pet_name, theme, user_email, showcase_consent } = body

    if (!portrait_id || !pet_name || !theme) {
      return NextResponse.json(
        { error: "Missing required fields: portrait_id, pet_name, theme" },
        { status: 400 },
      )
    }

    const { data: portrait } = await supabase
      .from("pet_portraits")
      .select("pet_image_url, validation_text")
      .eq("id", portrait_id)
      .single()

    const storedPetImageUrl = portrait?.pet_image_url ?? ""

    if (!storedPetImageUrl) {
      return NextResponse.json(
        { error: "Portrait not found or missing pet_image_url" },
        { status: 400 },
      )
    }

    // Update portrait status to generating
    const { error: updateError } = await supabase
      .from("pet_portraits")
      .update({ status: "generating" })
      .eq("id", portrait_id)

    if (updateError) {
      console.error("Failed to update portrait status:", updateError)
      return NextResponse.json({ error: "Database update failed" }, { status: 500 })
    }

    // Fire WF2-NEW — do not await, fire and forget
    fetch(N8N_PREVIEW_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        portrait_id,
        pet_name,
        theme,
        pet_image_url: storedPetImageUrl,
        user_email: user_email || "",
        showcase_consent: showcase_consent || false,
        order_id: portrait_id,
        payment_intent_id: "",
      }),
    }).catch((err) => console.error("WF2-NEW trigger failed:", err))

    return NextResponse.json({ ok: true, portrait_id })
  } catch (err) {
    console.error("trigger-preview error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
