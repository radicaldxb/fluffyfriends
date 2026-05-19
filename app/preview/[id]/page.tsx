import { notFound } from "next/navigation"
import { timingSafeEqual } from "node:crypto"
import { PreviewRouteClient } from "./preview-client"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { applyWatermark } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"
export const revalidate = 0

function pickLandscapeRawUrls(data: {
  image_url?: string | null
  portrait_url?: string | null
  landscape_url?: string | null
}): { landscape: string | null; portrait: string | null } {
  const lu = typeof data.landscape_url === "string" && data.landscape_url.trim() ? data.landscape_url.trim() : null
  const pu = typeof data.portrait_url === "string" && data.portrait_url.trim() ? data.portrait_url.trim() : null
  const iu = typeof data.image_url === "string" && data.image_url.trim() ? data.image_url.trim() : null
  return {
    landscape: lu ?? pu ?? iu ?? null,
    portrait: pu ?? iu ?? lu ?? null,
  }
}

function safeTimingEqualStrings(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { token } = await searchParams

  if (!token) notFound()

  let db
  try {
    db = getSupabaseAdmin()
  } catch {
    notFound()
  }

  const { data, error } = await db
    .from("pet_portraits")
    .select(
      "id, pet_name, theme, status, image_url, portrait_url, landscape_url, preview_token, preview_expires_at, user_email, created_at",
    )
    .eq("id", id)
    .single()

  if (error || !data) notFound()
  if (data.status !== "preview") notFound()
  const storedToken =
    typeof data.preview_token === "string" ? data.preview_token.trim() : ""
  if (!storedToken || !safeTimingEqualStrings(storedToken, token)) notFound()

  const expired =
    data.preview_expires_at != null
      ? new Date(data.preview_expires_at).getTime() < Date.now()
      : false

  const { landscape: landscapeRaw, portrait: portraitRaw } = pickLandscapeRawUrls(data)
  const wmLandscape =
    landscapeRaw !== null ? applyWatermark(landscapeRaw) : ""
  const wmPortrait = portraitRaw !== null ? applyWatermark(portraitRaw) : wmLandscape

  const createdAtIso =
    data.created_at != null
      ? typeof data.created_at === "string"
        ? data.created_at
        : new Date(data.created_at as string | number | Date).toISOString()
      : null

  return (
    <PreviewRouteClient
      portrait={{
        id: data.id,
        pet_name: data.pet_name,
        theme: data.theme,
      }}
      portraitCreatedAtIso={createdAtIso}
      expired={expired}
      watermarkLandscapeSrc={wmLandscape || wmPortrait}
      watermarkPortraitSrc={wmPortrait || wmLandscape}
      rawLandscapeFallbackUrl={landscapeRaw}
    />
  )
}
