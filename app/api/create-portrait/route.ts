import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getActiveThemes, getPromptAndNameTagConfig } from "@/lib/theme-prompts"
import { DEFAULT_NAMETAG_INSTRUCTION } from "@/lib/themes"

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
        {
          error: "Portrait creation is not configured (N8N_WEBHOOK_URL missing).",
          hint: "Running locally? Add N8N_WEBHOOK_URL to .env.local in the project root, then restart the dev server (npm run dev). Check http://localhost:3000/api/env-check to confirm the app sees it.",
        },
        { status: 503 }
      )
    }

    let file: File
    let petName: string
    let theme: string
    let showcaseConsent: boolean

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
    showcaseConsent = formData.get("showcase_consent") === "true" || formData.get("showcase_consent") === "1"
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

  // Fetch prompt and name-tag config from Supabase (single source of truth per theme)
  const { prompt: basePrompt, hasNameTag, nameTagInstruction } = await getPromptAndNameTagConfig(normalizedTheme)
  let prompt = basePrompt

  // Safety net: if this theme uses a name tag but the prompt doesn't include {{PET_NAME}},
  // append the theme-specific or default name-tag instruction.
  if (hasNameTag && !/\{\{\s*PET_NAME\s*\}\}/i.test(prompt)) {
    const appendix = nameTagInstruction ?? DEFAULT_NAMETAG_INSTRUCTION
    prompt = `${prompt}\n\n9. NAME PATCH: ${appendix}`
  }

  // Theme-specific name: prompts can include {{PET_NAME}} (with or without spaces) for placement (e.g. fireman chest patch)
  const resolvedPetName = petName?.trim() || "My Pet"
  const placeholderRegex = /\{\{\s*PET_NAME\s*\}\}/gi
  prompt = prompt.replace(placeholderRegex, resolvedPetName)
  if (/\{\{\s*PET_NAME\s*\}\}/i.test(prompt)) {
    console.warn("[create-portrait] Prompt still contains {{PET_NAME}} after replace — check replacement logic")
  }

  const payload = {
    // Legacy field name used by older workflows
    test_image: uploadUrl,
    // New explicit field name expected by FluffyFriends Workflow 1
    pet_image_url: uploadUrl,
    pet_name: resolvedPetName,
    name: resolvedPetName,
    theme: normalizedTheme,
    prompt,
    theme_has_nametag: hasNameTag,
    showcase_consent: showcaseConsent,
  }

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

    const text = await res.text().catch(() => "")
    let body: any = {}
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        // fall through to generic error handling below
      }
    }

    if (!res.ok) {
      const reason =
        typeof body?.reason === "string" && body.reason.trim().length > 0
          ? body.reason.trim()
          : text.slice(0, 200) || res.statusText || "Validator request failed."
      // If n8n explicitly marked the photo as rejected, surface that as a validation error
      if (body?.rejected) {
        return NextResponse.json(
          {
            rejected: true,
            reason,
          },
          { status: 400 },
        )
      }

      console.error("[create-portrait] WF1 webhook error:", { status: res.status, reason })
      return NextResponse.json(
        {
          error: "Portrait validation is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 },
      )
    }

    // Expected success shape from WF1:
    // { success: true, portrait_id: "..." }
    const success = body?.success !== false
    const portraitId = typeof body?.portrait_id === "string" ? body.portrait_id : null

    if (!success || !portraitId) {
      const reason =
        typeof body?.reason === "string" && body.reason.trim().length > 0
          ? body.reason.trim()
          : "This photo doesn't meet our requirements. Please upload a clear photo of a single pet (no people or objects)."
      return NextResponse.json(
        {
          rejected: true,
          reason,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        portrait_id: portraitId,
        upload_url: uploadUrl,
        pet_name: resolvedPetName,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("[create-portrait] WF1 webhook exception:", err)
    return NextResponse.json(
      {
        error: "Portrait validation failed. Please try again in a moment.",
      },
      { status: 503 },
    )
  }
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
