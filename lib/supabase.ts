import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

/** Singleton Supabase client for use across the app. Lazy-loaded to avoid build-time errors. */
let supabaseInstance: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = getSupabase()
    }
    return (supabaseInstance as any)[prop]
  },
})
