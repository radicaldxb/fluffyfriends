"use client"

import { useEffect, useMemo, useState } from "react"

type PortraitRow = {
  id: string
  pet_name: string | null
  theme: string | null
  status: string | null
  user_email: string | null
  portrait_url: string | null
  landscape_url: string | null
  created_at: string
  showcase_consent: boolean | null
  location: string | null
}

type FilterMode = "all" | "test" | "real"

function isTestEmail(email: string | null | undefined): boolean {
  if (email == null || String(email).trim() === "") return true
  return String(email).toLowerCase().includes("yopmail")
}

function StatusPill({ status }: { status: string | null }) {
  const s = status ?? "—"
  return (
    <span className="inline-block rounded-organic-sm bg-[#1F2937]/10 px-2 py-0.5 text-xs font-medium capitalize text-[#111827]">
      {s}
    </span>
  )
}

export default function PetmasterUsersPage() {
  const [rows, setRows] = useState<PortraitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>("all")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/petmaster-users", { credentials: "same-origin" })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (!cancelled) setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
          if (!cancelled) setRows([])
          return
        }
        const data = Array.isArray(j) ? j : []
        if (!cancelled) setRows(data as PortraitRow[])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
        if (!cancelled) setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return rows
    if (filter === "test") return rows.filter((r) => isTestEmail(r.user_email))
    return rows.filter((r) => !isTestEmail(r.user_email))
  }, [rows, filter])

  const filterBtn = (mode: FilterMode, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(mode)}
      className={`rounded-organic-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
        filter === mode
          ? "bg-[#F09A54] text-white"
          : "border border-[#111827]/20 bg-white text-[#111827] hover:bg-[#F2EEE2]"
      }`}
    >
      {label}
    </button>
  )

  if (loading) {
    return <p className="text-sm text-[#111827]/70">Loading users…</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">Users</h1>
      {error ? (
        <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filterBtn("all", "All")}
        {filterBtn("test", "Test")}
        {filterBtn("real", "Real")}
      </div>

      <div className="overflow-x-auto rounded-organic-sm border border-[#111827]/10 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#111827]/10 bg-[#F2EEE2]/60">
              <th className="px-3 py-2 font-semibold text-[#111827]">Pet</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Theme</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Status</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Email</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Location</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Date</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Portrait</th>
              <th className="px-3 py-2 font-semibold text-[#111827]">Showcase</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const landscape = row.landscape_url?.trim()
              return (
                <tr key={row.id} className="border-b border-[#111827]/5">
                  <td className="px-3 py-2 font-medium text-[#111827]">{row.pet_name ?? "—"}</td>
                  <td className="px-3 py-2 text-[#111827]/80">{row.theme ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-2 text-[#111827]/80" title={row.user_email ?? ""}>
                    {row.user_email ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-[#111827]/80">{row.location ?? "—"}</td>
                  <td className="px-3 py-2 text-[#111827]/80">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {landscape && landscape.startsWith("http") ? (
                      <a
                        href={landscape}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#F09A54] underline underline-offset-2"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-[#111827]">
                    {row.showcase_consent === true ? "✓" : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-[#111827]/60">No rows match this filter.</p>
        ) : null}
      </div>
    </div>
  )
}
