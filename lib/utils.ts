import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns true only for real URLs; rejects n8n-style placeholders like {{ $json.landscape_url }} */
export function isValidDownloadUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.includes("{{") || trimmed.includes("$json")) return false
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
}
