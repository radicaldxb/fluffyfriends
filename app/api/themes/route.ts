import { NextResponse } from "next/server"
import { getActiveThemes } from "@/lib/theme-prompts"

/**
 * GET /api/themes
 * Returns active themes from Supabase (theme_prompts).
 * Used by /create page so the theme list is data-driven; new themes appear without code change.
 */
export async function GET() {
  try {
    const themeNames = await getActiveThemes()

    const themes = themeNames.map((themeName) => ({
      id: themeName,
      name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
      previewUrl: `/images/themes/${themeName}-preview.webp`,
    }))

    return NextResponse.json({ themes })
  } catch (err) {
    console.error("[themes] Error fetching themes:", err)
    // Fallback so UI still works if Supabase is down
    const fallback = [
      { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
      { id: "spaceman", name: "Spaceman", previewUrl: "/images/themes/spaceman-preview.webp" },
    ]
    return NextResponse.json({ themes: fallback })
  }
}
