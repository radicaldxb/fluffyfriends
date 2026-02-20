/**
 * Theme utilities for building Supabase Storage URLs and managing theme configuration.
 */

/**
 * Get the public URL for a theme's master reference image in Supabase Storage.
 * @param theme - Theme name (e.g., "fireman", "spaceman")
 * @param extension - File extension (default: "png")
 * @returns Public URL to the theme master image
 */
export function getThemeImageUrl(theme: string, extension: string = "png"): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }
  return `${supabaseUrl}/storage/v1/object/public/images/themes/${theme}-master.${extension}`
}

/**
 * Valid theme names (used for validation in API and UI).
 * Add new themes here when you upload them to Supabase Storage.
 */
export const VALID_THEMES = ["fireman", "spaceman"] as const

export type Theme = (typeof VALID_THEMES)[number]

/**
 * Check if a theme name is valid.
 */
export function isValidTheme(theme: string): theme is Theme {
  return VALID_THEMES.includes(theme as Theme)
}
