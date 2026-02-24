/**
 * Theme prompts stored in Supabase for dynamic theme management.
 * 
 * This allows adding new themes and updating prompts without code changes.
 * Prompts are fetched from the theme_prompts table in Supabase.
 */

import { supabase } from "@/lib/supabase"

export type ThemePrompt = {
  id: string
  theme_name: string
  prompt: string
  created_at: string
  updated_at: string
  active: boolean
}

export type ThemePromptAndNameTagConfig = {
  prompt: string
  hasNameTag: boolean
  nameTagInstruction: string | null
}

/**
 * Get the prompt and name-tag config for a theme in one query.
 * Use this when building the create-portrait payload so name-tag logic is consistent.
 * Falls back to default prompt and no name tag if theme not found or DB columns missing.
 */
export async function getPromptAndNameTagConfig(theme: string): Promise<ThemePromptAndNameTagConfig> {
  const normalizedTheme = theme.toLowerCase()

  try {
    const { data, error } = await supabase
      .from("theme_prompts")
      .select("prompt, has_name_tag, name_tag_instruction")
      .eq("theme_name", normalizedTheme)
      .eq("active", true)
      .single()

    if (error) {
      console.error(`[theme-prompts] Error fetching prompt for theme "${normalizedTheme}":`, error)
      return {
        prompt: getDefaultPrompt(normalizedTheme),
        hasNameTag: false,
        nameTagInstruction: null,
      }
    }

    if (!data?.prompt) {
      console.warn(`[theme-prompts] No prompt found for theme "${normalizedTheme}", using default`)
      return {
        prompt: getDefaultPrompt(normalizedTheme),
        hasNameTag: false,
        nameTagInstruction: null,
      }
    }

    return {
      prompt: data.prompt,
      hasNameTag: data.has_name_tag === true,
      nameTagInstruction: data.name_tag_instruction ?? null,
    }
  } catch (err) {
    console.error(`[theme-prompts] Exception fetching prompt for theme "${normalizedTheme}":`, err)
    return {
      prompt: getDefaultPrompt(normalizedTheme),
      hasNameTag: false,
      nameTagInstruction: null,
    }
  }
}

/**
 * Get the prompt for a specific theme from Supabase.
 * Falls back to a default prompt if theme is not found or Supabase is unavailable.
 */
export async function getPromptForTheme(theme: string): Promise<string> {
  const { prompt } = await getPromptAndNameTagConfig(theme)
  return prompt
}

/**
 * Minimal fallback prompt when Supabase is unavailable or theme not found.
 * DB is the single source of truth; this is for resilience only, not full quality.
 */
function getDefaultPrompt(_theme: string): string {
  return `INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN portrait.
1. SUBJECT: Use the pet from Image 2. Preserve exact facial features, ear shape, and head tilt (identity lock).
2. STYLE: Use Image 1 as the master reference. Match its costume, lighting, and artistic style exactly.
3. COMPOSITION: Cinematic waist-up, center subject, ample space left and right. Head to waist only; no legs or paws.
4. QUALITY: Print-ready, high-resolution, sharp details.`
}

/**
 * Get all active themes from Supabase.
 * Useful for validating theme names or listing available themes.
 */
export async function getActiveThemes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("theme_prompts")
      .select("theme_name")
      .eq("active", true)
      .order("theme_name")

    if (error) {
      console.error("[theme-prompts] Error fetching active themes:", error)
      return ["fireman", "spaceman"] // Fallback
    }

    return data?.map((row) => row.theme_name) || []
  } catch (err) {
    console.error("[theme-prompts] Exception fetching active themes:", err)
    return ["fireman", "spaceman"] // Fallback
  }
}
