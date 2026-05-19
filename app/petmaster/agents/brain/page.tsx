"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pin, PinOff, X } from "lucide-react"
import { cn } from "@/lib/utils"

const MS_90_D = 90 * 24 * 60 * 60 * 1000

type OperatorNoteRow = {
  id: string
  created_at: string
  note: string
  priority?: string | null
  expires_at?: string | null
  active?: boolean | null
}

type PbDecisionRow = {
  id: string
  created_at: string
  updated_at?: string | null
  category?: string | null
  title?: string | null
  body?: string | null
  outcome?: string | null
  tags?: string[] | null
  pinned?: boolean | null
  active?: boolean | null
}

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

function formatBrainTimestamp(raw: string | null | undefined): string {
  if (!raw) return "—"
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function operatorPriorityBadgeClass(priority: string | null | undefined): string {
  const p = (priority ?? "normal").toLowerCase()
  if (p === "urgent") return "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-[#F09A54] text-[#F2EEE2]"
  if (p === "low") return "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-[#1F2937] text-[#F2EEE2]"
  return "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-[#374151] text-[#F2EEE2]"
}

function pbCategoryBadgeClass(cat: string | null | undefined): string {
  const c = (cat ?? "").toLowerCase()
  if (c === "campaign") return "bg-orange-900/60 text-orange-100"
  if (c === "milestone") return "bg-emerald-800/40 text-emerald-100"
  if (c === "strategic") return "bg-violet-800/40 text-violet-100"
  if (c === "lesson_learned") return "bg-amber-800/40 text-amber-100"
  return "bg-slate-700/80 text-slate-200"
}

function pbCategoryLabel(cat: string | null | undefined): string {
  const c = (cat ?? "").toLowerCase()
  const map: Record<string, string> = {
    campaign: "Campaign",
    milestone: "Milestone",
    strategic: "Strategic",
    operator_note: "Operator note",
    lesson_learned: "Lesson learned",
  }
  return map[c] || (c ? c.replace(/_/g, " ") : "Entry")
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

  const [operatorNotes, setOperatorNotes] = useState<OperatorNoteRow[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [notePriority, setNotePriority] = useState<"urgent" | "normal" | "low">("normal")
  const [noteExpires7d, setNoteExpires7d] = useState(false)
  const [noteDeletingId, setNoteDeletingId] = useState<string | null>(null)

  const [pbDecisions, setPbDecisions] = useState<PbDecisionRow[]>([])
  const [pbLoading, setPbLoading] = useState(true)
  const [pbSaving, setPbSaving] = useState(false)
  const [pbTab, setPbTab] = useState<"active" | "archive">("active")
  const [showPbAdd, setShowPbAdd] = useState(false)
  const [pbCategory, setPbCategory] = useState<
    "campaign" | "milestone" | "strategic" | "lesson_learned"
  >("campaign")
  const [pbTitle, setPbTitle] = useState("")
  const [pbBody, setPbBody] = useState("")
  const [pbTags, setPbTags] = useState("")
  const [pbPinned, setPbPinned] = useState(false)
  const [expandedPbBody, setExpandedPbBody] = useState<Record<string, boolean>>({})
  const [outcomeDraftById, setOutcomeDraftById] = useState<Record<string, string>>({})
  const [outcomeOpenId, setOutcomeOpenId] = useState<string | null>(null)
  const [pbBusyPatchId, setPbBusyPatchId] = useState<string | null>(null)

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

  const loadOperatorNotes = useCallback(async () => {
    setNotesLoading(true)
    try {
      const res = await fetch("/api/petmaster-brain-note", { credentials: "same-origin" })
      const j = (await res.json().catch(() => null)) as OperatorNoteRow[] | { error?: string }
      if (!res.ok) {
        setOperatorNotes([])
        return
      }
      if (Array.isArray(j)) setOperatorNotes(j)
      else setOperatorNotes([])
    } finally {
      setNotesLoading(false)
    }
  }, [])

  const loadPbDecisions = useCallback(async () => {
    setPbLoading(true)
    try {
      const res = await fetch("/api/petmaster-brain-decision", { credentials: "same-origin" })
      const j = (await res.json().catch(() => null)) as PbDecisionRow[] | { error?: string }
      if (!res.ok) {
        setPbDecisions([])
        return
      }
      if (Array.isArray(j)) setPbDecisions(j)
      else setPbDecisions([])
    } finally {
      setPbLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOperatorNotes()
    void loadPbDecisions()
  }, [loadOperatorNotes, loadPbDecisions])

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

  async function deleteJson(url: string, body: object) {
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
    }
  }

  const pbActiveList = useMemo(() => {
    const cutoff = Date.now() - MS_90_D
    return pbDecisions.filter(
      (e) => !!e?.pinned || (!!e.created_at && new Date(e.created_at).getTime() >= cutoff),
    )
  }, [pbDecisions])

  const pbArchiveList = useMemo(() => {
    const cutoff = Date.now() - MS_90_D
    return pbDecisions.filter(
      (e) => !e?.pinned && !!e.created_at && new Date(e.created_at).getTime() < cutoff,
    )
  }, [pbDecisions])

  async function submitOperatorNote() {
    const trimmed = noteDraft.trim()
    if (!trimmed) return
    setNoteSubmitting(true)
    setError(null)
    try {
      const expires_at =
        noteExpires7d ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
      await postJson("/api/petmaster-brain-note", {
        note: trimmed,
        priority: notePriority,
        expires_at,
      })
      setNoteDraft("")
      setNotePriority("normal")
      setNoteExpires7d(false)
      await loadOperatorNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save note")
    } finally {
      setNoteSubmitting(false)
    }
  }

  async function deactivateNote(id: string) {
    setNoteDeletingId(id)
    setError(null)
    try {
      await deleteJson("/api/petmaster-brain-note", { id })
      await loadOperatorNotes()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove note")
    } finally {
      setNoteDeletingId(null)
    }
  }

  async function submitPbEntry() {
    setPbSaving(true)
    setError(null)
    try {
      await postJson("/api/petmaster-brain-decision", {
        category: pbCategory,
        title: pbTitle.trim(),
        body: pbBody.trim(),
        tags: pbTags.trim(),
        pinned: pbPinned,
      })
      setShowPbAdd(false)
      setPbTitle("")
      setPbBody("")
      setPbTags("")
      setPbPinned(false)
      setPbCategory("campaign")
      await loadPbDecisions()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save entry")
    } finally {
      setPbSaving(false)
    }
  }

  async function saveOutcome(id: string) {
    const draft = outcomeDraftById[id] ?? ""
    setPbBusyPatchId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-brain-decision", { id, outcome: draft.trim() || null })
      setOutcomeOpenId(null)
      await loadPbDecisions()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save outcome")
    } finally {
      setPbBusyPatchId(null)
    }
  }

  async function togglePinned(id: string, current: boolean) {
    setPbBusyPatchId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-brain-decision", { id, pinned: !current })
      await loadPbDecisions()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update pin")
    } finally {
      setPbBusyPatchId(null)
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
      <p className="text-sm text-[#F2EEE2]/60">
        Tier 1 only, brand positioning, guide, and product decisions (plus agent notes below).
      </p>

      <section className="rounded-xl border border-white/10 bg-[#1F2937] p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F2EEE2]">Operator notes</h2>
          <p className="mt-1 text-xs text-[#F2EEE2]/50">
            Short instructions for Strategy and agents. Sorted with urgent first, then newest.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111827]/60 p-3 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#F2EEE2]/50">
            New note
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a note for the agents, e.g. Start Father's Day content this week"
              rows={3}
              className="mt-2 w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-[#F2EEE2] placeholder:text-[#F2EEE2]/35"
            />
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col text-xs text-[#F2EEE2]/50">
              Priority
              <select
                value={notePriority}
                onChange={(e) =>
                  setNotePriority(e.target.value as "urgent" | "normal" | "low")
                }
                className="mt-1 min-w-[8rem] rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2]"
              >
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#F2EEE2]/80 pt-6">
              <input
                type="checkbox"
                checked={noteExpires7d}
                onChange={(e) => setNoteExpires7d(e.target.checked)}
                className="h-4 w-4 rounded border-white/25 bg-[#111827]"
              />
              Expires in 7 days
            </label>
            <button
              type="button"
              disabled={noteSubmitting || !noteDraft.trim()}
              onClick={() => void submitOperatorNote()}
              className="rounded-md bg-[#F09A54] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F09A54]/90 disabled:opacity-50"
            >
              {noteSubmitting ? "Sending…" : "Send to agents"}
            </button>
          </div>
        </div>
        {notesLoading ? (
          <p className="text-sm text-[#F2EEE2]/50">Loading notes…</p>
        ) : operatorNotes.length === 0 ? (
          <p className="text-sm text-[#F2EEE2]/45">No active notes.</p>
        ) : (
          <ul className="space-y-3">
            {operatorNotes.map((n) => {
              const deleting = noteDeletingId === n.id
              const prLabel = String(n.priority ?? "normal").toLowerCase()
              return (
                <li key={n.id} className="rounded-lg border border-white/10 bg-[#111827]/50 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={operatorPriorityBadgeClass(prLabel)}>{prLabel}</span>
                      <span className="text-xs text-[#F2EEE2]/50">
                        {formatBrainTimestamp(n.created_at)}
                      </span>
                      {n.expires_at ? (
                        <span className="text-[11px] text-[#F2EEE2]/40">
                          Expires {formatBrainTimestamp(n.expires_at)}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove note"
                      disabled={deleting}
                      onClick={() => void deactivateNote(n.id)}
                      className="rounded p-1 text-red-400 hover:bg-white/5 hover:text-red-300 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#F2EEE2]/95">{n.note}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-[#1F2937] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#F2EEE2]">Decision log</h2>
            <p className="mt-1 text-xs text-[#F2EEE2]/50">
              Campaign history, milestones, and lessons. Pinned rows always surface to agents with recent work.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPbAdd((o) => !o)}
            className="shrink-0 rounded-md border border-white/25 px-3 py-2 text-sm font-medium text-[#F2EEE2]/90 hover:bg-white/5"
          >
            {showPbAdd ? "Close add entry" : "Add entry"}
          </button>
        </div>

        <div className="inline-flex rounded-full border border-white/15 bg-[#111827]/80 p-1">
          {(["active", "archive"] as const).map((k) => {
            const on = pbTab === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPbTab(k)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium capitalize",
                  on ? "bg-[#F09A54] text-[#111827]" : "text-[#F2EEE2]/75 hover:text-[#F2EEE2]",
                )}
              >
                {k}
              </button>
            )
          })}
        </div>

        {showPbAdd && (
          <div className="space-y-3 rounded-lg border border-white/10 bg-[#111827]/60 p-4">
            <p className="text-sm font-medium text-[#F2EEE2]">Save to brain</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-[#F2EEE2]/50">
                Category
                <select
                  value={pbCategory}
                  onChange={(e) =>
                    setPbCategory(
                      e.target.value as "campaign" | "milestone" | "strategic" | "lesson_learned",
                    )
                  }
                  className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2]"
                >
                  <option value="campaign">Campaign</option>
                  <option value="milestone">Milestone</option>
                  <option value="strategic">Strategic</option>
                  <option value="lesson_learned">Lesson learned</option>
                </select>
              </label>
              <label className="block text-xs text-[#F2EEE2]/50 sm:col-span-2">
                Title
                <input
                  value={pbTitle}
                  onChange={(e) => setPbTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2]"
                />
              </label>
            </div>
            <label className="block text-xs text-[#F2EEE2]/50">
              Body
              <textarea
                value={pbBody}
                onChange={(e) => setPbBody(e.target.value)}
                placeholder="What happened, what you decided, what to remember"
                rows={4}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2] placeholder:text-[#F2EEE2]/35"
              />
            </label>
            <label className="block text-xs text-[#F2EEE2]/50">
              Tags (comma separated)
              <input
                value={pbTags}
                onChange={(e) => setPbTags(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2]"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#F2EEE2]/80">
              <input
                type="checkbox"
                checked={pbPinned}
                onChange={(e) => setPbPinned(e.target.checked)}
                className="h-4 w-4 rounded border-white/25 bg-[#111827]"
              />
              Always show to agents (pin)
            </label>
            <button
              type="button"
              disabled={pbSaving || !pbTitle.trim() || !pbBody.trim()}
              onClick={() => void submitPbEntry()}
              className="rounded-md bg-[#F09A54] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F09A54]/90 disabled:opacity-50"
            >
              {pbSaving ? "Saving…" : "Save to brain"}
            </button>
          </div>
        )}

        {pbLoading ? (
          <p className="text-sm text-[#F2EEE2]/50">Loading decision log…</p>
        ) : (pbTab === "active" ? pbActiveList : pbArchiveList).length === 0 ? (
          <p className="text-sm text-[#F2EEE2]/45">No entries in this tab.</p>
        ) : (
          <ul className="space-y-4">
            {(pbTab === "active" ? pbActiveList : pbArchiveList).map((entry) => {
              const expanded = !!expandedPbBody[entry.id]
              const patching = pbBusyPatchId === entry.id
              const pinned = !!entry.pinned
              const tags = Array.isArray(entry.tags) ? entry.tags : []
              return (
                <li key={entry.id} className="rounded-lg border border-white/10 bg-[#111827]/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                          pbCategoryBadgeClass(entry.category),
                        )}
                      >
                        {pbCategoryLabel(entry.category)}
                      </span>
                      {pinned ? (
                        <span className="text-[11px] font-medium uppercase tracking-wide text-[#F09A54]">
                          Pinned
                        </span>
                      ) : null}
                      <span className="text-xs text-[#F2EEE2]/45">
                        {formatBrainTimestamp(entry.created_at)}
                      </span>
                    </div>
                    <button
                      type="button"
                      title={pinned ? "Unpin" : "Pin for agents"}
                      disabled={patching}
                      onClick={() => void togglePinned(entry.id, pinned)}
                      className="rounded p-1.5 text-[#F09A54] hover:bg-white/10 disabled:opacity-50"
                      aria-label={pinned ? "Unpin entry" : "Pin entry"}
                    >
                      {pinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {entry.title ? (
                    <h3 className="mt-2 text-base font-bold text-[#F2EEE2]">{entry.title}</h3>
                  ) : null}
                  {entry.body ? (
                    <div className="mt-2">
                      <p
                        className={cn(
                          "text-sm leading-relaxed text-[#F2EEE2]/90 whitespace-pre-wrap",
                          !expanded && "line-clamp-3",
                        )}
                      >
                        {entry.body}
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs font-medium text-[#F09A54] hover:underline"
                        onClick={() =>
                          setExpandedPbBody((m) => ({ ...m, [entry.id]: !expanded }))
                        }
                      >
                        {expanded ? "Show less" : "Expand"}
                      </button>
                    </div>
                  ) : null}
                  {entry.outcome ? (
                    <p className="mt-2 rounded-md bg-white/5 p-2 text-sm text-[#F2EEE2]/80">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#F2EEE2]/50">
                        Outcome{" "}
                      </span>
                      {entry.outcome}
                    </p>
                  ) : null}
                  {tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={`${entry.id}-${tag}`}
                          className="rounded-full border border-white/15 bg-[#1F2937] px-2 py-0.5 text-[11px] text-[#F2EEE2]/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {outcomeOpenId === entry.id ? (
                    <div className="mt-3 space-y-2 rounded-md border border-white/15 bg-[#111827]/80 p-3">
                      <label className="block text-xs text-[#F2EEE2]/50">
                        Outcome
                        <textarea
                          rows={3}
                          value={
                            outcomeDraftById[entry.id] ??
                            (typeof entry.outcome === "string" ? entry.outcome : "")
                          }
                          onChange={(e) =>
                            setOutcomeDraftById((m) => ({ ...m, [entry.id]: e.target.value }))
                          }
                          className="mt-1 w-full rounded-md border border-white/15 bg-[#111827] px-2 py-2 text-sm text-[#F2EEE2]"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={patching}
                          onClick={() => void saveOutcome(entry.id)}
                          className="rounded-md bg-[#F09A54] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#F09A54]/90 disabled:opacity-50"
                        >
                          Save outcome
                        </button>
                        <button
                          type="button"
                          onClick={() => setOutcomeOpenId(null)}
                          className="rounded-md border border-white/25 px-3 py-2 text-sm text-[#F2EEE2]/80 hover:bg-white/5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={patching}
                      onClick={() => {
                        setOutcomeOpenId(entry.id)
                        setOutcomeDraftById((m) => ({
                          ...m,
                          [entry.id]:
                            typeof entry.outcome === "string" ? entry.outcome : "",
                        }))
                      }}
                      className="mt-3 rounded-md border border-white/25 px-3 py-1.5 text-xs font-medium text-[#F2EEE2]/90 hover:bg-white/5 disabled:opacity-50"
                    >
                      {entry.outcome ? "Edit outcome" : "Add outcome"}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-[#1F2937]/80 p-1">
        {(
          [
            { id: "decisions" as const, label: "Product decisions" },
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
