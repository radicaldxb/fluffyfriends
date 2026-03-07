import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns true only for real URLs; rejects n8n-style placeholders like {{ $json.landscape_url }} */
export function isValidDownloadUrl(url: string | null | undefined): url is string {
  const s = url != null ? String(url).trim() : ""
  if (!s) return false
  if (s.includes("{{") || s.includes("$json")) return false
  const lower = s.toLowerCase()
  return lower.startsWith("http://") || lower.startsWith("https://")
}

/** Returns a safe href string for display/link, or null if not safe (template literal or empty). */
export function getDisplayUrl(url: string | null | undefined): string | null {
  const s = url != null ? String(url).trim() : ""
  if (!s) return null
  if (s.includes("{{") || s.includes("$json")) return null
  const lower = s.toLowerCase()
  if (lower.startsWith("http://") || lower.startsWith("https://")) return s
  return null
}
