/**
 * Soft-hold copy on preview/checkout: 48 hours after portrait row creation.
 * Example: "Thursday, 22 May at 5:14pm"
 */
export function formatPortraitHoldExpiry(createdAtIso: string): string | null {
  const created = new Date(createdAtIso)
  if (Number.isNaN(created.getTime())) return null
  const expiry = new Date(created.getTime() + 48 * 60 * 60 * 1000)
  const weekday = expiry.toLocaleDateString("en-GB", { weekday: "long" })
  const day = expiry.getDate()
  const month = expiry.toLocaleDateString("en-GB", { month: "long" })
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(expiry)
  const hour = parts.find((p) => p.type === "hour")?.value ?? ""
  const minute = parts.find((p) => p.type === "minute")?.value ?? ""
  const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value?.toLowerCase() ?? ""
  const time = `${hour}:${minute}${dayPeriod}`
  return `${weekday}, ${day} ${month} at ${time}`
}
