import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns true only for real URLs; rejects n8n-style placeholders like {{ $json.landscape_url }} */
export function isValidDownloadUrl(url: string | null | undefined): url is string {
  return getDisplayUrl(url) !== null
}

/** Returns a safe href string for display/link, or null if not safe (template literal or empty). */
export function getDisplayUrl(url: string | null | undefined): string | null {
  const s = normalizeUrlString(url)
  if (!s) return null
  if (s.includes("{{") || s.includes("$json")) return null
  const lower = s.toLowerCase()
  // Exact start
  if (lower.startsWith("http://") || lower.startsWith("https://")) return s
  // URL might be embedded (e.g. "  https://..." or "URL: https://...") — extract it
  const httpsIdx = lower.indexOf("https://")
  const httpIdx = lower.indexOf("http://")
  let start = -1
  if (httpsIdx !== -1 && (httpIdx === -1 || httpsIdx <= httpIdx)) start = httpsIdx
  else if (httpIdx !== -1) start = httpIdx
  if (start !== -1) {
    const rest = s.slice(start)
    const end = Math.min(
      rest.indexOf(" ") === -1 ? rest.length : rest.indexOf(" "),
      rest.indexOf("\n") === -1 ? rest.length : rest.indexOf("\n"),
      rest.length,
    )
    return rest.slice(0, end).trim() || null
  }
  return null
}

function normalizeUrlString(url: string | null | undefined): string {
  if (url == null) return ""
  return String(url).replace(/\s+/g, " ").trim()
}
