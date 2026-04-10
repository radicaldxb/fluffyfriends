/**
 * Petmaster password from environment — same value for /api/petmaster-auth and middleware.
 * Local: set `PETMASTER_PASSWORD` in `.env.local` (Next.js loads it automatically; restart dev server after edits).
 * Production: set `PETMASTER_PASSWORD` in Netlify site environment (build + runtime).
 * Also accepts legacy `Petmaster_password` if present.
 */
export function getPetmasterPassword(): string | undefined {
  const fromEnv =
    process.env.PETMASTER_PASSWORD?.trim() ||
    process.env.Petmaster_password?.trim()
  return fromEnv || undefined
}
