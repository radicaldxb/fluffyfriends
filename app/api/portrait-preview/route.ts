import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const PREVIEW_MAX_AGE_HOURS = 24

/**
 * Stream portrait image by id so the storage URL is never exposed in the client.
 * Only allows preview for portraits created in the last PREVIEW_MAX_AGE_HOURS.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    const { data: row, error } = await supabase
      .from("pet_portraits")
      .select("image_url, created_at")
      .eq("id", id)
      .single()

    if (error || !row?.image_url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const createdAt = new Date(row.created_at).getTime()
    const cutoff = Date.now() - PREVIEW_MAX_AGE_HOURS * 60 * 60 * 1000
    if (createdAt < cutoff) {
      return NextResponse.json({ error: "Preview expired" }, { status: 404 })
    }

    const imageUrl = row.image_url as string
    const res = await fetch(imageUrl, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ error: "Image unavailable" }, { status: 502 })
    }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const buffer = Buffer.from(await res.arrayBuffer())
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    console.error("[portrait-preview]", err)
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 })
  }
}
