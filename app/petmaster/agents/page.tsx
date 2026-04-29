"use client"

import { useCallback, useEffect, useState } from "react"

type HealthRow = {
  check_type?: string | null
  severity?: string | null
  finding?: string | null
  action_taken?: string | null
  created_at?: string | null
}

type QueueRow = {
  id: string
  theme: string | null
  post_type: string | null
  platform: string | null
  status: string | null
  overlay_caption: string | null
  scheduled_for: string | null
}

type ReportRow = {
  week_number: number | null
  week_year: number | null
  report_type: string | null
  key_insight: string | null
  recommendations: string | null
  created_at: string | null
  top_posts: unknown
  underperformers: unknown
}

type WeekColumn = { key: string; dayLabel: string; dateLabel: string }

type ApiPayload = {
  health: HealthRow | null
  queue: QueueRow[]
  queue_by_day: Record<string, QueueRow[]>
  report: ReportRow | null
  week_number: number
  week_columns: WeekColumn[]
}

const AGENT_PILLS = ["Strategy", "Creative", "Social", "Analytics", "Dev"] as const

function healthPresentation(sev: string | null | undefined): {
  dot: string
  label: string
} {
  const s = (sev ?? "").toLowerCase().trim()
  if (s === "ok") {
    return { dot: "bg-emerald-500", label: "All systems healthy" }
  }
  if (s === "medium" || s === "low") {
    return { dot: "bg-amber-400", label: "Issues detected" }
  }
  if (s === "high" || s === "critical") {
    return { dot: "bg-red-500", label: "Action required" }
  }
  return { dot: "bg-slate-500", label: "Health status unknown" }
}

/** Summary line when issues exist and finding is JSON array; otherwise generic severity label when not ok. */
function healthIssueFindingLabel(
  severity: string | null | undefined,
  finding: string | null | undefined,
): string | null {
  const sev = (severity ?? "").toLowerCase().trim()
  if (sev === "ok") return null
  let findingSummary: string | null = null
  if (finding && finding !== "All systems healthy") {
    try {
      const findings = JSON.parse(finding)
      if (Array.isArray(findings) && findings.length > 0) {
        const first = findings[0] as { check?: string }
        const check =
          typeof first?.check === "string"
            ? first.check.replace(/_/g, " ")
            : String(first?.check ?? "").replace(/_/g, " ")
        findingSummary = `${findings.length} issue${findings.length > 1 ? "s" : ""} — ${check || "see logs"}`
      }
    } catch {
      findingSummary = finding
    }
  }
  return findingSummary
}

function staleUnknownLabel(minutesAgo: number | null): string {
  if (minutesAgo === null) {
    return "Health status unknown — last scan time missing"
  }
  const hours = Math.floor(minutesAgo / 60)
  if (hours >= 1) {
    return `Health status unknown — last scanned ${hours} hour${hours === 1 ? "" : "s"} ago`
  }
  return `Health status unknown — last scanned ${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`
}

function lastScannedText(createdAt: string | null | undefined): string {
  if (!createdAt) return "Last scanned: —"
  const t = new Date(createdAt).getTime()
  if (Number.isNaN(t)) return "Last scanned: —"
  const mins = Math.floor((Date.now() - t) / 60_000)
  if (mins < 1) return "Last scanned: less than a minute ago"
  if (mins === 1) return "Last scanned: 1 minute ago"
  return `Last scanned: ${mins} minutes ago`
}

function postTypeClass(postType: string | null | undefined): string {
  const p = (postType ?? "").toLowerCase()
  if (p === "lifestyle")
    return "bg-slate-600/90 text-slate-100"
  return "text-[#111827] bg-[#F09A54]"
}

function statusClass(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase()
  if (s === "pending_creative") return "bg-slate-500/40 text-slate-100"
  if (s === "creative_in_progress") return "bg-amber-500/35 text-amber-100"
  if (s === "scheduled") return "bg-sky-600/50 text-sky-100"
  if (s === "published") return "bg-emerald-600/45 text-emerald-100"
  if (s === "pending_approval") return "bg-violet-600/50 text-violet-100"
  return "bg-slate-600/50 text-slate-200"
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return `${s.slice(0, n - 1)}…`
}

function formatReportDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function PetmasterAgentsPage() {
  const [data, setData] = useState<ApiPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    const res = await fetch("/api/petmaster-agents-dashboard", { credentials: "same-origin" })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
      setData(null)
    } else {
      setData((await res.json()) as ApiPayload)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const h = data?.health
  const lastScanTime =
    h?.created_at != null ? new Date(h.created_at) : null
  const minutesAgo =
    lastScanTime && !Number.isNaN(lastScanTime.getTime())
      ? Math.floor((Date.now() - lastScanTime.getTime()) / 60_000)
      : null
  const isStale = minutesAgo === null || minutesAgo > 120
  const displaySeverity = isStale ? undefined : (h?.severity ?? undefined)
  const { dot, label: genericSeverityLabel } = healthPresentation(
    isStale ? "unknown" : displaySeverity,
  )

  const issueFindingLabel =
    !isStale && h ? healthIssueFindingLabel(h.severity, h.finding ?? null) : null
  const healthBarPrimary = isStale
    ? staleUnknownLabel(minutesAgo)
    : issueFindingLabel ?? genericSeverityLabel

  return (
    <div
      className="-m-6 min-h-screen space-y-10 bg-[#111827] p-6 text-[#F2EEE2] md:-m-8 md:p-8"
      data-page="petmaster-agents"
    >
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#F2EEE2]">
        Agent Team
      </h1>

      {loading && <p className="text-sm text-[#F2EEE2]/70">Loading command centre…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && data && (
        <>
          {/* Section 1 — System Health Bar */}
          <section aria-label="System health">
            <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#1F2937] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 flex-col gap-1 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden />
                  <span className="break-words text-sm font-medium text-[#F2EEE2]">{healthBarPrimary}</span>
                </span>
                {!isStale && (
                  <span className="text-sm text-[#F2EEE2]/60">{lastScannedText(h?.created_at)}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {AGENT_PILLS.map((name) => (
                  <span
                    key={name}
                    className="inline-flex rounded-full bg-emerald-600/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-100"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2 — Weekly Content Calendar */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F2EEE2]/70">
              Weekly content — week {data.week_number}
            </h2>
            <div className="w-full min-w-0 overflow-x-auto pb-1">
            <div
              className="grid min-w-[700px] grid-cols-7 gap-2"
              style={{ minHeight: "120px" }}
            >
              {data.week_columns.map((col) => {
                const posts = data.queue_by_day[col.key] ?? []
                const empty = posts.length === 0
                return (
                  <div
                    key={col.key}
                    className={`flex min-h-[120px] flex-col rounded-lg p-2 ${
                      empty ? "border-2 border-dashed border-white/10 bg-transparent" : "bg-[#1F2937]"
                    }`}
                  >
                    <div className="mb-2 border-b border-white/10 pb-2 text-left">
                      <p className="text-xs font-semibold text-[#F09A54]">{col.dayLabel}</p>
                      <p className="text-[11px] text-[#F2EEE2]/70">{col.dateLabel}</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-lg border border-white/5 bg-[#1a1f2e] p-2"
                        >
                          <div className="flex flex-wrap items-center gap-1">
                            <span
                              className={`inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${postTypeClass(post.post_type)}`}
                            >
                              {post.post_type === "lifestyle" ? "lifestyle" : "portrait"}
                            </span>
                            <span
                              className={`inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${statusClass(post.status)}`}
                            >
                              {(post.status ?? "—").replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-xs font-medium text-[#F2EEE2]">
                            {post.theme?.trim() ? post.theme : "Lifestyle"}
                          </p>
                          {post.overlay_caption && (
                            <p className="mt-0.5 text-[11px] text-[#F2EEE2]/55">
                              {truncate(post.overlay_caption, 40)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </section>

          {/* Section 3 — Latest Analytics Report */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F2EEE2]/70">
              Latest analytics report
            </h2>
            {data.report ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-[#1F2937] p-4">
                  <h3 className="text-sm font-semibold text-[#F2EEE2]">Key insight</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#F2EEE2]/60">
                    {data.report.report_type && (
                      <span className="inline-flex rounded-sm bg-[#F09A54]/20 px-1.5 py-0.5 font-medium text-[#F09A54]">
                        {data.report.report_type}
                      </span>
                    )}
                    {data.report.week_number != null && data.report.week_year != null && (
                      <span>
                        Week {data.report.week_number} · {data.report.week_year}
                      </span>
                    )}
                    {data.report.created_at && (
                      <span>{formatReportDate(data.report.created_at)}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#F2EEE2]/90">
                    {data.report.key_insight ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1F2937] p-4">
                  <h3 className="text-sm font-semibold text-[#F2EEE2]">Recommendations</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#F2EEE2]/90">
                    {data.report.recommendations ?? "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#F2EEE2]/50">Analytics agent hasn&apos;t run yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
