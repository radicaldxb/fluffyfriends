 "use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { isValidDownloadUrl, getDisplayUrl } from "@/lib/utils"

export const dynamic = "force-dynamic"

type Purchase = {
  id: string
  package: string
  portraits_total: number
  portraits_used: number
  portraits_remaining: number
  created_at: string
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

  // When any portrait has no download URLs yet, poll so we pick up the DB row update (same trigger as email).
  useEffect(() => {
    const hasPortraitsWithoutUrls =
      portraits.length > 0 &&
      portraits.some(
        (p) => !getDisplayUrl(p.landscape_url) || !getDisplayUrl(p.portrait_url),
      )
    if (!hasPortraitsWithoutUrls || !currentLookupEmail) return

    const intervalMs = 4000
    const maxAttempts = 45 // ~3 minutes
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      void handleLookup(currentLookupEmail, { silent: true })
      if (attempts >= maxAttempts) clearInterval(interval)
    }, intervalMs)
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
                        purchased {displayDate}
                      </span>
                    </div>
                    {p.portraits_remaining > 0 && (
                      <div className="mt-3">
                        <Button
                          className="rounded-organic-sm"
                          size="sm"
                          asChild
                        >
                          <a href={`/create?email=${encodeURIComponent(email)}`}>
                            Create another portrait →
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
                const landscapeValid = !!landscapeUrl
                const portraitValid = !!portraitUrl
                const imageValid = isValidDownloadUrl(p.image_url)
                const originalValid = isValidDownloadUrl(p.original_image_url)
                const previewUrl =
                  landscapeUrl
                    ? landscapeUrl
                    : portraitUrl
                      ? portraitUrl
                      : imageValid
                        ? p.image_url!
                        : originalValid
                          ? p.original_image_url!
                          : null
                return (
                  <div
                    key={p.id}
                    className="rounded-organic border border-border bg-card px-4 py-3 text-sm flex gap-4 items-start"
                  >
                    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-organic-sm overflow-hidden bg-muted border border-border">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
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
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {landscapeValid && landscapeUrl && (
                          <Button
                            asChild
                            className="rounded-organic-sm px-3 py-1 text-xs"
                          >
                            <a href={landscapeUrl} target="_blank" rel="noreferrer">
                              Download wide
                            </a>
                          </Button>
                        )}
                        {portraitValid && portraitUrl && (
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-organic-sm px-3 py-1 text-xs"
                          >
                            <a href={portraitUrl} target="_blank" rel="noreferrer">
                              Download tall
                            </a>
                          </Button>
                        )}
                        {!landscapeValid && !portraitValid && (
                          <span className="text-xs text-muted-foreground">
                            Download links will appear here when ready. If they don&apos;t show after a few minutes,{" "}
                            <button
                              type="button"
                              onClick={() => void handleLookup(currentLookupEmail)}
                              className="underline hover:text-foreground font-medium"
                            >
                              check again
                            </button>
                            {" "}or{" "}
                            <a href="mailto:support@fluffyfriends.online" className="underline hover:text-foreground">
                              contact us
                            </a>
                            {" "}with the email you used and we&apos;ll send you the files.
                          </span>
                        )}
                      </div>
                    </div>
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