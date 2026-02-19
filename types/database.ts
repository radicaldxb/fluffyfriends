/**
 * Database types for Supabase schema sync.
 * Matches public.pet_portraits table: id, created_at, image_url, pet_name, status, user_email
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
    }
  }
}
