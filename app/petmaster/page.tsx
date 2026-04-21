"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type AnalyticsDailyRow = {
  date: string
  ga_sessions: number | null
  ga_engagement_rate: number | null
  meta_spend: number | null
  ig_followers_count: number | null
  ga_paid_social_sessions: number | null
  ga_organic_sessions: number | null
  meta_clicks: number | null
  meta_ctr: number | null
  ig_total_reach: number | null
  pinterest_spend?: number | null
  pinterest_clicks?: number | null
  meta_campaigns?: unknown
}

type FunnelPayload = {
  previews_today: number
  paid_today: number
  previews_7d: number
  paid_7d: number
  conversion_7d_pct: number | null
}

const CHART_JS =
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"

function formatMetaPinterest(
  row: AnalyticsDailyRow,
  key: keyof AnalyticsDailyRow,
): string {
  const v = row[key]
  if (v === null || v === undefined) return "—"
  if (typeof v === "number" && Number.isNaN(v)) return "—"
  return String(v)
}

const GA_SESSION_KEYS = [
  "ga_sessions",
  "gaSessions",
  "ga_session",
  "sessions",
  "total_sessions",
  "ga4_sessions",
  "google_analytics_sessions",
  "ga_sessions_total",
] as const

const IG_FOLLOWER_KEYS = [
  "ig_followers_count",
  "igFollowersCount",
  "ig_followers",
  "ig_follower_count",
  "instagram_followers_count",
  "instagram_followers",
  "followers_count",
] as const

function coalesceNumber(raw: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const key of keys) {
    if (!(key in raw)) continue
    const v = raw[key]
    if (v === null || v === undefined) continue
    if (typeof v === "string" && v.trim() === "") continue
    const n = typeof v === "number" ? v : Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function mapAnalyticsRow(raw: Record<string, unknown>): AnalyticsDailyRow {
  const base = { ...(raw as unknown as AnalyticsDailyRow) }
  const sessions =
    coalesceNumber(raw, GA_SESSION_KEYS) ??
    (base.ga_sessions != null ? asFiniteNumber(base.ga_sessions) : null)
  const igFollowers =
    coalesceNumber(raw, IG_FOLLOWER_KEYS) ??
    (base.ig_followers_count != null ? asFiniteNumber(base.ig_followers_count) : null)
  return {
    ...base,
    ga_sessions: sessions,
    ig_followers_count: igFollowers,
  }
}

function asFiniteNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function formatSessions(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return n.toLocaleString()
}

function formatEngagement(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (Number.isNaN(n)) return "—"
  const pct = n <= 1 && n > 0 ? n * 100 : n
  return `${pct.toFixed(1)}%`
}

function formatSpendAed(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (Number.isNaN(n)) return "—"
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`
}

function formatCtr(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  const n = Number(v)
  if (Number.isNaN(n)) return "—"
  const pct = n <= 1 && n >= 0 ? n * 100 : n
  return `${pct.toFixed(2)}%`
}

function loadChartScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  const w = window as unknown as { Chart?: unknown }
  if (w.Chart) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = CHART_JS
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Chart.js failed to load"))
    document.body.appendChild(s)
  })
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      className="rounded-organic-sm p-4 shadow-sm"
      style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[#F2EEE2]/60">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

/** Funnel numbers in primary orange — distinct from analytics stat values */
function FunnelStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-organic-sm p-4 shadow-sm"
      style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[#F2EEE2]/60">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#F09A54]">{value}</p>
    </div>
  )
}

function parseCampaignsPayload(raw: unknown): Array<Record<string, unknown>> {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as unknown
      return Array.isArray(p) ? (p as Array<Record<string, unknown>>) : []
    } catch {
      return []
    }
  }
  return []
}

function campaignAdName(row: Record<string, unknown>): string {
  const n = row.ad_name ?? row.name ?? row.adName ?? row.ad_title ?? row.title ?? "—"
  const s = String(n)
  return s.length > 40 ? `${s.slice(0, 37)}…` : s
}

function num(row: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k]
    if (v === null || v === undefined) continue
    const n = typeof v === "number" ? v : Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function formatAed(v: number | null): string {
  if (v === null) return "—"
  return `${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`
}

export default function PetmasterDashboardPage() {
  const [rows, setRows] = useState<AnalyticsDailyRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [funnel, setFunnel] = useState<FunnelPayload | null>(null)
  const [funnelError, setFunnelError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const followersCanvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<{ destroy: () => void } | null>(null)
  const followersChartRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [resAnalytics, resFunnel] = await Promise.all([
          fetch("/api/petmaster-analytics", { credentials: "same-origin" }),
          fetch("/api/petmaster-funnel", { credentials: "same-origin" }),
        ])
        if (cancelled) return

        if (resFunnel.ok) {
          const fj = (await resFunnel.json()) as FunnelPayload
          setFunnel(fj)
          setFunnelError(null)
        } else {
          const j = await resFunnel.json().catch(() => ({}))
          setFunnel(null)
          setFunnelError(typeof (j as { error?: string }).error === "string" ? (j as { error: string }).error : `HTTP ${resFunnel.status}`)
        }

        if (!resAnalytics.ok) {
          const j = await resAnalytics.json().catch(() => ({}))
          setLoadError(typeof j.error === "string" ? j.error : `HTTP ${resAnalytics.status}`)
          setRows([])
          return
        }
        const json = (await resAnalytics.json()) as { rows?: Record<string, unknown>[] }
        const rawList = json.rows ?? []
        setRows(rawList.map((raw) => mapAnalyticsRow(raw)))
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load")
          setRows([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const chartSeries = useMemo(
    () => (rows && rows.length > 0 ? [...rows].reverse() : []),
    [rows],
  )
  const latest = rows && rows.length > 0 ? rows[0] : null

  const campaignRows = useMemo(() => {
    const raw = latest?.meta_campaigns
    const list = parseCampaignsPayload(raw)
    return list
      .map((row) => {
        const spend = num(row, "spend", "amount_spent", "spend_aed", "cost") ?? 0
        const clicks = num(row, "clicks", "link_clicks", "inline_link_clicks") ?? 0
        const ctr = num(row, "ctr", "ctr_percent") ?? null
        const land = num(row, "landing_views", "landing_page_views", "outbound_clicks") ?? null
        const video = num(row, "video_views", "video_play_actions", "video_views_count") ?? null
        return { row, spend, clicks, ctr, land, video, name: campaignAdName(row) }
      })
      .sort((a, b) => b.spend - a.spend)
  }, [latest])

  useEffect(() => {
    if (!chartSeries.length || !canvasRef.current || !followersCanvasRef.current) return

    let cancelled = false
    ;(async () => {
      try {
        await loadChartScript()
        if (cancelled || !canvasRef.current || !followersCanvasRef.current) return
        const Chart = (window as unknown as { Chart: new (...args: unknown[]) => { destroy: () => void } })
          .Chart
        chartRef.current?.destroy()
        chartRef.current = null
        followersChartRef.current?.destroy()
        followersChartRef.current = null

        const labels = chartSeries.map((r) => {
          const d = new Date(r.date)
          return Number.isNaN(d.getTime())
            ? r.date
            : d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        })
        const sessionValues = chartSeries.map((r) => {
          const n = r.ga_sessions === null || r.ga_sessions === undefined ? NaN : Number(r.ga_sessions)
          return Number.isFinite(n) ? n : 0
        })
        const followerValues = chartSeries.map((r) => {
          const n =
            r.ig_followers_count === null || r.ig_followers_count === undefined
              ? NaN
              : Number(r.ig_followers_count)
          return Number.isFinite(n) ? n : 0
        })

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return
        chartRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "GA Sessions",
                data: sessionValues,
                backgroundColor: "#F09A54",
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: "#F2EEE2" },
                grid: { color: "rgba(242,238,226,0.12)" },
              },
              y: {
                ticks: { color: "#F2EEE2" },
                grid: { color: "rgba(242,238,226,0.12)" },
                beginAtZero: true,
              },
            },
          },
        } as never)

        const fctx = followersCanvasRef.current.getContext("2d")
        if (!fctx) return
        followersChartRef.current = new Chart(fctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Followers",
                data: followerValues,
                borderColor: "#F09A54",
                backgroundColor: "rgba(240,154,84,0.12)",
                tension: 0.25,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: "#F09A54",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: "#F2EEE2" },
              },
            },
            scales: {
              x: {
                ticks: { color: "#F2EEE2" },
                grid: { color: "rgba(242,238,226,0.12)" },
              },
              y: {
                ticks: { color: "#F2EEE2" },
                grid: { color: "rgba(242,238,226,0.12)" },
                beginAtZero: false,
              },
            },
          },
        } as never)
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      cancelled = true
      chartRef.current?.destroy()
      chartRef.current = null
      followersChartRef.current?.destroy()
      followersChartRef.current = null
    }
  }, [chartSeries])

  if (rows === null && !loadError) {
    return (
      <div className="text-sm text-[#111827]/70" style={{ color: "#111827" }}>
        Loading analytics…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {loadError}
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <div
        className="rounded-organic-sm p-8 text-center text-sm"
        style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
      >
        No data yet — run the analytics workflow in n8n.
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">Dashboard</h1>

      {/* Today — GA Sessions & IG Followers use same binding pattern as Engagement / Meta Spend */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">Today</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="GA Sessions" value={formatSessions(latest?.ga_sessions)} />
          <StatCard label="Engagement Rate" value={formatEngagement(latest?.ga_engagement_rate)} />
          <StatCard label="Meta Spend" value={formatSpendAed(latest?.meta_spend)} />
          <StatCard label="IG Followers" value={formatSessions(latest?.ig_followers_count)} />
        </div>
      </section>

      {/* Funnel (pet_portraits) */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">Funnel</h2>
        {funnelError ? (
          <p className="text-sm text-red-600">{funnelError}</p>
        ) : funnel ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FunnelStatCard label="Previews today" value={formatSessions(funnel.previews_today)} />
            <FunnelStatCard label="Paid today" value={formatSessions(funnel.paid_today)} />
            <FunnelStatCard label="Previews 7d" value={formatSessions(funnel.previews_7d)} />
            <FunnelStatCard
              label="Conversion 7d"
              value={
                funnel.conversion_7d_pct === null || funnel.previews_7d === 0
                  ? "—"
                  : `${funnel.conversion_7d_pct.toFixed(1)}%`
              }
            />
          </div>
        ) : (
          <p className="text-sm text-[#111827]/60">Loading funnel…</p>
        )}
      </section>

      {/* Sessions chart + IG followers trend */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Sessions (7 days)
        </h2>
        <div
          className="rounded-organic-sm p-4"
          style={{ backgroundColor: "#1F2937", height: "280px" }}
        >
          <canvas ref={canvasRef} className="max-h-[240px]" />
        </div>
        <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-[#111827]/70">
          IG followers (7 days)
        </h3>
        <div
          className="rounded-organic-sm p-4"
          style={{ backgroundColor: "#1F2937", height: "260px" }}
        >
          <canvas ref={followersCanvasRef} className="max-h-[220px]" />
        </div>
      </section>

      {/* Traffic split + captions */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Traffic split
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <StatCard label="Paid Social sessions" value={formatSessions(latest?.ga_paid_social_sessions)} />
            <p className="mt-1.5 text-xs text-[#111827]/55">Sessions from Facebook &amp; Instagram ads</p>
          </div>
          <div>
            <StatCard label="Organic sessions" value={formatSessions(latest?.ga_organic_sessions)} />
            <p className="mt-1.5 text-xs text-[#111827]/55">Sessions from Instagram organic</p>
          </div>
        </div>
      </section>

      {/* Meta + IG snapshot */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Meta + IG snapshot
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="rounded-organic-sm space-y-4 p-4"
            style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#F09A54]">Meta</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#F2EEE2]/60">Clicks</p>
                <p className="mt-1 font-mono text-xl tabular-nums">
                  {latest ? formatMetaPinterest(latest, "meta_clicks") : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#F2EEE2]/60">CTR</p>
                <p className="mt-1 font-mono text-xl tabular-nums">
                  {latest?.meta_ctr === null || latest?.meta_ctr === undefined
                    ? "—"
                    : formatCtr(latest.meta_ctr)}
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-organic-sm p-4"
            style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#F09A54]">Instagram</p>
            <div className="mt-4">
              <p className="text-xs text-[#F2EEE2]/60">Reach</p>
              <p className="mt-1 font-mono text-xl tabular-nums">
                {latest?.ig_total_reach === null || latest?.ig_total_reach === undefined
                  ? "—"
                  : Number(latest.ig_total_reach).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns — today (from latest ff_analytics_daily row) */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Campaigns — today
        </h2>
        <div
          className="overflow-x-auto rounded-organic-sm p-3"
          style={{ backgroundColor: "#1F2937", color: "#F2EEE2" }}
        >
          {campaignRows.length === 0 ? (
            <p className="text-sm text-[#F2EEE2]/60">No campaign rows in analytics snapshot.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#F2EEE2]/15">
                  <th className="pb-2 pr-3 font-semibold text-[#F2EEE2]/80">Ad name</th>
                  <th className="pb-2 pr-3 font-semibold text-[#F2EEE2]/80">Spend (AED)</th>
                  <th className="pb-2 pr-3 font-semibold text-[#F2EEE2]/80">Clicks</th>
                  <th className="pb-2 pr-3 font-semibold text-[#F2EEE2]/80">CTR %</th>
                  <th className="pb-2 pr-3 font-semibold text-[#F2EEE2]/80">Landing views</th>
                  <th className="pb-2 font-semibold text-[#F2EEE2]/80">Video views</th>
                </tr>
              </thead>
              <tbody>
                {campaignRows.map((c, i) => (
                  <tr key={i} className="border-b border-[#F2EEE2]/10">
                    <td className="py-2 pr-3 font-mono text-xs text-[#F2EEE2]">{c.name}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatAed(c.spend)}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.clicks.toLocaleString()}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.ctr === null ? "—" : formatCtr(c.ctr)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.land === null ? "—" : c.land.toLocaleString()}
                    </td>
                    <td className="py-2 tabular-nums">{c.video === null ? "—" : c.video.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
