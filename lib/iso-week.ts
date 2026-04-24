/**
 * ISO 8601 week utilities (week starts Monday, UTC).
 * Used to align `pb_content_queue.week_number` with the calendar view.
 * Monday, week number, and Thursday anchor are derived from the same formula.
 */

export function getUTCDateOnly(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * One UTC calendar day as YYYY-MM-DD, using the calendar fields of a UTC instant.
 * (Avoids local timezone when parsing from ISO strings in the client.)
 */
export function getUTCYmdForInstant(iso: string | Date): string {
  const t = typeof iso === "string" ? new Date(iso) : new Date(iso.getTime())
  if (Number.isNaN(t.getTime())) return ""
  return getUTCDateOnly(
    new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())),
  )
}

/**
 * Returns the ISO week (same algorithm as the Thursday anchor in SQL-style week math)
 * and the Monday of that week, so filters and the 7-day grid always match.
 */
export function getISOCalendarInfoUTC(d: Date): { monday: Date; weekNumber: number; thursday: Date } {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const thursday = new Date(t)
  const y = t.getUTCFullYear()
  const y0 = new Date(Date.UTC(y, 0, 1))
  const weekNumber = Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7)
  const monday = new Date(t)
  monday.setUTCDate(t.getUTCDate() - 3)
  monday.setUTCHours(0, 0, 0, 0)
  return { monday, weekNumber, thursday }
}

/** @deprecated use getISOCalendarInfoUTC(d).weekNumber */
export function getISOWeekNumberUTC(d: Date): number {
  return getISOCalendarInfoUTC(d).weekNumber
}

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export function buildCurrentISOWeekDayColumns(now: Date): { key: string; dayLabel: string; dateLabel: string }[] {
  const { monday } = getISOCalendarInfoUTC(now)
  return DAY_SHORT.map((dayLabel, i) => {
    const dt = new Date(monday)
    dt.setUTCDate(monday.getUTCDate() + i)
    const key = getUTCDateOnly(
      new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())),
    )
    const dateLabel = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(dt)
    return { key, dayLabel, dateLabel }
  })
}

export function getScheduledUTCDayKey(iso: string | null | undefined): string | null {
  if (iso == null || iso === "") return null
  return getUTCYmdForInstant(iso) || null
}
