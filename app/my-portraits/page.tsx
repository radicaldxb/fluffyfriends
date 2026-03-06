 "use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

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

  useEffect(() => {
    if (!emailFromQuery) return
    // Auto-search if email is present in query string
    void handleLookup(emailFromQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromQuery])

  async function handleLookup(submittedEmail?: string) {
    const targetEmail = (submittedEmail ?? email).trim().toLowerCase()
    if (!targetEmail) {
      setError("Please enter the email you used when you ordered.")
      return
    }

    setLoading(true)
    setError("")
    setHasSearched(true)

    try {
      // Fetch purchases
      const { data: purchaseRows, error: purchaseError } = await supabase
        .from("portrait_purchases")
        .select("id, package, portraits_total, portraits_used, portraits_remaining, created_at")
        .eq("email", targetEmail)
        .order("created_at", { ascending: false })

      if (purchaseError) {
        setError(purchaseError.message)
      } else {
        setPurchases(purchaseRows || [])
        const remaining =
          purchaseRows?.reduce(
            (sum, row) => sum + (row.portraits_remaining as number),
            0,
          ) || 0
        setTotalRemaining(remaining)
      }

      // Fetch completed portraits for this email (via users table link)
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("email", targetEmail)
        .maybeSingle()

      if (userRow?.id) {
        const { data: portraitRows, error: portraitError } = await supabase
          .from("pet_portraits")
          .select("id, pet_name, theme, landscape_url, portrait_url, created_at, status")
          .eq("user_id", userRow.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true })

        if (portraitError) {
          // Do not override purchase error if already set; just log silently
          console.error("[my-portraits] Failed to load portraits:", portraitError)
        } else {
          setPortraits(
            (portraitRows || []).map((p) => ({
              id: p.id as string,
              pet_name: (p.pet_name as string) || null,
              theme: (p.theme as string) || null,
              landscape_url: (p.landscape_url as string | null) ?? null,
              portrait_url: (p.portrait_url as string | null) ?? null,
              created_at: p.created_at as string,
            })),
          )
        }
      } else {
        setPortraits([])
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while looking up your portraits.",
      )
    } finally {
      setLoading(false)
    }
  }

  const hasResults =
    purchases.length > 0 || portraits.length > 0 || totalRemaining > 0

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-14 md:py-20">
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
                return (
                  <div
                    key={p.id}
                    className="rounded-organic border border-border bg-card px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        purchased {displayDate}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.portraits_total - p.portraits_remaining} of{" "}
                      {p.portraits_total} used ·{" "}
                      <span className="font-medium text-foreground">
                        {p.portraits_remaining} remaining
                      </span>
                    </p>
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
              {portraits.map((p, index) => (
                <div
                  key={p.id}
                  className="rounded-organic border border-border bg-card px-4 py-3 text-sm"
                >
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
                    {p.landscape_url && (
                      <Button
                        asChild
                        className="rounded-organic-sm px-3 py-1 text-xs"
                      >
                        <a href={p.landscape_url} target="_blank" rel="noreferrer">
                          Download wide
                        </a>
                      </Button>
                    )}
                    {p.portrait_url && (
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-organic-sm px-3 py-1 text-xs"
                      >
                        <a href={p.portrait_url} target="_blank" rel="noreferrer">
                          Download tall
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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