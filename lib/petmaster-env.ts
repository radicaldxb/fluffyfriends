/**
 * Petmaster password from the host environment (e.g. Netlify: Site settings → Environment variables).
 * Supports `PETMASTER_PASSWORD` (preferred) and `Petmaster_password` (common Netlify naming).
 */
export function getPetmasterPassword(): string | undefined {
  const fromEnv =
    process.env.PETMASTER_PASSWORD?.trim() ||
    process.env.Petmaster_password?.trim()
  return fromEnv || undefined
}
