"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type BacklogRow = {
  id: string
  title: string
  status: string
  type: string | null
  priority: string | null
  area: string | null
}

const priorityStyles: Record<
  string,
  { bg: string; text: string }
> = {
  critical: { bg: "#FCEBEB", text: "#A32D2D" },
  high: { bg: "#FAEEDA", text: "#854F0B" },
  medium: { bg: "#F1EFE8", text: "#5F5E5A" },
  low: { bg: "#EAF3DE", text: "#3B6D11" },
}

function PriorityPill({ priority }: { priority: string | null }) {
  const p = (priority ?? "medium").toLowerCase()
  const s = priorityStyles[p] ?? priorityStyles.medium
  return (
    <span
      className="inline-block rounded-organic-sm px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {priority ?? "—"}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-block rounded-organic-sm bg-[#1F2937]/10 px-2.5 py-0.5 text-xs font-medium capitalize text-[#111827]">
      {status}
    </span>
  )
}

export default function PetmasterBacklogPage() {
  const [rows, setRows] = useState<BacklogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    const res = await fetch("/api/petmaster-backlog", { credentials: "same-origin" })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
      setRows([])
    } else {
      const json = (await res.json()) as { rows?: BacklogRow[] }
      setRows(json.rows ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const grouped = useMemo(() => {
    if (!rows?.length) return []
    const map = new Map<string, BacklogRow[]>()
    for (const row of rows) {
      const area = row.area?.trim() || "Other"
      if (!map.has(area)) map.set(area, [])
      map.get(area)!.push(row)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  async function markDone(id: string) {
    setBusyId(id)
    try {
      const res = await fetch("/api/petmaster-backlog-done", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#111827]/70">Loading backlog…</p>
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">Backlog</h1>
      {error ? (
        <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      {!error && !rows.length ? (
        <p className="rounded-organic-sm bg-[#1F2937] p-6 text-sm text-[#F2EEE2]">
          No open backlog items.
        </p>
      ) : null}

      {!error && rows.length > 0 ? (
        grouped.map(([area, items]) => (
          <section key={area}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#111827]/80">
              {area}
            </h2>
            <div className="overflow-x-auto rounded-organic-sm border border-[#111827]/15 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#111827]/10 bg-[#F2EEE2]/80">
                    <th className="px-4 py-3 font-semibold text-[#111827]">Title</th>
                    <th className="px-4 py-3 font-semibold text-[#111827]">Status</th>
                    <th className="px-4 py-3 font-semibold text-[#111827]">Type</th>
                    <th className="px-4 py-3 font-semibold text-[#111827]">Priority</th>
                    <th className="px-4 py-3 font-semibold text-[#111827]"> </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-[#111827]/5 last:border-0">
                      <td className="px-4 py-3 font-medium text-[#111827]">{row.title}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-[#111827]/80">{row.type ?? "—"}</td>
                      <td className="px-4 py-3">
                        <PriorityPill priority={row.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => markDone(row.id)}
                          className="rounded-organic-sm bg-[#F09A54] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F09A54]/90 disabled:opacity-50"
                        >
                          {busyId === row.id ? "…" : "Mark done"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : null}
    </div>
  )
}
