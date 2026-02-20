/**
 * Database types for Supabase schema sync.
 * Matches public.pet_portraits and public.theme_prompts tables
 */

export type PetPortrait = {
  id: string
  created_at: string
  image_url: string | null
  pet_name: string | null
  status: string | null
  user_email: string | null
}

/** Insert payload for pet_portraits (id and created_at are generated) */
export type PetPortraitInsert = {
  image_url?: string | null
  pet_name?: string | null
  status?: string | null
  user_email?: string | null
}

export type ThemePrompt = {
  id: string
  theme_name: string
  prompt: string
  created_at: string
  updated_at: string
  active: boolean
}

/** Insert payload for theme_prompts (id, created_at, updated_at are generated) */
export type ThemePromptInsert = {
  theme_name: string
  prompt: string
  active?: boolean
}

/** Supabase Database type for typed client (optional) */
export type Database = {
  public: {
    Tables: {
      pet_portraits: {
        Row: PetPortrait
        Insert: PetPortraitInsert & {
          id?: string
          created_at?: string
        }
        Update: Partial<PetPortraitInsert>
      }
      theme_prompts: {
        Row: ThemePrompt
        Insert: ThemePromptInsert & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<ThemePromptInsert>
      }
    }
  }
}
