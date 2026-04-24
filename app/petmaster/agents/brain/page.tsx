"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Tab = "decisions" | "brand" | "playbook"

type ProductDecision = {
  id: string
  decision_date?: string | null
  title?: string | null
  decision?: string | null
  rationale?: string | null
  content_impact?: string | null
  owner?: string | null
  status?: string | null
}

type PositioningRow = { key: string; value?: string | null; [k: string]: unknown }

type BrandGuideRow = {
  category: string
  key: string
  value?: string | null
  [k: string]: unknown
}

type PlaybookRow = {
  id: string
  category?: string | null
  rule?: string | null
  confidence?: string | null
  source?: string | null
  rationale?: string | null
  active?: boolean | null
}

type BrainPayload = {
  positioning: PositioningRow[]
  brand_guide: BrandGuideRow[]
  decisions: ProductDecision[]
  playbook: PlaybookRow[]
}

function formatDecisionDate(raw: string | null | undefined): string {
  if (!raw) return "—"
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(raw).trim())
    ? new Date(`${String(raw).trim()}T12:00:00.000Z`)
    : new Date(raw)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function todayYmdLocal(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
}

function statusDecisionPill(status: string | null | undefined): { label: string; className: string } {
  const s = (status ?? "").toLowerCase()
  if (s === "active") return { label: "active", className: "bg-emerald-600/50 text-emerald-100" }
  if (s === "superseded") return { label: "superseded", className: "bg-slate-500/50 text-slate-200" }
  if (s === "under_review") return { label: "under review", className: "bg-amber-500/40 text-amber-100" }
  return { label: s || "—", className: "bg-slate-600/50 text-slate-200" }
}

function confidencePlaybookPill(
  c: string | null | undefined,
): { label: string; className: string } {
  const s = (c ?? "").toLowerCase()
  if (s === "proven") return { label: "proven", className: "bg-emerald-600/50 text-emerald-100" }
  if (s === "high") return { label: "high", className: "bg-sky-600/50 text-sky-100" }
  if (s === "medium") return { label: "medium", className: "bg-amber-500/40 text-amber-100" }
  if (s === "low") return { label: "low", className: "bg-slate-500/50 text-slate-200" }
  if (s === "assumed") return { label: "assumed", className: "bg-slate-600/30 text-slate-400" }
  return { label: c || "—", className: "bg-slate-600/40 text-slate-300" }
}

function sourcePill(s: string | null | undefined): string {
  const v = (s ?? "").toLowerCase()
  if (v === "seed") return "bg-slate-600/60 text-slate-100"
  if (v === "analytics_agent") return "bg-violet-600/40 text-violet-100"
  if (v === "stephan") return "bg-[#F09A54]/30 text-[#F2EEE2]"
  return "bg-slate-600/50 text-slate-200"
}

function countByConfidence(rows: PlaybookRow[]): string {
  const m: Record<string, number> = {
    proven: 0,
    high: 0,
    medium: 0,
    low: 0,
    assumed: 0,
  }
  for (const r of rows) {
    const c = (r.confidence ?? "").toLowerCase()
    if (c in m) m[c] += 1
  }
  const parts: string[] = []
  for (const k of ["proven", "high", "medium", "low", "assumed"] as const) {
    if (m[k] > 0) parts.push(`${m[k]} ${k}`)
  }
  return parts.length ? parts.join(" · ") : "0 rules"
}

function groupByCategory(rows: PlaybookRow[]): Map<string, PlaybookRow[]> {
  const map = new Map<string, PlaybookRow[]>()
  for (const r of rows) {
    const c = (r.category ?? "Uncategorised").trim() || "Uncategorised"
    if (!map.has(c)) map.set(c, [])
    map.get(c)!.push(r)
  }
  return map
}

function groupGuideByCategory(rows: BrandGuideRow[]): Map<string, BrandGuideRow[]> {
  const map = new Map<string, BrandGuideRow[]>()
  for (const r of rows) {
    const c = (r.category ?? "General").trim() || "General"
    if (!map.has(c)) map.set(c, [])
    map.get(c)!.push(r)
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.key ?? "").localeCompare(b.key ?? ""))
  }
  return map
}

export default function PetmasterAgentsBrainPage() {
  const [tab, setTab] = useState<Tab>("decisions")
  const [data, setData] = useState<BrainPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [fDate, setFDate] = useState(todayYmdLocal)
  const [fTitle, setFTitle] = useState("")
  const [fDecision, setFDecision] = useState("")
  const [fRationale, setFRationale] = useState("")
  const [fImpact, setFImpact] = useState("")
  const [fOwner, setFOwner] = useState("Stephan")

  const [editPos, setEditPos] = useState<PositioningRow | null>(null)
  const [editPosVal, setEditPosVal] = useState("")

  const [editGuide, setEditGuide] = useState<BrandGuideRow | null>(null)
  const [editGuideVal, setEditGuideVal] = useState("")

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    const res = await fetch("/api/petmaster-brain", { credentials: "same-origin" })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
      setData({
        positioning: [],
        brand_guide: [],
        decisions: [],
        playbook: [],
      })
    } else {
      setData((await res.json()) as BrainPayload)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const playbook = data?.playbook ?? []
  const countLine = useMemo(() => countByConfidence(playbook), [playbook])
  const pbGrouped = useMemo(() => groupByCategory(playbook), [playbook])
  const guideGrouped = useMemo(
    () => groupGuideByCategory(data?.brand_guide ?? []),
    [data?.brand_guide],
  )

  async function postJson(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
    }
  }

  async function patchJson(url: string, body: object) {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
    }
  }

  async function onAddDecision() {
    setSaving(true)
    setError(null)
    try {
      await postJson("/api/petmaster-add-decision", {
        decision_date: fDate,
        title: fTitle,
        decision: fDecision,
        rationale: fRationale,
        content_impact: fImpact,
        owner: fOwner,
      })
      setShowAdd(false)
      setFTitle("")
      setFDecision("")
      setFRationale("")
      setFImpact("")
      setFOwner("Stephan")
      setFDate(todayYmdLocal())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add")
    } finally {
      setSaving(false)
    }
  }

  async function onSupersede(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await postJson("/api/petmaster-supersede-decision", { id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  async function onSavePositioning() {
    if (!editPos) return
    setSaving(true)
    setError(null)
    try {
      await patchJson("/api/petmaster-update-positioning", { key: editPos.key, value: editPosVal })
      setEditPos(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function onSaveGuide() {
    if (!editGuide) return
    setSaving(true)
    setError(null)
    try {
      await patchJson("/api/petmaster-update-brand-guide", {
        category: editGuide.category,
        key: editGuide.key,
        value: editGuideVal,
      })
      setEditGuide(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function onDeactivate(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await postJson("/api/petmaster-deactivate-rule", { id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="-m-6 space-y-6 bg-[#111827] p-6 text-[#F2EEE2] md:-m-8 md:p-8" data-page="petmaster-brain">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#F2EEE2]">Brain</h1>
      <p className="text-sm text-[#F2EEE2]/60">Tier 1 only — brand positioning, guide, and product decisions.</p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-[#1F2937]/80 p-1">
        {(
          [
            { id: "decisions" as const, label: "Decision log" },
            { id: "brand" as const, label: "Brand guide" },
            { id: "playbook" as const, label: "Approved playbook" },
          ] as const
        ).map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "text-[#F09A54]" : "text-[#F2EEE2]/80 hover:text-[#F2EEE2]",
              )}
            >
              {t.label}
              {active && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#F09A54]"
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      {loading && <p className="text-sm text-[#F2EEE2]/60">Loading…</p>}

      {!loading && tab === "decisions" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAdd((o) => !o)
                if (!showAdd) {
                  setFDate(todayYmdLocal())
                }
              }}
              className="rounded-md bg-[#F09A54] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F09A54]/90"
            >
              {showAdd ? "Close form" : "Add decision"}
            </button>
          </div>

          {showAdd && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#1F2937] p-4">
              <p className="text-sm font-medium text-[#F2EEE2]">New product decision</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-[#F2EEE2]/60">
                  Date
                  <input
                    type="date"
                    value={fDate}
                    onChange={(e) => setFDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                  />
                </label>
                <label className="block text-xs text-[#F2EEE2]/60">
                  Owner
                  <input
                    value={fOwner}
                    onChange={(e) => setFOwner(e.target.value)}
                    className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                  />
                </label>
              </div>
              <label className="block text-xs text-[#F2EEE2]/60">
                Title
                <input
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                />
              </label>
              <label className="block text-xs text-[#F2EEE2]/60">
                Decision
                <textarea
                  value={fDecision}
                  onChange={(e) => setFDecision(e.target.value)}
                  className="mt-1 min-h-[80px] w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                />
              </label>
              <label className="block text-xs text-[#F2EEE2]/60">
                Rationale
                <textarea
                  value={fRationale}
                  onChange={(e) => setFRationale(e.target.value)}
                  className="mt-1 min-h-[64px] w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                />
              </label>
              <label className="block text-xs text-[#F2EEE2]/60">
                Content impact
                <textarea
                  value={fImpact}
                  onChange={(e) => setFImpact(e.target.value)}
                  className="mt-1 min-h-[64px] w-full rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2]"
                />
              </label>
              <button
                type="button"
                onClick={() => void onAddDecision()}
                disabled={saving}
                className="rounded-md bg-[#22c55e] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Submitting…" : "Submit"}
              </button>
            </div>
          )}

          <ul className="space-y-3">
            {(data?.decisions ?? []).map((d) => {
              const st = statusDecisionPill(d.status)
              const isBusy = busyId === d.id
              return (
                <li key={d.id} className="rounded-xl border border-white/5 bg-[#1F2937] p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#F2EEE2]/60">
                    <time dateTime={d.decision_date ?? undefined}>{formatDecisionDate(d.decision_date)}</time>
                    {d.owner && (
                      <span className="inline-flex rounded-sm bg-slate-600/50 px-1.5 py-0.5 text-[11px] text-slate-100">
                        {d.owner}
                      </span>
                    )}
                    <span className={cn("inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium", st.className)}>
                      {st.label}
                    </span>
                  </div>
                  {d.title && <h3 className="mt-2 text-base font-bold text-[#F2EEE2]">{d.title}</h3>}
                  {d.decision && <p className="mt-1 text-sm leading-relaxed text-[#F2EEE2]/95">{d.decision}</p>}
                  {d.rationale && <p className="mt-2 text-sm text-[#F2EEE2]/55">{d.rationale}</p>}
                  {d.content_impact && (
                    <div
                      className="mt-3 rounded-md p-2 text-sm text-[#F2EEE2]/90"
                      style={{ backgroundColor: "rgba(240, 154, 84, 0.1)" }}
                    >
                      {d.content_impact}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onSupersede(d.id)}
                    disabled={isBusy}
                    className="mt-3 rounded-md border border-white/20 px-2 py-1 text-xs text-[#F2EEE2]/80 hover:bg-white/5 disabled:opacity-50"
                  >
                    {isBusy ? "…" : "Supersede"}
                  </button>
                </li>
              )
            })}
          </ul>
          {(!data?.decisions || data.decisions.length === 0) && !showAdd && (
            <p className="text-sm text-[#F2EEE2]/50">No active decisions yet.</p>
          )}
        </section>
      )}

      {!loading && tab === "brand" && (
        <section className="space-y-8">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#F2EEE2]/60">
              Brand positioning
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#1a1f2e]">
                    <th className="p-2 font-medium text-[#F2EEE2]/80">key</th>
                    <th className="p-2 font-medium text-[#F2EEE2]/80">value</th>
                    <th className="p-2 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {(data?.positioning ?? []).map((row, i) => {
                    const isEven = i % 2 === 0
                    const isEdit = editPos?.key === row.key
                    return (
                      <tr
                        key={row.key}
                        className={cn(
                          "border-b border-white/5",
                          isEven ? "bg-[#1F2937]/40" : "bg-[#1F2937]/20",
                        )}
                      >
                        <td className="align-top p-2 font-mono text-xs text-[#F2EEE2]/80">{row.key}</td>
                        <td className="align-top p-2 text-[#F2EEE2]/90">
                          {isEdit ? (
                            <textarea
                              value={editPosVal}
                              onChange={(e) => setEditPosVal(e.target.value)}
                              className="min-h-[72px] w-full rounded border border-white/20 bg-[#111827] px-2 py-1 text-sm"
                            />
                          ) : (
                            <span className="whitespace-pre-wrap">{(row.value as string) ?? "—"}</span>
                          )}
                        </td>
                        <td className="align-top p-2">
                          {isEdit ? (
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => void onSavePositioning()}
                                disabled={saving}
                                className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditPos(null)}
                                className="text-xs text-[#F2EEE2]/50 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditPos(row)
                                setEditPosVal(String(row.value ?? ""))
                              }}
                              className="text-xs text-[#F09A54] hover:underline"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {(data?.positioning?.length ?? 0) === 0 && (
              <p className="mt-2 text-sm text-[#F2EEE2]/50">No positioning rows.</p>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#F2EEE2]/60">
              Brand guide
            </h2>
            {Array.from(guideGrouped.entries()).map(([cat, list]) => (
              <details key={cat} className="mb-3 open:rounded-xl open:border open:border-white/5" open>
                <summary className="cursor-pointer list-none rounded-t-xl bg-[#1a1f2e] px-3 py-2 text-sm font-medium text-[#F09A54] marker:hidden [&::-webkit-details-marker]:hidden">
                  {cat}
                </summary>
                <div className="overflow-x-auto rounded-b-xl border border-t-0 border-white/5">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <tbody>
                      {list.map((row, i) => {
                        const isEven = i % 2 === 0
                        const isEdit =
                          editGuide?.category === row.category && editGuide?.key === row.key
                        return (
                          <tr
                            key={`${row.category}-${row.key}`}
                            className={cn(
                              "border-b border-white/5",
                              isEven ? "bg-[#1F2937]/40" : "bg-[#1F2937]/20",
                            )}
                          >
                            <td className="w-[28%] p-2 font-mono text-xs text-[#F2EEE2]/80">
                              {row.key}
                            </td>
                            <td className="p-2 text-[#F2EEE2]/90">
                              {isEdit ? (
                                <textarea
                                  value={editGuideVal}
                                  onChange={(e) => setEditGuideVal(e.target.value)}
                                  className="min-h-[72px] w-full rounded border border-white/20 bg-[#111827] px-2 py-1 text-sm"
                                />
                              ) : (
                                <span className="whitespace-pre-wrap">{(row.value as string) ?? "—"}</span>
                              )}
                            </td>
                            <td className="w-20 p-2">
                              {isEdit ? (
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void onSaveGuide()}
                                    disabled={saving}
                                    className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditGuide(null)}
                                    className="text-xs text-[#F2EEE2]/50 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditGuide(row)
                                    setEditGuideVal(String(row.value ?? ""))
                                  }}
                                  className="text-xs text-[#F09A54] hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
            {guideGrouped.size === 0 && (
              <p className="text-sm text-[#F2EEE2]/50">No brand guide rows.</p>
            )}
          </div>
        </section>
      )}

      {!loading && tab === "playbook" && (
        <section className="space-y-4">
          <p className="text-sm text-[#F2EEE2]/80">{countLine}</p>
          {Array.from(pbGrouped.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([cat, list]) => (
              <div key={cat}>
                <h2 className="mb-2 text-sm font-semibold text-[#F09A54]">{cat}</h2>
                <ul className="space-y-2">
                  {list.map((r) => {
                    const cp = confidencePlaybookPill(r.confidence)
                    const isBusy = busyId === r.id
                    return (
                      <li
                        key={r.id}
                        className="rounded-xl border border-white/5 bg-[#1F2937] p-3"
                      >
                        <p className="text-sm font-medium text-[#F2EEE2]">{r.rule ?? "—"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
                              cp.className,
                            )}
                          >
                            {cp.label}
                          </span>
                          {r.source && (
                            <span
                              className={cn(
                                "inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
                                sourcePill(r.source),
                              )}
                            >
                              {r.source}
                            </span>
                          )}
                        </div>
                        {r.rationale && (
                          <p className="mt-1.5 text-xs text-[#F2EEE2]/50">{r.rationale}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeactivate(r.id)}
                          disabled={isBusy}
                          className="mt-2 rounded-md border border-white/20 px-2 py-1 text-xs text-[#F2EEE2]/80 hover:bg-white/5 disabled:opacity-50"
                        >
                          {isBusy ? "…" : "Deactivate"}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          {playbook.length === 0 && (
            <p className="text-sm text-[#F2EEE2]/50">No active playbook rules.</p>
          )}
        </section>
      )}
    </div>
  )
}
