import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getActiveThemes, getPromptForTheme } from "@/lib/theme-prompts"

const BUCKET = "images"
const UPLOAD_PREFIX = "uploads"
const MAX_SIZE_MB = 10
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim()
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Portrait creation is not configured (N8N_WEBHOOK_URL missing)." },
        { status: 503 }
      )
    }

    let file: File
    let petName: string
    let theme: string

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
    theme = (formData.get("theme") ?? "").toString().trim()
    const showcaseConsent = formData.get("showcase_consent") === "true" || formData.get("showcase_consent") === "1"
    if (!theme) {
      return NextResponse.json(
        { error: "Please select a theme." },
        { status: 400 }
      )
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid form data.", details: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    )
  }

  // Check Supabase environment variables before attempting upload
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[create-portrait] Missing Supabase environment variables")
    return NextResponse.json(
      { error: "Server configuration error: Supabase credentials not configured." },
      { status: 500 }
    )
  }

  // Validate theme against active themes in DB (single source of truth)
  const normalizedTheme = theme.toLowerCase()
  const validThemes = await getActiveThemes()
  if (!validThemes.includes(normalizedTheme)) {
    return NextResponse.json(
      { error: "Please select a valid theme." },
      { status: 400 }
    )
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg")
  const path = `${UPLOAD_PREFIX}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Subject validation (single pet only) runs in n8n workflow using the same Gemini key.

  let uploadError
  try {
    const result = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })
    uploadError = result.error
  } catch (supabaseError) {
    console.error("[create-portrait] Supabase upload exception:", supabaseError)
    return NextResponse.json(
      { 
        error: "Failed to upload image to storage.",
        details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError)
      },
      { status: 500 }
    )
  }

  if (uploadError) {
    console.error("[create-portrait] Supabase upload error:", uploadError)
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}. Ensure Storage allows uploads to images/${UPLOAD_PREFIX}/.` },
      { status: 500 }
    )
  }

  let uploadUrl
  try {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    uploadUrl = urlData.publicUrl
  } catch (urlError) {
    console.error("[create-portrait] Failed to get public URL:", urlError)
    return NextResponse.json(
      { error: "Failed to generate image URL." },
      { status: 500 }
    )
  }

  // Fetch prompt from Supabase (with fallback)
  const prompt = await getPromptForTheme(normalizedTheme)

  const payload = { 
    test_image: uploadUrl, 
    pet_name: petName, 
    name: petName, 
    theme: normalizedTheme,
    prompt: prompt,
    showcase_consent: showcaseConsent
  }

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

  // If n8n did not accept the job, return error so the user gets honest feedback
  if (!webhookOk) {
    console.error("[create-portrait] Webhook failed:", { webhookStatus, webhookError })
    return NextResponse.json(
      {
        error: "Portrait creation is temporarily unavailable. Please try again in a moment.",
        ...(webhookStatus != null && { webhook_status: webhookStatus }),
        ...(webhookError && { webhook_error: webhookError }),
      },
      { status: 503 }
    )
  }

  return NextResponse.json({
    queued: true,
    upload_url: uploadUrl,
    pet_name: petName,
    message: "Your portrait is being created. It may take a few minutes.",
  })
  } catch (error) {
    // Log full error details for debugging
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const errorDetails = {
      id: errorId,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString(),
    }
    
    // Log to server console (visible in Netlify logs)
    console.error(`[${errorId}] Error in create-portrait API:`, {
      message: errorDetails.message,
      stack: errorDetails.stack,
      name: errorDetails.name,
    })
    
    // In development, include more details; in production, be more generic
    const isDevelopment = process.env.NODE_ENV === "development"
    
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your request.",
        error_id: errorId, // Include error ID so user can report it
        ...(isDevelopment && {
          details: errorDetails.message,
          stack: errorDetails.stack,
        }),
      },
      { status: 500 }
    )
  }
}
