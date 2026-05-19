import { getSupabase } from "@/lib/supabase"
import { isValidDownloadUrl } from "@/lib/utils"

export type ThemeGalleryPortrait = {
  src: string
  pet: string
  /** `[Pet Name] · [City, Country]` or pet name only */
  caption: string
}

const MIN_TO_SHOW = 2
const MAX_SHOWN = 3

/**
 * Real showcase portraits for a theme landing page. Returns [] if fewer than {@link MIN_TO_SHOW}
 * usable rows exist (section should be hidden).
 */
export async function fetchThemeGalleryPortraits(themeId: string): Promise<ThemeGalleryPortrait[]> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("pet_portraits")
      .select("image_url, original_image_url, pet_name, showcase_consent, location, users(city, country)")
      .eq("theme", themeId)
      .not("image_url", "is", null)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .limit(40)

    if (error || !data?.length) return []

    const rows = data.filter((row) => row.showcase_consent === true)
    const mapped: ThemeGalleryPortrait[] = []

    for (const row of rows) {
      const imageUrl = (row.image_url as string)?.trim()
      const originalUrl = (row.original_image_url as string)?.trim()
      const src = isValidDownloadUrl(imageUrl)
        ? imageUrl!
        : isValidDownloadUrl(originalUrl)
          ? originalUrl!
          : null
      if (!src) continue

      const users = row.users as { city?: string | null; country?: string | null } | null
      const locRaw = row.location
      const locationLine =
        typeof locRaw === "string" && locRaw.trim()
          ? locRaw.trim()
          : users?.city && users?.country
            ? `${users.city}, ${users.country}`
            : null
      const pet = typeof row.pet_name === "string" && row.pet_name.trim() ? row.pet_name.trim() : "Pet"
      const caption = locationLine ? `${pet} · ${locationLine}` : pet
      mapped.push({ src, pet, caption })
    }

    if (mapped.length < MIN_TO_SHOW) return []
    return mapped.slice(0, MAX_SHOWN)
  } catch {
    return []
  }
}
