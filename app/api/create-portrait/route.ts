import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const BUCKET = "images"
const UPLOAD_PREFIX = "uploads"
const MAX_SIZE_MB = 10
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim()
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Portrait creation is not configured (N8N_WEBHOOK_URL missing)." },
      { status: 503 }
    )
  }

  let file: File
  let petName: string

  try {
    const formData = await request.formData()
    const rawFile = formData.get("file") ?? formData.get("image")
    if (!rawFile || !(rawFile instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image file (field: file or image)." },
        { status: 400 }
      )
    }
    file = rawFile

    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be a JPEG, PNG, or WebP image." },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Image must be under ${MAX_SIZE_MB} MB.` },
        { status: 400 }
      )
    }

    petName = (formData.get("pet_name") ?? formData.get("name") ?? "").toString().trim() || "My Pet"
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid form data.", details: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    )
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg")
  const path = `${UPLOAD_PREFIX}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}. Ensure Storage allows uploads to images/${UPLOAD_PREFIX}/.` },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const uploadUrl = urlData.publicUrl

  const payload = { test_image: uploadUrl, pet_name: petName, name: petName }

  let webhookOk = false
  let webhookStatus: number | null = null
  let webhookError: string | null = null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    webhookStatus = res.status
    webhookOk = res.ok
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      webhookError = text.slice(0, 200) || res.statusText
    }
  } catch (err) {
    webhookError = err instanceof Error ? err.message : "Request failed"
  }

  return NextResponse.json({
    queued: true,
    upload_url: uploadUrl,
    pet_name: petName,
    message: "Your portrait is being created. It may take a few minutes.",
    webhook_ok: webhookOk,
    ...(webhookStatus != null && { webhook_status: webhookStatus }),
    ...(webhookError && { webhook_error: webhookError }),
  })
}
