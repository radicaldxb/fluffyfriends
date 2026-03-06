import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const BUCKET = "images"
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET?.trim()

export async function POST(request: NextRequest) {
  // Verify webhook secret when configured (prevents unauthorized callbacks)
  if (WEBHOOK_SECRET) {
    const provided =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Provide valid X-Webhook-Secret or Authorization: Bearer <secret>." },
        { status: 401 }
      )
    }
  }

  let body: Record<string, unknown>
  try {
    const raw = await request.text()
    if (!raw?.trim()) {
      return NextResponse.json(
        { error: "Empty request body. In n8n, ensure the HTTP Request node has Send Body enabled and a valid JSON body with image_base64." },
        { status: 400 }
      )
    }
    body = JSON.parse(raw) as Record<string, unknown>
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body. In n8n, ensure the body is valid JSON and image_base64 is a string (no leading = in body).", details: e instanceof Error ? e.message : "Parse error" },
      { status: 400 }
    )
  }

  try {
    const portraitId =
      typeof body.portrait_id === "string" ? (body.portrait_id as string).trim() : ""

    // New path: WF2 sends a specific portrait_id plus preview + Gemini URLs.
    // In this case we update the existing pet_portraits row directly by id and
    // do not try to match by original_image_url or upload anything to Storage.
    if (portraitId) {
      console.log(
        "[receive-n8n-image] portrait_id payload",
        JSON.stringify({
          portrait_id: portraitId,
          has_image_url: typeof body.image_url === "string" && !!(body.image_url as string).trim(),
          has_gemini_image_url:
            typeof body.gemini_image_url === "string" &&
            !!(body.gemini_image_url as string).trim(),
          status: typeof body.status === "string" ? (body.status as string).trim() : undefined,
          keys: Object.keys(body),
        }),
      )
      const avifUrl =
        typeof body.image_url === "string" ? (body.image_url as string).trim() : ""
      const geminiImageUrl =
        typeof body.gemini_image_url === "string"
          ? (body.gemini_image_url as string).trim()
          : ""
      const statusFromBody =
        typeof body.status === "string" ? (body.status as string).trim() : ""
      const status = statusFromBody || "preview"

      const updatePayload: Record<string, unknown> = {
        status,
      }
      if (avifUrl) {
        updatePayload.image_url = avifUrl
      }
      if (geminiImageUrl) {
        updatePayload.original_image_url = geminiImageUrl
      }

      const { error: updateError } = await supabase
        .from("pet_portraits")
        .update(updatePayload)
        .eq("id", portraitId)

      if (updateError) {
        console.error("[receive-n8n-image] portrait_id update error:", updateError)
        return NextResponse.json(
          {
            error: "Failed to update portrait with generated image",
            details: updateError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        portrait_id: portraitId,
        image_url: avifUrl || null,
        original_image_url: geminiImageUrl || null,
        status,
      })
    }

    const originalImageUrl = body.original_image_url ?? body.test_image ?? null
    // Rejection from n8n subject validation (single-pet check): no image, just store reason for client to show
    const rejected = body.rejected === true
    const rejectionReason = typeof body.reason === "string" ? body.reason.trim() : ""
    if (rejected && rejectionReason && typeof originalImageUrl === "string") {
      const petName = body.pet_name || body.name || "My Pet"
      const { error: insertError } = await supabase.from("pet_portraits").insert({
        image_url: originalImageUrl,
        pet_name: petName,
        status: "rejected",
        rejection_reason: rejectionReason,
        original_image_url: originalImageUrl,
      })
      if (insertError) {
        console.error("[receive-n8n-image] Rejection insert error:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: "Rejection recorded" })
    }

    // n8n can send image as base64, binary data URL, or URL
    let imageBuffer: Buffer | null = null
    let imageExt = "jpg"
    let imageMimeType = "image/jpeg"

    // If image_url is already a final external URL (e.g. Cloudinary .avif),
    // we can skip uploading to Supabase Storage and store the URL directly.
    const incomingImageUrl =
      typeof body.image_url === "string" ? (body.image_url as string).trim() : ""
    const useExternalImageUrlDirectly =
      !!incomingImageUrl &&
      !body.image_base64 &&
      !body.image_data_url &&
      !body.image_binary

    let publicUrl: string
    let path: string | null = null

    if (useExternalImageUrlDirectly) {
      // Treat image_url as the final display URL (e.g. Cloudinary .avif)
      publicUrl = incomingImageUrl
    } else {
      // Handle base64 image (most common from n8n)
      if (body.image_base64) {
        const base64Data = (body.image_base64 as string).replace(/^data:image\/\w+;base64,/, "")
        imageBuffer = Buffer.from(base64Data, "base64")
        const mimeMatch = (body.image_base64 as string).match(/data:image\/(\w+);base64/)
        if (mimeMatch) {
          imageExt = mimeMatch[1] === "jpeg" ? "jpg" : mimeMatch[1]
          imageMimeType = `image/${mimeMatch[1]}`
        }
      }
      // Handle binary data URL
      else if (body.image_data_url) {
        const base64Data = (body.image_data_url as string).replace(/^data:image\/\w+;base64,/, "")
        imageBuffer = Buffer.from(base64Data, "base64")
        const mimeMatch = (body.image_data_url as string).match(/data:image\/(\w+);base64/)
        if (mimeMatch) {
          imageExt = mimeMatch[1] === "jpeg" ? "jpg" : mimeMatch[1]
          imageMimeType = `image/${mimeMatch[1]}`
        }
      }
      // Handle image URL (download and store)
      else if (body.image_url) {
        try {
          const imageRes = await fetch(incomingImageUrl)
          if (!imageRes.ok) {
            return NextResponse.json({ error: "Failed to download image from URL" }, { status: 400 })
          }
          imageBuffer = Buffer.from(await imageRes.arrayBuffer())
          const contentType = imageRes.headers.get("content-type")
          if (contentType?.startsWith("image/")) {
            imageMimeType = contentType
            imageExt = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
          }
        } catch (err) {
          return NextResponse.json(
            { error: `Failed to fetch image: ${err instanceof Error ? err.message : String(err)}` },
            { status: 400 }
          )
        }
      }
      // Handle binary data directly (if n8n sends as binary)
      else if (body.image_binary) {
        imageBuffer = Buffer.from(body.image_binary as string, "base64")
      }

      if (!imageBuffer) {
        return NextResponse.json(
          { error: "No image data provided. Send image_base64, image_data_url, image_url, or image_binary" },
          { status: 400 }
        )
      }

      // Generate unique filename
      const filename = `n8n-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${imageExt}`
      path = `generated/${filename}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, imageBuffer, {
        contentType: imageMimeType,
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      publicUrl = urlData.publicUrl
    }

    // Update or insert pet_portrait record
    const petName = body.pet_name || body.name || null
    const userEmail = body.user_email || null
    const status = body.status || "completed"
    // Only treat as consented when explicitly true; missing or invalid => false (don't show in gallery)
    const showcaseConsent =
      body.showcase_consent === true || body.showcase_consent === "true" || body.showcase_consent === "1"
        ? true
        : false

    // Try to find existing record by original_image_url or pet_name
    let recordId: string | null = null

    if (originalImageUrl) {
      const { data: existing } = await supabase
        .from("pet_portraits")
        .select("id")
        .eq("image_url", originalImageUrl)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        recordId = existing.id
      }
    }

    let tableError: string | null = null

    if (recordId) {
      // Update existing record with generated image
      const updatePayload: Record<string, unknown> = {
        image_url: publicUrl,
        status: status,
        showcase_consent: showcaseConsent,
      }
      if (typeof originalImageUrl === "string" && originalImageUrl) {
        updatePayload.original_image_url = originalImageUrl
      }
      const { error: updateError } = await supabase
        .from("pet_portraits")
        .update(updatePayload)
        .eq("id", recordId)

      if (updateError) {
        console.error("Update error:", updateError)
        tableError = updateError.message
      }
    } else {
      // Insert new record (requires anon insert policy – see supabase/run-allow-anon-insert-pet-portraits.sql)
      const insertPayload: Record<string, unknown> = {
        image_url: publicUrl,
        pet_name: petName,
        status: status,
        user_email: userEmail,
        showcase_consent: showcaseConsent,
      }
      if (typeof originalImageUrl === "string" && originalImageUrl.trim()) {
        insertPayload.original_image_url = originalImageUrl.trim()
      }
      const { error: insertError } = await supabase.from("pet_portraits").insert(insertPayload)

      if (insertError) {
        console.error("Insert error:", insertError)
        tableError = insertError.message
      }
    }

    const storedOriginal =
      typeof originalImageUrl === "string" && originalImageUrl.length > 0

    return NextResponse.json({
      success: true,
      image_url: publicUrl,
      original_image_url: storedOriginal ? originalImageUrl : undefined,
      path,
      message: "Image stored successfully",
      original_image_url_stored: storedOriginal,
      ...(tableError && { table_error: tableError }),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
