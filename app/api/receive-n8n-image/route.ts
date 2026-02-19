import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const BUCKET = "images"
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET // Optional: for security

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // n8n can send image as base64, binary data URL, or URL
    let imageBuffer: Buffer | null = null
    let imageExt = "jpg"
    let imageMimeType = "image/jpeg"

    // Handle base64 image (most common from n8n)
    if (body.image_base64) {
      const base64Data = body.image_base64.replace(/^data:image\/\w+;base64,/, "")
      imageBuffer = Buffer.from(base64Data, "base64")
      const mimeMatch = body.image_base64.match(/data:image\/(\w+);base64/)
      if (mimeMatch) {
        imageExt = mimeMatch[1] === "jpeg" ? "jpg" : mimeMatch[1]
        imageMimeType = `image/${mimeMatch[1]}`
      }
    }
    // Handle binary data URL
    else if (body.image_data_url) {
      const base64Data = body.image_data_url.replace(/^data:image\/\w+;base64,/, "")
      imageBuffer = Buffer.from(base64Data, "base64")
      const mimeMatch = body.image_data_url.match(/data:image\/(\w+);base64/)
      if (mimeMatch) {
        imageExt = mimeMatch[1] === "jpeg" ? "jpg" : mimeMatch[1]
        imageMimeType = `image/${mimeMatch[1]}`
      }
    }
    // Handle image URL (download and store)
    else if (body.image_url) {
      try {
        const imageRes = await fetch(body.image_url)
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
      imageBuffer = Buffer.from(body.image_binary, "base64")
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "No image data provided. Send image_base64, image_data_url, image_url, or image_binary" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = `n8n-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${imageExt}`
    const path = `generated/${filename}`

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
    const publicUrl = urlData.publicUrl

    // Update or insert pet_portrait record
    const petName = body.pet_name || body.name || null
    const originalImageUrl = body.original_image_url || body.test_image || null
    const userEmail = body.user_email || null
    const status = body.status || "completed"

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

    if (recordId) {
      // Update existing record with generated image
      const { error: updateError } = await supabase
        .from("pet_portraits")
        .update({
          image_url: publicUrl,
          status: status,
        })
        .eq("id", recordId)

      if (updateError) {
        console.error("Update error:", updateError)
        // Continue anyway - at least the image is stored
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase.from("pet_portraits").insert({
        image_url: publicUrl,
        pet_name: petName,
        status: status,
        user_email: userEmail,
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        // Continue anyway - at least the image is stored
      }
    }

    return NextResponse.json({
      success: true,
      image_url: publicUrl,
      path,
      message: "Image stored successfully",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
