"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { isValidDownloadUrl, getDisplayUrl } from "@/lib/utils"
import { getDownloadUrl } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

type Purchase = {
  id: string
  package: string
  portraits_total: number
  portraits_used: number
  portraits_remaining: number
  created_at: string
  order_id?: string | null
}

type Portrait = {
  id: string
  pet_name: string | null
  theme: string | null
  image_url: string | null
  original_image_url: string | null
  landscape_url: string | null
  portrait_url: string | null
  created_at: string
  order_reference?: string | null
  status?: string | null
}

/** Show only last 7 characters of order ID/reference (e.g. Stripe session ID). */
function orderDisplay(idOrRef: string | null | undefined): string {
  if (idOrRef == null || typeof idOrRef !== "string") return "—"
  const s = idOrRef.trim()
  return s.length <= 7 ? s.toUpperCase() : s.slice(-7).toUpperCase()
}

function MyPortraitsFallback() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="py-10 md:py-14 flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function MyPortraitsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() || ""

  const [email, setEmail] = useState(emailFromQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [portraits, setPortraits] = useState<Portrait[]>([])
  const [totalRemaining, setTotalRemaining] = useState<number>(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentLookupEmail, setCurrentLookupEmail] = useState<string>("")
  const [isPollingForLinks, setIsPollingForLinks] = useState(false)
  const [pollingTimedOut, setPollingTimedOut] = useState(false)

  const hasPendingLinks = (list: Portrait[]) =>
    list.some(
      (p) =>
        !getDisplayUrl(p.landscape_url) || !getDisplayUrl(p.portrait_url),
    )

  useEffect(() => {
    if (!emailFromQuery) return
    // Auto-search if email is present in query string
    void handleLookup(emailFromQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromQuery])

  async function handleLookup(submittedEmail?: string, options?: { silent?: boolean }) {
    const targetEmail = (submittedEmail ?? email).trim().toLowerCase()
    if (!targetEmail) {
      if (!options?.silent) setError("Please enter the email you used when you ordered.")
      return
    }

    if (!options?.silent) {
      setLoading(true)
      setError("")
    }
    setHasSearched(true)
    setCurrentLookupEmail(targetEmail)

    try {
      const res = await fetch(
        `/api/my-portraits?email=${encodeURIComponent(targetEmail)}&t=${options?.silent ? 0 : Date.now()}`,
        { cache: "no-store" },
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (!options?.silent) setError(data.error || "Failed to load portraits.")
        return
      }

      setPurchases(data.purchases || [])
      setTotalRemaining(typeof data.totalRemaining === "number" ? data.totalRemaining : 0)
      setPortraits(data.portraits || [])
      setPollingTimedOut(false)
    } catch (err) {
      if (!options?.silent) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while looking up your portraits.",
        )
      }
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }

  // When any portrait is missing download URLs, poll every 5s until they appear (WF3 writes them asynchronously). Stop after 10 minutes.
  useEffect(() => {
    if (!portraits.length || !hasPendingLinks(portraits) || !currentLookupEmail) {
      setIsPollingForLinks(false)
      return
    }
    setIsPollingForLinks(true)
    setPollingTimedOut(false)
    let attempts = 0
    const interval = setInterval(async () => {
      attempts += 1
      if (attempts >= 120) {
        setPollingTimedOut(true)
        setIsPollingForLinks(false)
        clearInterval(interval)
        return
      }
      const res = await fetch(
        `/api/my-portraits?email=${encodeURIComponent(currentLookupEmail)}&t=${Date.now()}`,
        { cache: "no-store" },
      )
      const data = await res.json().catch(() => null)
      if (!data) return
      setPortraits(data.portraits ?? [])
      setPurchases(data.purchases ?? [])
      setTotalRemaining(typeof data.totalRemaining === "number" ? data.totalRemaining : 0)
      if (!hasPendingLinks(data.portraits ?? [])) {
        setIsPollingForLinks(false)
        clearInterval(interval)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [portraits, currentLookupEmail])

  const hasResults =
    purchases.length > 0 || portraits.length > 0 || totalRemaining > 0

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto max-w-3xl px-4 py-14 md:py-20">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          My portraits
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter the email address you used when you ordered.
        </p>

        {pollingTimedOut && (
          <div className="mb-6 rounded-organic bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-foreground">
            This is taking longer than expected. Please check back in a few minutes or contact us at hello@fluffyfriends.online
          </div>
        )}
        {isPollingForLinks && !pollingTimedOut && (
          <div className="mb-6 rounded-organic bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground flex items-center gap-2">
            <span className="text-primary">⏳</span>
            Your high-res files are being prepared — this page will update automatically.
          </div>
        )}

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault()
            void handleLookup()
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="you@example.com"
          />
          <Button
            type="submit"
            disabled={loading}
            className="rounded-organic-sm px-4 py-2 text-sm font-semibold"
          >
            {loading ? "Finding portraits…" : "Find my portraits →"}
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {hasSearched && !loading && !hasResults && !error && (
          <div className="mt-8 rounded-organic border border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              No portraits found for this email. Did you use a different address?
            </p>
            <Button
              className="mt-4 rounded-organic-sm"
              asChild
            >
              <a href="/create">Start fresh →</a>
            </Button>
          </div>
        )}

        {portraits.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Completed portraits
            </h2>
            <div className="space-y-3">
              {portraits.map((p, index) => {
                const landscapeUrl = getDisplayUrl(p.landscape_url)
                const portraitUrl = getDisplayUrl(p.portrait_url)
                const landscapeDownloadHref = getDownloadUrl(landscapeUrl)
                const portraitDownloadHref = getDownloadUrl(portraitUrl)
                const landscapeValid = !!landscapeUrl
                const portraitValid = !!portraitUrl
                const imageValid = isValidDownloadUrl(p.image_url)
                const originalValid = isValidDownloadUrl(p.original_image_url)
                const createdAt = new Date(p.created_at)
                const createdLabel = createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
                // Prefer download URLs for thumbnail if they're valid; otherwise use our proxy so Supabase/internal URLs always work
                const previewImgSrc =
                  landscapeValid && landscapeUrl
                    ? landscapeUrl
                    : portraitValid && portraitUrl
                      ? portraitUrl
                      : imageValid
                        ? p.image_url!
                        : originalValid
                          ? p.original_image_url!
                          : `/api/portrait-preview?id=${encodeURIComponent(p.id)}`
                return (
                  <div
                    key={p.id}
                    className="rounded-organic border border-border bg-card px-4 py-3 text-sm flex gap-4 items-start"
                  >
                    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-organic-sm overflow-hidden bg-muted border border-border">
                      {previewImgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewImgSrc}
                          alt={p.pet_name ? `${p.pet_name} portrait` : "Portrait preview"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground" aria-hidden>
                          <span className="text-2xl">🐾</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        ✅ Portrait {index + 1} —{" "}
                        {p.pet_name || "Your pet"}
                        {p.theme && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {p.theme}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Created {createdLabel}
                      </p>
                      {p.order_reference && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Order:{" "}
                          <span className="font-mono">{orderDisplay(p.order_reference)}</span>
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {landscapeValid && landscapeDownloadHref && (
                          <Button
                            asChild
                            className="rounded-organic-sm px-3 py-1 text-xs"
                          >
                            <a href={landscapeDownloadHref} target="_blank" rel="noreferrer">
                              Download wide
                            </a>
                          </Button>
                        )}
                        {portraitValid && portraitDownloadHref && (
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-organic-sm px-3 py-1 text-xs"
                          >
                            <a href={portraitDownloadHref} target="_blank" rel="noreferrer">
                              Download portrait
                            </a>
                          </Button>
                        )}
                        {!landscapeValid && !portraitValid && (
                          <>
                            {p.status === "upscale_failed" ? (
                              <div className="mt-3 rounded-organic bg-amber-500/10 border border-amber-500/30 p-4">
                                <p className="text-sm text-foreground">
                                  We hit a small snag processing your portrait. Our team has been notified and will deliver your files within 24 hours. No action needed.
                                </p>
                              </div>
                            ) : pollingTimedOut ? (
                              <div className="mt-3 rounded-organic bg-amber-500/10 border border-amber-500/30 p-4">
                                <p className="text-sm text-foreground">
                                  This is taking longer than expected. Please check back in a few minutes or contact us at hello@fluffyfriends.online
                                </p>
                              </div>
                            ) : isPollingForLinks ? (
                              <div className="mt-3 rounded-organic bg-muted/40 border border-border p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                      <div
                                        key={i}
                                        className="h-2 w-2 rounded-full bg-primary animate-bounce"
                                        style={{ animationDelay: `${i * 150}ms` }}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Your high-res files are being prepared — this page will update automatically.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 rounded-organic bg-muted/40 border border-border p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                      <div
                                        key={i}
                                        className="h-2 w-2 rounded-full bg-primary animate-bounce"
                                        style={{ animationDelay: `${i * 150}ms` }}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Preparing your print-ready files… check your email shortly.
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {purchases.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Your portrait packs
            </h2>
            <div className="space-y-3">
              {purchases.map((p) => {
                const purchasedDate = new Date(p.created_at)
                const displayDate = purchasedDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
                const label =
                  p.package === "portrait_pack"
                    ? "Portrait Pack"
                    : p.package === "family_pack"
                      ? "Family Pack"
                      : "Starter"
                const used = p.portraits_total - p.portraits_remaining
                return (
                  <div
                    key={p.id}
                    className="rounded-organic border border-border bg-card px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {label} — {used}/{p.portraits_total} portraits used
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Purchased {displayDate} {purchasedDate.getFullYear()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Order:{" "}
                      <span className="font-mono">{orderDisplay(p.order_id)}</span>
                    </p>
                    {p.portraits_remaining > 0 && (
                      <div className="mt-4 flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          You have{" "}
                          <span className="text-primary">
                            {p.portraits_remaining} portrait
                            {p.portraits_remaining !== 1 ? "s" : ""} remaining
                          </span>{" "}
                          in this pack.
                        </p>
                        <Button asChild className="rounded-organic-sm w-full sm:w-auto">
                          <Link href={`/create?email=${encodeURIComponent(email)}`}>
                            Create another portrait →
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}


        {totalRemaining === 0 && hasResults && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Want another portrait?</p>
            <Button asChild className="rounded-organic-sm">
              <a href="/create">Create a new portrait →</a>
            </Button>
          </div>
        )}

        {totalRemaining > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              You have{" "}
              <span className="font-medium text-foreground">
                {totalRemaining} portrait
                {totalRemaining !== 1 ? "s" : ""} remaining
              </span>{" "}
              in your pack.
            </p>
            <Button
              className="rounded-organic-sm"
              onClick={() => {
                if (!email) return
                router.push(`/create?email=${encodeURIComponent(email)}`)
              }}
            >
              Create next portrait →
            </Button>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}

export default function MyPortraitsPage() {
  return (
    <Suspense fallback={<MyPortraitsFallback />}>
      <MyPortraitsContent />
    </Suspense>
  )
}