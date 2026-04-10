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

function formatSessions(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  return Number(v).toLocaleString()
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

export default function PetmasterDashboardPage() {
  const [rows, setRows] = useState<AnalyticsDailyRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/petmaster-analytics", { credentials: "same-origin" })
        if (cancelled) return
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setLoadError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
          setRows([])
          return
        }
        const json = (await res.json()) as { rows?: AnalyticsDailyRow[] }
        setRows(json.rows ?? [])
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

  useEffect(() => {
    if (!chartSeries.length || !canvasRef.current) return

    let cancelled = false
    ;(async () => {
      try {
        await loadChartScript()
        if (cancelled || !canvasRef.current) return
        const Chart = (window as unknown as { Chart: new (...args: unknown[]) => { destroy: () => void } })
          .Chart
        chartRef.current?.destroy()
        chartRef.current = null

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        const labels = chartSeries.map((r) => {
          const d = new Date(r.date)
          return Number.isNaN(d.getTime())
            ? r.date
            : d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        })
        const values = chartSeries.map((r) =>
          r.ga_sessions === null || r.ga_sessions === undefined ? 0 : Number(r.ga_sessions),
        )

        chartRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "GA Sessions",
                data: values,
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
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      cancelled = true
      chartRef.current?.destroy()
      chartRef.current = null
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

      {/* Section 1 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Today
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="GA Sessions" value={formatSessions(latest?.ga_sessions)} />
          <StatCard label="Engagement Rate" value={formatEngagement(latest?.ga_engagement_rate)} />
          <StatCard
            label="Meta Spend"
            value={
              latest && (latest.meta_spend === null || latest.meta_spend === undefined)
                ? "—"
                : formatSpendAed(latest?.meta_spend)
            }
          />
          <StatCard label="IG Followers" value={formatSessions(latest?.ig_followers_count)} />
        </div>
      </section>

      {/* Section 2 */}
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
      </section>

      {/* Section 3 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Traffic split
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Paid Social sessions"
            value={formatSessions(latest?.ga_paid_social_sessions)}
          />
          <StatCard
            label="Organic sessions"
            value={formatSessions(latest?.ga_organic_sessions)}
          />
        </div>
      </section>

      {/* Section 4 */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#111827]/70">
          Meta + IG snapshot
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="rounded-organic-sm p-4 space-y-4"
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
    </div>
  )
}
