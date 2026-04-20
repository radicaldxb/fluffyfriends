"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"

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
  is_test: boolean | null
}

type InfluencerRow = {
  id: string
  created_at: string
  influencer_name: string
  email: string | null
  pet_name: string | null
  instagram_handle: string | null
  location: string | null
  followers: number | null
  credits_given: number | null
  portrait_created?: boolean
}

type FilterMode = "all" | "test" | "real" | "influencers"

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

  const [influencers, setInfluencers] = useState<InfluencerRow[]>([])
  const [influencersLoading, setInfluencersLoading] = useState(false)
  const [influencersError, setInfluencersError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPet, setFormPet] = useState("")
  const [formHandle, setFormHandle] = useState("")
  const [formLocation, setFormLocation] = useState("")
  const [formFollowers, setFormFollowers] = useState("")
  const [formCredits, setFormCredits] = useState("4")
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null)

  const fetchPortraits = useCallback(async (mode: Exclude<FilterMode, "influencers">) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/petmaster-users?filter=${encodeURIComponent(mode)}`, {
        credentials: "same-origin",
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        setRows([])
        return
      }
      const data = Array.isArray(j) ? j : []
      setRows(data as PortraitRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (filter === "influencers") return
    void fetchPortraits(filter)
  }, [filter, fetchPortraits])

  const fetchInfluencers = useCallback(async () => {
    setInfluencersLoading(true)
    setInfluencersError(null)
    try {
      const res = await fetch("/api/petmaster-influencers", { credentials: "same-origin" })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setInfluencersError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        setInfluencers([])
        return
      }
      const data = Array.isArray(j) ? j : []
      setInfluencers(data as InfluencerRow[])
    } catch (e) {
      setInfluencersError(e instanceof Error ? e.message : "Failed to load")
      setInfluencers([])
    } finally {
      setInfluencersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (filter !== "influencers") return
    void fetchInfluencers()
  }, [filter, fetchInfluencers])

  async function handleToggleTest(row: PortraitRow) {
    const next = row.is_test !== true
    setToggleBusyId(row.id)
    try {
      const res = await fetch("/api/petmaster-toggle-test", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, is_test: next }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        return
      }
      if (filter !== "influencers") {
        await fetchPortraits(filter)
      }
    } finally {
      setToggleBusyId(null)
    }
  }

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

  async function handleAddInfluencer(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required.")
      return
    }
    let followersNum: number | undefined
    if (formFollowers.trim() !== "") {
      const n = Number(formFollowers)
      if (Number.isNaN(n)) {
        setFormError("Followers must be a number.")
        return
      }
      followersNum = Math.round(n)
    }
    let creditsNum = 4
    if (formCredits.trim() !== "") {
      const c = Number(formCredits)
      if (Number.isNaN(c)) {
        setFormError("Credits must be a number.")
        return
      }
      creditsNum = Math.round(c)
    }
    setFormSubmitting(true)
    try {
      const res = await fetch("/api/petmaster-influencer-add", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          petName: formPet.trim() || undefined,
          handle: formHandle.trim() || undefined,
          location: formLocation.trim() || undefined,
          followers: followersNum,
          credits: creditsNum,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        return
      }
      setShowAddForm(false)
      setFormName("")
      setFormEmail("")
      setFormPet("")
      setFormHandle("")
      setFormLocation("")
      setFormFollowers("")
      setFormCredits("4")
      await fetchInfluencers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Request failed")
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#111827]/70">Loading users…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">Users</h1>
        {filter === "influencers" ? (
          <div className="flex w-full max-w-md flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <button
              type="button"
              onClick={() => {
                setShowAddForm((v) => !v)
                setFormError(null)
              }}
              className="rounded-organic-sm bg-[#F09A54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F09A54]/90"
            >
              Add Influencer
            </button>
            {showAddForm ? (
              <form
                onSubmit={handleAddInfluencer}
                className="w-full space-y-3 rounded-organic-sm border border-[#111827]/15 bg-white p-4 text-left shadow-sm"
              >
                {formError ? (
                  <p className="text-sm text-red-700">{formError}</p>
                ) : null}
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-name">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="inf-name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-email">
                    Email address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="inf-email"
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-pet">
                    Pet&apos;s name
                  </label>
                  <input
                    id="inf-pet"
                    value={formPet}
                    onChange={(e) => setFormPet(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-handle">
                    Instagram handle
                  </label>
                  <input
                    id="inf-handle"
                    value={formHandle}
                    onChange={(e) => setFormHandle(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-loc">
                    Location
                  </label>
                  <input
                    id="inf-loc"
                    placeholder='e.g. "New York, United States"'
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-followers">
                    Followers
                  </label>
                  <input
                    id="inf-followers"
                    type="number"
                    inputMode="numeric"
                    value={formFollowers}
                    onChange={(e) => setFormFollowers(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827]" htmlFor="inf-credits">
                    Credits given
                  </label>
                  <input
                    id="inf-credits"
                    type="number"
                    inputMode="numeric"
                    value={formCredits}
                    onChange={(e) => setFormCredits(e.target.value)}
                    className="mt-1 w-full rounded-organic-sm border border-[#111827]/20 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormError(null)
                    }}
                    className="rounded-organic-sm border border-[#111827]/20 bg-white px-3 py-2 text-sm font-medium text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="rounded-organic-sm bg-[#F09A54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F09A54]/90 disabled:opacity-60"
                  >
                    {formSubmitting ? "Saving…" : "Submit"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filterBtn("all", "All")}
        {filterBtn("test", "Test")}
        {filterBtn("real", "Real")}
        {filterBtn("influencers", "Influencers")}
      </div>

      {filter === "influencers" ? (
        <>
          {influencersError ? (
            <div className="rounded-organic-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {influencersError}
            </div>
          ) : null}
          {influencersLoading ? (
            <p className="text-sm text-[#111827]/70">Loading influencers…</p>
          ) : (
            <div className="overflow-x-auto rounded-organic-sm border border-[#111827]/10 bg-white">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#111827]/10 bg-[#F2EEE2]/60">
                    <th className="px-3 py-2 font-semibold text-[#111827]">Name</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Email</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Pet</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Instagram</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Location</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Followers</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Credits given</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Portrait</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Date added</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.map((row) => (
                    <tr key={row.id} className="border-b border-[#111827]/5">
                      <td className="px-3 py-2 font-medium text-[#111827]">{row.influencer_name ?? "—"}</td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-[#111827]/80" title={row.email ?? ""}>
                        {row.email ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-[#111827]/80">{row.pet_name ?? "—"}</td>
                      <td className="px-3 py-2 text-[#111827]/80">{row.instagram_handle ?? "—"}</td>
                      <td className="px-3 py-2 text-[#111827]/80">{row.location ?? "—"}</td>
                      <td className="px-3 py-2 text-[#111827]/80">
                        {row.followers != null ? row.followers : "—"}
                      </td>
                      <td className="px-3 py-2 text-[#111827]/80">
                        {row.credits_given != null ? row.credits_given : "—"}
                      </td>
                      <td className="px-3 py-2 text-center text-[#111827]">
                        {row.portrait_created ? "\u2713" : "—"}
                      </td>
                      <td className="px-3 py-2 text-[#111827]/80">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {influencers.length === 0 ? (
                <p className="p-4 text-center text-sm text-[#111827]/60">No influencers yet.</p>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <div className="overflow-x-auto rounded-organic-sm border border-[#111827]/10 bg-white">
          <table className="w-full min-w-[1020px] text-left text-sm">
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
                <th className="px-3 py-2 font-semibold text-[#111827]">Test</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const landscape = row.landscape_url?.trim()
                const isTest = row.is_test === true
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
                      {row.showcase_consent === true ? "\u2713" : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant={isTest ? "secondary" : "outline"}
                        size="sm"
                        disabled={toggleBusyId === row.id}
                        onClick={() => void handleToggleTest(row)}
                      >
                        {isTest ? "Mark as real" : "Mark as test"}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="p-4 text-center text-sm text-[#111827]/60">No rows match this filter.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
