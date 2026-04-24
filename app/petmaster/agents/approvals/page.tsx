"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { GalleryImageLightbox } from "@/components/gallery-image-lightbox"
import { cn } from "@/lib/utils"

const REJECT_CATEGORIES = [
  "Image/caption mismatch",
  "Wrong pet type",
  "Off-brand copy",
  "Image quality",
  "Other",
] as const

type Tab = "content" | "playbook"

type ContentPost = {
  id: string
  image_url: string | null
  theme?: string | null
  post_type?: string | null
  platform?: string | null
  status?: string | null
  overlay_caption?: string | null
  caption_a?: string | null
  hashtags?: string | null
  full_instagram_caption?: string | null
  instagram_caption?: string | null
  full_caption?: string | null
  scheduled_for?: string | null
  goal?: string | null
  ab_variable?: string | null
}

type PlaybookProposal = {
  id: string
  proposed_rule?: string | null
  rule?: string | null
  proposed_text?: string | null
  rationale?: string | null
  confidence?: string | null
  applies_to?: string | null
  evidence_post_ids?: unknown
  status?: string | null
  created_at?: string | null
}

type ApprovalsPayload = {
  posts: ContentPost[]
  proposals: PlaybookProposal[]
}

function postTypePillClass(postType: string | null | undefined): string {
  const p = (postType ?? "").toLowerCase()
  if (p === "lifestyle") return "bg-slate-500/80 text-slate-100"
  return "bg-[#F09A54] text-[#111827]"
}

function fullIgCaption(p: ContentPost): string {
  const v =
    p.full_instagram_caption ?? p.full_caption ?? p.instagram_caption ?? p.caption_a
  if (v == null) return ""
  return String(v)
}

function formatScheduledUae(iso: string | null | undefined): string {
  if (!iso) return "—"
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return "—"
  return t.toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatEvidenceList(raw: unknown): string {
  if (raw == null) return ""
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).join(", ")
  if (typeof raw === "string") return raw
  return JSON.stringify(raw)
}

function proposedRule(p: PlaybookProposal): string {
  return String(p.proposed_rule ?? p.proposed_text ?? p.rule ?? "").trim()
}

function postLightboxAlt(post: ContentPost): string {
  const theme = post.theme?.trim() || "Post preview"
  const pl = post.platform?.trim()
  return pl ? `${theme} · ${pl}` : theme
}

export default function PetmasterAgentsApprovalsPage() {
  const [tab, setTab] = useState<Tab>("content")
  const [data, setData] = useState<ApprovalsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [editHashtags, setEditHashtags] = useState("")

  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null)
  const [rejectCategory, setRejectCategory] = useState<string>("")
  const [rejectDetails, setRejectDetails] = useState("")
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    const res = await fetch("/api/petmaster-approvals", { credentials: "same-origin" })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setError(typeof j.error === "string" ? j.error : `HTTP ${res.status}`)
      setData({ posts: [], proposals: [] })
    } else {
      setData((await res.json()) as ApprovalsPayload)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const posts = data?.posts ?? []
  const proposals = data?.proposals ?? []

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

  async function onApprovePost(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-approve-post", { id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed")
    } finally {
      setBusyId(null)
    }
  }

  function openRejectModal(postId: string) {
    setEditingId(null)
    setRejectingPostId(postId)
    setRejectCategory("")
    setRejectDetails("")
    setError(null)
  }

  function closeRejectModal() {
    setRejectingPostId(null)
    setRejectCategory("")
    setRejectDetails("")
  }

  async function onConfirmRejectPost(id: string) {
    if (!rejectCategory.trim()) return
    setBusyId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-reject-post", {
        id,
        rejection_category: rejectCategory,
        rejection_reason: rejectDetails.trim() || null,
      })
      closeRejectModal()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed")
    } finally {
      setBusyId(null)
    }
  }

  async function onSaveEdit(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-edit-post", {
        id,
        caption_a: editCaption,
        hashtags: editHashtags,
      })
      setEditingId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusyId(null)
    }
  }

  async function onApproveProposal(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-approve-proposal", { id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed")
    } finally {
      setBusyId(null)
    }
  }

  async function onRejectProposal(id: string) {
    setBusyId(id)
    setError(null)
    try {
      await patchJson("/api/petmaster-reject-proposal", { id })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="-m-6 space-y-6 bg-[#111827] p-6 text-[#F2EEE2] md:-m-8 md:p-8" data-page="petmaster-approvals">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#F2EEE2]">Approvals</h1>
      <p className="text-sm text-[#F2EEE2]/60">Review agent output before it goes live.</p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Tab bar — pills + orange active underline */}
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-[#1F2937]/80 p-1">
        {(
          [
            { id: "content" as const, label: "Content" },
            { id: "playbook" as const, label: "Playbook Proposals" },
            { id: "ads" as const, label: "Ad Drafts (coming soon)", disabled: true },
          ] as const
        ).map((t) => {
          if ("disabled" in t && t.disabled) {
            return (
              <span
                key={t.id}
                className="cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium text-[#F2EEE2]/40"
                aria-disabled
              >
                {t.label}
              </span>
            )
          }
          const id = t.id
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
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

      {!loading && tab === "content" && (
        <section>
          <p className="mb-4 text-sm text-[#F2EEE2]/80">
            {posts.length}{" "}
            {posts.length === 1 ? "post" : "posts"} awaiting review
          </p>
          {posts.length === 0 ? (
            <div className="animate-pulse rounded-xl border-2 border-dashed border-white/10 bg-[#1F2937]/30 px-6 py-10 text-center">
              <p className="text-[#F2EEE2]/70">
                No posts awaiting review. The Creative agent is working.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => {
                const isBusy = busyId === post.id
                const isEditing = editingId === post.id
                const isRejecting = rejectingPostId === post.id
                return (
                  <li
                    key={post.id}
                    className="overflow-hidden rounded-xl border border-white/5 bg-[#1F2937]"
                  >
                    <div className="flex flex-col gap-4 p-4 md:flex-row">
                    <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-lg border border-white/10 md:h-[200px] md:w-[200px]">
                      {post.image_url ? (
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({ src: post.image_url as string, alt: postLightboxAlt(post) })
                          }
                          className="group relative block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F09A54] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2937]"
                          aria-label="View full image"
                        >
                          <Image
                            src={post.image_url}
                            alt={postLightboxAlt(post)}
                            width={200}
                            height={200}
                            unoptimized
                            className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                          />
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-600/80 text-sm text-slate-300">
                          Generating…
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-semibold",
                            "bg-[#F09A54] text-[#111827]",
                          )}
                        >
                          {post.theme?.trim() || "Theme"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
                            postTypePillClass(post.post_type),
                          )}
                        >
                          {post.post_type || "portrait"}
                        </span>
                        <span className="inline-flex rounded-sm bg-slate-600/60 px-1.5 py-0.5 text-[11px] font-medium text-slate-100">
                          {post.platform || "—"}
                        </span>
                        {post.goal && (
                          <span className="inline-flex rounded-sm border border-white/20 px-1.5 py-0.5 text-[11px] text-[#F2EEE2]/80">
                            {String(post.goal).toLowerCase()}
                          </span>
                        )}
                        {post.ab_variable && String(post.ab_variable).trim() && (
                          <span className="inline-flex rounded-sm bg-amber-500/25 px-1.5 py-0.5 text-[11px] font-medium text-amber-100">
                            A/B: {String(post.ab_variable)}
                          </span>
                        )}
                      </div>
                      {post.overlay_caption && (
                        <p className="mt-3 text-lg font-medium leading-snug text-[#F2EEE2]">
                          {post.overlay_caption}
                        </p>
                      )}
                      {fullIgCaption(post) && (
                        <p className="mt-2 text-sm leading-relaxed text-[#F2EEE2]/90">{fullIgCaption(post)}</p>
                      )}
                      {post.hashtags && (
                        <p className="mt-2 text-xs text-[#F2EEE2]/50">{String(post.hashtags)}</p>
                      )}
                      <p className="mt-2 text-sm text-[#F2EEE2]/70">
                        Scheduled (UAE): {formatScheduledUae(post.scheduled_for)}
                      </p>
                      {isEditing ? (
                        <div className="mt-4 space-y-2">
                          <label className="block text-xs font-medium text-[#F2EEE2]/60">caption_a</label>
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="min-h-[100px] w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-[#F2EEE2] outline-none focus:ring-1 focus:ring-[#F09A54]"
                            disabled={isBusy}
                          />
                          <label className="block text-xs font-medium text-[#F2EEE2]/60">hashtags</label>
                          <textarea
                            value={editHashtags}
                            onChange={(e) => setEditHashtags(e.target.value)}
                            className="min-h-[64px] w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-[#F2EEE2] outline-none focus:ring-1 focus:ring-[#F09A54]"
                            disabled={isBusy}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onSaveEdit(post.id)}
                              disabled={isBusy}
                              className="rounded-md bg-[#22c55e] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null)
                              }}
                              disabled={isBusy}
                              className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-[#F2EEE2]/80"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onApprovePost(post.id)}
                            disabled={isBusy}
                            className="rounded-md bg-[#22c55e] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(post.id)}
                            disabled={isBusy}
                            className="rounded-md bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingPostId(null)
                              setEditingId(post.id)
                              setEditCaption(String(post.caption_a ?? ""))
                              setEditHashtags(String(post.hashtags ?? ""))
                            }}
                            disabled={isBusy}
                            className="rounded-md border border-[#F2EEE2]/30 bg-transparent px-3 py-2 text-sm font-medium text-[#F2EEE2]/80 hover:text-[#F2EEE2] disabled:opacity-50"
                          >
                            Edit Brief
                          </button>
                        </div>
                      )}
                    </div>
                    </div>
                    {isRejecting && !isEditing && (
                      <div className="border-t border-white/10 bg-[#1a1f2e] px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#F2EEE2]/50">
                          Reject reason
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {REJECT_CATEGORIES.map((label) => {
                            const active = rejectCategory === label
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => {
                                  setRejectCategory(label)
                                }}
                                className={cn(
                                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                                  active
                                    ? "border-[#F09A54] bg-[#F09A54]/15 text-[#F09A54]"
                                    : "border-white/20 text-[#F2EEE2]/80 hover:border-white/30",
                                )}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                        {rejectCategory ? (
                          <label className="mt-3 block text-xs text-[#F2EEE2]/50">
                            Add details (optional)
                            <textarea
                              value={rejectDetails}
                              onChange={(e) => setRejectDetails(e.target.value.slice(0, 200))}
                              maxLength={200}
                              rows={2}
                              placeholder="Add details (optional)"
                              className="mt-1 w-full max-w-lg rounded-md border border-white/15 bg-[#111827] px-2 py-1.5 text-sm text-[#F2EEE2] placeholder:text-[#F2EEE2]/35"
                            />
                            <span className="mt-0.5 block text-[11px] text-[#F2EEE2]/40">
                              {rejectDetails.length}/200
                            </span>
                          </label>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onConfirmRejectPost(post.id)}
                            disabled={isBusy || !rejectCategory}
                            className="rounded-md bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "…" : "Confirm Reject"}
                          </button>
                          <button
                            type="button"
                            onClick={closeRejectModal}
                            disabled={isBusy}
                            className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-[#F2EEE2]/80 hover:bg-white/10 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {!loading && tab === "playbook" && (
        <section>
          {proposals.length === 0 ? (
            <p className="text-sm text-[#F2EEE2]/55">
              No playbook proposals pending. Analytics agent hasn&apos;t found patterns yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {proposals.map((p) => {
                const isBusy = busyId === p.id
                const conf = (p.confidence ?? "").toLowerCase()
                return (
                  <li key={p.id} className="rounded-xl border border-white/5 bg-[#1F2937] p-4">
                    <p className="text-base font-medium leading-relaxed text-[#F2EEE2]">{proposedRule(p) || "—"}</p>
                    {p.rationale && (
                      <p className="mt-2 text-sm leading-relaxed text-[#F2EEE2]/55">{p.rationale}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-1.5 py-0.5 font-medium",
                          conf === "high"
                            ? "bg-emerald-600/40 text-emerald-100"
                            : "bg-amber-500/30 text-amber-100",
                        )}
                      >
                        {p.confidence ?? "—"} confidence
                      </span>
                      {p.applies_to && (
                        <span className="inline-flex rounded-sm bg-slate-600/50 px-1.5 py-0.5 text-slate-100">
                          Applies to: {p.applies_to}
                        </span>
                      )}
                    </div>
                    {formatEvidenceList(p.evidence_post_ids) && (
                      <p className="mt-2 text-xs text-[#F2EEE2]/40">
                        Evidence: {formatEvidenceList(p.evidence_post_ids)}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onApproveProposal(p.id)}
                        disabled={isBusy}
                        className="rounded-md bg-[#22c55e] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectProposal(p.id)}
                        disabled={isBusy}
                        className="rounded-md bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      <section aria-label="Ad drafts (upcoming)">
        <div className="mt-2 rounded-xl border border-dashed border-white/10 bg-[#1F2937]/30 p-4 text-sm text-[#F2EEE2]/50">
          <span className="text-[#F2EEE2]/40">Ad Drafts (coming soon)</span> — Ad agent coming in Phase 2. Ad
          drafts will appear here for review before activation in Meta Ads Manager.
        </div>
      </section>

      <GalleryImageLightbox
        open={!!lightbox}
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />
    </div>
  )
}
