"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OutreachRow = {
  id: string
  instagram_handle: string
  influencer_name: string
  pet_name: string
  followers: number | null
  post_reference: string | null
  observation: string | null
  notes?: string | null
  dm_sent_at: string
  created_at: string
  accepted: boolean
  accepted_at: string | null
}

function thankYouDm(name: string, pet: string): string {
  const wave = String.fromCodePoint(0x1f44b)
  const paw = String.fromCodePoint(0x1f43e)
  return `Hey ${name} ${wave}

Just wanted to say a genuine thank you for giving FluffyFriends a try. I really hope you and ${pet} love the portrait.

If you ever have any questions or need anything at all, just reply here and I'll sort it out for you personally.

And honestly — thank you for helping out a fellow pawparent trying to grow something he believes in. It means more than you know. ${paw}

Stephan`
}

export default function PetmasterDmPage() {
  const [tab, setTab] = useState("initial")

  const [handle, setHandle] = useState("")
  const [theirName, setTheirName] = useState("")
  const [petName, setPetName] = useState("")
  const [followers, setFollowers] = useState("")
  const [postUrl, setPostUrl] = useState("")
  const [observation, setObservation] = useState("")

  const [tyName, setTyName] = useState("")
  const [tyPet, setTyPet] = useState("")

  const [dmInitial, setDmInitial] = useState<string | null>(null)
  const [dmThankYou, setDmThankYou] = useState<string | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const [outreach, setOutreach] = useState<OutreachRow[]>([])
  const [outreachLoading, setOutreachLoading] = useState(true)
  const [acceptBusy, setAcceptBusy] = useState<string | null>(null)

  const loadOutreach = useCallback(async () => {
    setOutreachLoading(true)
    try {
      const res = await fetch("/api/petmaster-outreach-list", { credentials: "same-origin" })
      if (!res.ok) return
      const data = (await res.json()) as unknown
      setOutreach(Array.isArray(data) ? (data as OutreachRow[]) : [])
    } finally {
      setOutreachLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOutreach()
  }, [loadOutreach])

  const stats = useMemo(() => {
    const total = outreach.length
    const accepted = outreach.filter((r) => r.accepted).length
    const conversion = total ? Math.round((accepted / total) * 1000) / 10 : 0
    const nums = outreach.map((r) => r.followers).filter((n): n is number => typeof n === "number" && !Number.isNaN(n))
    const avg =
      nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0
    return { total, accepted, conversion, avg }
  }, [outreach])

  async function generateInitial() {
    setGenError(null)
    setDmInitial(null)
    setGenLoading(true)
    const f = followers.trim() === "" ? 0 : Number(followers)
    const followersNum = Number.isNaN(f) ? 0 : f
    try {
      const res = await fetch("/api/petmaster-dm", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "initial",
          handle: handle.trim(),
          name: theirName.trim(),
          pet: petName.trim(),
          followers: followersNum,
          post_url: postUrl.trim() || undefined,
          observation: observation.trim(),
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGenError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
        return
      }
      const dm = typeof j.dm === "string" ? j.dm : ""
      setDmInitial(dm)

      const sentAt = new Date().toISOString()
      void fetch("/api/petmaster-outreach-save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram_handle: handle.trim(),
          influencer_name: theirName.trim(),
          pet_name: petName.trim(),
          followers: followersNum || null,
          post_reference: postUrl.trim() || null,
          observation: observation.trim(),
          dm_sent_at: sentAt,
        }),
      })
        .then(() => loadOutreach())
        .catch(() => {})
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Failed")
    } finally {
      setGenLoading(false)
    }
  }

  function generateThankYou() {
    setGenError(null)
    const n = tyName.trim()
    const p = tyPet.trim()
    if (!n || !p) {
      setGenError("Name and pet are required.")
      return
    }
    setDmThankYou(thankYouDm(n, p))
  }

  async function markAccepted(id: string) {
    setAcceptBusy(id)
    try {
      const res = await fetch("/api/petmaster-outreach-accept", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setOutreach((prev) =>
          prev.map((r) => (r.id === id ? { ...r, accepted: true, accepted_at: new Date().toISOString() } : r)),
        )
      }
    } finally {
      setAcceptBusy(null)
    }
  }

  const inputClass =
    "mt-1 w-full rounded-organic-sm border border-[#111827]/20 bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#111827]/40 focus:border-[#F09A54] focus:outline-none focus:ring-2 focus:ring-[#F09A54]/20"

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#111827]">
        DM Generator
      </h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 bg-[#F2EEE2]/80">
          <TabsTrigger value="initial" className="rounded-organic-sm">
            Initial outreach
          </TabsTrigger>
          <TabsTrigger value="thankyou" className="rounded-organic-sm">
            Thank you
          </TabsTrigger>
        </TabsList>

        <TabsContent value="initial" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Instagram handle</label>
              <input
                className={inputClass}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@sarahlovesdogs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Their name</label>
              <input className={inputClass} value={theirName} onChange={(e) => setTheirName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Pet&apos;s name</label>
              <input className={inputClass} value={petName} onChange={(e) => setPetName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Followers</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#111827]/80">Post reference URL (optional)</label>
              <input className={inputClass} value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#111827]/80">Genuine observation</label>
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Be specific. This is what makes it not feel like a template."
              />
            </div>
          </div>
          <button
            type="button"
            disabled={genLoading}
            onClick={generateInitial}
            className="rounded-organic-sm bg-[#F09A54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F09A54]/90 disabled:opacity-50"
          >
            {genLoading ? "Generating…" : "Generate"}
          </button>
        </TabsContent>

        <TabsContent value="thankyou" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Their name</label>
              <input className={inputClass} value={tyName} onChange={(e) => setTyName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#111827]/80">Pet&apos;s name</label>
              <input className={inputClass} value={tyPet} onChange={(e) => setTyPet(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={generateThankYou}
            className="rounded-organic-sm bg-[#F09A54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F09A54]/90"
          >
            Generate
          </button>
        </TabsContent>
      </Tabs>

      {genError ? (
        <p className="text-sm text-red-600" role="alert">
          {genError}
        </p>
      ) : null}

      {tab === "initial" && dmInitial ? (
        <div className="rounded-organic-sm border border-[#111827]/15 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#111827]/60">Generated DM</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#111827]">{dmInitial}</pre>
        </div>
      ) : null}

      {tab === "thankyou" && dmThankYou ? (
        <div className="rounded-organic-sm border border-[#111827]/15 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#111827]/60">Thank you message</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#111827]">
            {dmThankYou}
          </pre>
        </div>
      ) : null}

      <div className="border-t border-[#111827]/15 pt-10">
        <h2 className="font-heading text-lg font-bold text-[#111827]">Outreach tracker</h2>
        {outreachLoading ? (
          <p className="mt-4 text-sm text-[#111827]/60">Loading…</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-[#111827]/80">
              {stats.total} contacted — {stats.accepted} accepted ({stats.conversion}% conversion) — avg
              followers: {stats.avg.toLocaleString()}
            </p>
            <div className="mt-4 overflow-x-auto rounded-organic-sm border border-[#111827]/10 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#111827]/10 bg-[#F2EEE2]/60">
                    <th className="px-3 py-2 font-semibold text-[#111827]">Handle</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Name</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Pet</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Followers</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Date sent</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Accepted</th>
                    <th className="px-3 py-2 font-semibold text-[#111827]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {outreach.map((row) => (
                    <tr key={row.id} className="border-b border-[#111827]/5">
                      <td className="px-3 py-2 text-[#111827]">{row.instagram_handle}</td>
                      <td className="px-3 py-2 text-[#111827]">{row.influencer_name}</td>
                      <td className="px-3 py-2 text-[#111827]">{row.pet_name}</td>
                      <td className="px-3 py-2 tabular-nums text-[#111827]">
                        {row.followers != null ? row.followers.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2 text-[#111827]/80">
                        {row.dm_sent_at
                          ? new Date(row.dm_sent_at).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {row.accepted ? (
                          <span className="text-sm font-medium text-green-700">{"✓"} Accepted</span>
                        ) : (
                          <button
                            type="button"
                            disabled={acceptBusy === row.id}
                            onClick={() => markAccepted(row.id)}
                            className="rounded-organic-sm border border-[#111827]/20 bg-white px-2 py-1 text-xs font-medium text-[#111827] hover:bg-[#F2EEE2] disabled:opacity-50"
                          >
                            {acceptBusy === row.id ? "…" : "Mark accepted"}
                          </button>
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-[#111827]/70" title={row.notes ?? row.observation ?? ""}>
                        {row.notes ?? row.observation ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {outreach.length === 0 ? (
                <p className="p-4 text-center text-sm text-[#111827]/60">No outreach rows yet.</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
