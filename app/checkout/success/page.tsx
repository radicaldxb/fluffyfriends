"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, Check, Mail, Palette, Ruler, Frame, Paperclip, Send, Inbox, Download } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { PRINT_GUIDE_PDF_HREF } from "@/lib/print-guide"
import { trackGa4Purchase } from "@/lib/ga4"
import { purchase } from "@/lib/fpixel"

export const dynamic = "force-dynamic"

type PreviewState =
  | { status: "idle" }
  | { status: "loading"; attempt?: number }
  | {
      status: "ready"
      portraitId: string
      petName: string
      theme: string | null
      amountDisplay: string
      currency: string
      amountCents: number
    }
  | { status: "error"; message: string }

type ApproveStatus = "idle" | "submitting" | "success" | "error"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")?.trim() || ""
  const portraitFromQuery = searchParams.get("portrait")?.trim() || ""
  const emailFromQuery = searchParams.get("email")?.trim() || ""

  const [preview, setPreview] = useState<PreviewState>({ status: "idle" })
  const [approveStatus, setApproveStatus] = useState<ApproveStatus>("idle")
  const [approveError, setApproveError] = useState<string>("")
  const [email, setEmail] = useState(emailFromQuery)
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [stateRegion, setStateRegion] = useState("")
  const [newsletterConsent, setNewsletterConsent] = useState(true)
  const [downloadLinks, setDownloadLinks] = useState<{
    landscapeUrl: string
    portraitUrl: string
  } | null>(null)
  const [portraitsRemaining, setPortraitsRemaining] = useState<number | null>(null)
  const [userDetailsKnown, setUserDetailsKnown] = useState(false)
  const [loaderStep, setLoaderStep] = useState(0)
  const [wf3Status, setWf3Status] = useState<"idle" | "waiting" | "ready">("idle")
  const [galleryShowcaseConsent, setGalleryShowcaseConsent] = useState(false)
  const purchaseTracked = useRef(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const LOADER_STEPS = [
    { icon: Palette, text: "Preparing your portrait files…" },
    { icon: Ruler, text: "Sizing up your wide format print…" },
    { icon: Frame, text: "Sizing up your portrait format print…" },
    { icon: Mail, text: "Addressing your email…" },
    { icon: Paperclip, text: "Attaching both print files…" },
    { icon: Send, text: "Sending your email now…" },
    { icon: Inbox, text: "Email on its way! Check spam just in case…" },
    { icon: Download, text: "Preparing your download page…" },
  ]

  useEffect(() => {
    if (purchaseTracked.current) return
    if (preview.status !== "ready") return

    window.dataLayer = window.dataLayer || []

    if (preview.amountCents > 0) {
      purchaseTracked.current = true
      const value = preview.amountCents / 100
      const currency = (preview.currency || "USD").toUpperCase()
      purchase(value, currency)

      const transactionId = sessionId.trim() || `portrait_${preview.portraitId}`
      trackGa4Purchase({
        transaction_id: transactionId,
        value,
        currency,
        items: [
          {
            item_id: preview.portraitId,
            item_name: `AI pet portrait — ${preview.petName}`,
            item_category: "pet_portrait",
            ...(preview.theme ? { item_variant: preview.theme } : {}),
            price: value,
            quantity: 1,
          },
        ],
      })
      window.dataLayer.push({
        event: "purchase",
        transaction_id: transactionId,
        value,
        currency,
      })
    } else {
      purchaseTracked.current = true
      window.dataLayer.push({ event: "purchase" })
    }
  }, [preview, sessionId])

  useEffect(() => {
    if (!sessionId && !portraitFromQuery) {
      setPreview({
        status: "error",
        message: "Missing payment session. Please return to checkout and try again.",
      })
      return
    }

    let cancelled = false
    const maxAttempts = 40
    const intervalMs = 3000

    async function loadPreview(attempt: number) {
      const url = sessionId
        ? `/api/approve-portrait?session_id=${encodeURIComponent(sessionId)}`
        : `/api/approve-portrait?portrait_id=${encodeURIComponent(portraitFromQuery)}`

      setPreview({ status: "loading", attempt })
      try {
        const res = await fetch(url)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            data.error ||
            (data.details ? `${data.error || "Error"}: ${data.details}` : null) ||
            "We couldn't load your portrait preview yet. Please refresh in a moment."
          if (!cancelled) {
            const isStillGenerating = res.status === 202
            const isNotFound = res.status === 404
            const shouldRetry = isStillGenerating && attempt < maxAttempts - 1
            if (!isNotFound && (shouldRetry || attempt < maxAttempts - 1)) {
              setTimeout(() => loadPreview(attempt + 1), intervalMs)
            } else {
              setPreview({ status: "error", message: msg })
            }
          }
          return
        }

        const portraitId = data.portrait_id
        if (!portraitId || typeof portraitId !== "string") {
          if (!cancelled && attempt < maxAttempts - 1) {
            setTimeout(() => loadPreview(attempt + 1), intervalMs)
          } else if (!cancelled) {
            setPreview({
              status: "error",
              message: "Portrait not ready yet. Please refresh in a minute.",
            })
          }
          return
        }

        const cents = typeof data.amount_cents === "number" ? data.amount_cents : 0
        const amountDisplay = cents > 0 ? `$${(cents / 100).toFixed(2)}` : "–"
        const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : (sessionId ? "USD" : "")
        const theme =
          typeof data.theme === "string" && data.theme.trim() ? data.theme.trim() : null

        if (!cancelled) {
          setPreview({
            status: "ready",
            portraitId,
            petName: data.pet_name || "Your pet",
            theme,
            amountDisplay,
            currency,
            amountCents: cents,
          })
          if (data.customer_email && !email) {
            setEmail(data.customer_email)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setPreview({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "We couldn't load your portrait preview. Please try again.",
          })
        }
      }
    }

    loadPreview(0)

    return () => {
      cancelled = true
    }
  }, [sessionId, portraitFromQuery])

  useEffect(() => {
    if (!emailFromQuery || sessionId) return

    supabase
      .from("users")
      .select("full_name, city, country, state")
      .eq("email", emailFromQuery)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name && data?.city && data?.country) {
          setFullName(data.full_name || "")
          setCity(data.city || "")
          setCountry(data.country || "")
          setStateRegion(data.state || "")
          setUserDetailsKnown(true)
        }
      })
  }, [emailFromQuery, sessionId])

  useEffect(() => {
    if (approveStatus !== "submitting") return
    setLoaderStep(0)
    const maxStep = LOADER_STEPS.length - 1
    const interval = setInterval(() => {
      setLoaderStep((prev) => Math.min(prev + 1, maxStep))
    }, 6000)
    return () => clearInterval(interval)
  }, [approveStatus])

  useEffect(() => {
    if (
      (approveStatus === "submitting" || wf3Status === "waiting") &&
      loaderRef.current
    ) {
      loaderRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [approveStatus, wf3Status])

  async function persistGalleryShowcaseConsent(checked: boolean) {
    if (preview.status !== "ready") return
    const portraitId = preview.portraitId
    const sid = sessionId.trim()
    const em = (emailFromQuery || email).trim().toLowerCase()
    if (!sid && !em) return
    try {
      await fetch("/api/portrait-showcase-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portrait_id: portraitId,
          showcase_consent: checked,
          ...(sid ? { session_id: sid } : { email: em }),
        }),
      })
    } catch {
      /* non-blocking */
    }
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault()
    if (approveStatus === "submitting" || approveStatus === "success") return
    setApproveStatus("submitting")
    setApproveError("")

    // Defer fetch so the loader UI has time to render before the request starts
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          const res = await fetch("/api/approve-portrait", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(sessionId && { session_id: sessionId }),
              ...(portraitFromQuery && !sessionId && { portrait_id: portraitFromQuery }),
              email: email.trim(),
              full_name: fullName.trim(),
              city: city.trim(),
              country: country.trim(),
              state: stateRegion.trim(),
              newsletter_consent: newsletterConsent,
            }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok || !data.ok) {
            setApproveStatus("error")
            const message =
              (typeof data.error === "string" && data.error) ||
              (data.details ? `${data.error || "Error"}: ${data.details}` : null) ||
              "We couldn't send your files yet. Please try again in a moment."
            setApproveError(message)
            return
          }
          if (data.ok) {
            setWf3Status("waiting")
            const emailNorm = email.trim().toLowerCase()
            const portraitId = preview.status === "ready" ? preview.portraitId : portraitFromQuery
            const pollStart = Date.now()
            const poll = async () => {
              if (Date.now() - pollStart > 90_000) {
                router.push(`/my-portraits?email=${encodeURIComponent(emailNorm)}`)
                return
              }
              const { data: row } = await supabase
                .from("pet_portraits")
                .select("landscape_url")
                .eq("id", portraitId)
                .single()
              if (
                row?.landscape_url &&
                typeof row.landscape_url === "string" &&
                row.landscape_url.startsWith("https://")
              ) {
                setWf3Status("ready")
                router.push(`/my-portraits?email=${encodeURIComponent(emailNorm)}`)
              } else {
                setTimeout(poll, 4000)
              }
            }
            setTimeout(poll, 4000)
            return
          }
        } catch (err) {
          setApproveStatus("error")
          setApproveError(
            err instanceof Error
              ? err.message
              : "We couldn't send your files yet. Please try again in a moment.",
          )
        }
      })
    })
  }

  const isStep2Loading =
    (preview.status === "idle" || preview.status === "loading") && approveStatus !== "success"
  const isStep3Preview = preview.status === "ready" && approveStatus !== "success"
  const canPersistGalleryConsent =
    preview.status === "ready" &&
    (sessionId.trim().length > 0 || (emailFromQuery || email).trim().length > 0)
  const isStep4Completed = approveStatus === "success"
  const isError = preview.status === "error"

  if (isStep4Completed) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="flex-1 mx-auto w-full max-w-7xl px-4 py-14 md:py-20 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-organic-sm bg-primary/20 text-primary mb-4">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Your portrait is on its way 🐾
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty max-w-md mx-auto">
              Your files are also on their way to your inbox — check your spam folder if you don’t
              see them within 5 minutes.
            </p>
            {downloadLinks && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  asChild
                  className="w-full rounded-organic-sm sm:w-auto"
                >
                  <a href={downloadLinks.landscapeUrl} target="_blank" rel="noreferrer">
                    Download Wide Format →
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-organic-sm sm:w-auto"
                >
                  <a href={downloadLinks.portraitUrl} target="_blank" rel="noreferrer">
                    Download Portrait Format →
                  </a>
                </Button>
              </div>
            )}
            {!downloadLinks && (
              <p className="mt-6 text-sm text-muted-foreground max-w-md mx-auto">
                Download links will appear here when ready. If they don't show after a few minutes, contact us and we'll send you the files.
              </p>
            )}
            {/* Loyalty reward section */}
            <div className="mt-10 rounded-organic border border-primary/30 bg-primary/5 px-5 py-6 text-left">
              <h3 className="text-base font-bold text-foreground">
                🎁 Your loyalty reward
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this code on your next order for 15% off:
              </p>
              <div className="mt-3 inline-flex items-center justify-center rounded-organic-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold tracking-wide">
                WELCOME15
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Share it with a friend too — valid on any FluffyFriends portrait package.
              </p>
            </div>
            {typeof portraitsRemaining === "number" && portraitsRemaining > 0 && (
              <div className="mt-8 rounded-organic border border-primary/30 bg-primary/5 p-5 text-center">
                <p className="text-sm font-medium text-foreground">
                  🐾 You have {portraitsRemaining} portrait
                  {portraitsRemaining !== 1 ? "s" : ""} remaining in your pack
                </p>
                <Button className="mt-3 rounded-organic-sm" asChild>
                  <Link href={`/create?email=${encodeURIComponent(email)}`}>
                    Create your next portrait →
                  </Link>
                </Button>
              </div>
            )}
            {typeof portraitsRemaining === "number" && portraitsRemaining === 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You've used all your portraits.
                </p>
                <Button variant="outline" className="mt-2 rounded-organic-sm" asChild>
                  <Link href="/#pricing">Get more portraits →</Link>
                </Button>
              </div>
            )}
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to home
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Not happy with your portrait? We'd love to make it right.{" "}
                <a
                  href="mailto:hello@fluffyfriends.online"
                  className="underline hover:text-foreground"
                >
                  Get in touch
                </a>
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (isStep3Preview) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="mx-auto w-full max-w-7xl px-4 py-10 md:py-16 sm:px-6">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-1">
              Step 3 · Preview & details
            </p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Does this look like {preview.petName}?
            </h2>

            <div className="mt-4 rounded-organic border border-border bg-card p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-organic-sm bg-muted">
                <Image
                  src={`/api/portrait-preview?id=${encodeURIComponent(preview.portraitId)}`}
                  alt={`${preview.petName}'s portrait`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              {sessionId ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Order total:{" "}
                  <strong>{preview.amountDisplay} {preview.currency}</strong>
                  . You’ll receive wide and portrait print‑ready files plus a{" "}
                  <a
                    href={PRINT_GUIDE_PDF_HREF}
                    className="text-primary underline hover:no-underline"
                  >
                    print guide
                  </a>
                  .
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Using 1 of your portrait pack credits. You’ll receive wide and portrait print‑ready files plus a{" "}
                  <a
                    href={PRINT_GUIDE_PDF_HREF}
                    className="text-primary underline hover:no-underline"
                  >
                    print guide
                  </a>
                  .
                </p>
              )}

              <label
                className={cn(
                  "mt-5 flex items-start gap-3 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3 text-left",
                  canPersistGalleryConsent ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                )}
              >
                <Checkbox
                  checked={galleryShowcaseConsent}
                  disabled={!canPersistGalleryConsent}
                  onCheckedChange={(c) => {
                    const next = c === true
                    setGalleryShowcaseConsent(next)
                    void persistGalleryShowcaseConsent(next)
                  }}
                  className="mt-0.5 rounded-organic-sm"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  I&apos;d love to be featured in the FluffyFriends gallery 🐾{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </span>
              </label>

              {!sessionId && userDetailsKnown ? (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    We'll send your print-ready files to <strong>{email}</strong>
                  </p>
                  {approveError && (
                    <p className="text-sm text-destructive">{approveError}</p>
                  )}
                  {approveStatus === "submitting" || wf3Status === "waiting" ? (
                    <div
                      ref={loaderRef}
                      className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm mx-auto"
                    >
                      <div className="w-full rounded-organic bg-muted/40 border border-border p-6 text-center">
                        <div className="flex justify-center mb-3 text-primary transition-all duration-500">
                          {(() => {
                            const StepIcon = LOADER_STEPS[loaderStep].icon
                            return <StepIcon className="h-10 w-10" aria-hidden />
                          })()}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {LOADER_STEPS[loaderStep].text}
                        </p>
                        <div className="flex justify-center gap-1.5 mt-4">
                          {LOADER_STEPS.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                i <= loaderStep
                                  ? "w-4 bg-primary"
                                  : "w-1.5 bg-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Please don&apos;t close this tab — we&apos;re getting everything ready for you.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => handleSubmitDetails(e as React.FormEvent)}
                      disabled={
                        approveStatus === ("submitting" as ApproveStatus) ||
                        wf3Status === ("waiting" as typeof wf3Status)
                      }
                      className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 h-auto"
                    >
                      Email my portraits →
                    </Button>
                  )}
                </div>
              ) : (
              <form onSubmit={handleSubmitDetails} className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="success-email"
                      className="block text-sm text-muted-foreground mb-1"
                    >
                      Email address *
                    </label>
                    <input
                      id="success-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="you@example.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is how you'll access your portraits — no account needed.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="success-full-name"
                      className="block text-sm text-muted-foreground mb-1"
                    >
                      Full name *
                    </label>
                    <input
                      id="success-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="What should we put on your order?"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="success-country"
                      className="block text-sm text-muted-foreground mb-1"
                    >
                      Country *
                    </label>
                    <select
                      id="success-country"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <option value="">Select your country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="success-city"
                      className="block text-sm text-muted-foreground mb-1"
                    >
                      City *
                    </label>
                    <input
                      id="success-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Where should we imagine this hanging?"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                    />
                    Send me updates about new themes and offers
                  </label>
                </div>

                {approveError && (
                  <div className="flex flex-col gap-2 rounded-organic-sm border border-destructive/40 bg-destructive/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-[2px] h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-sm text-destructive">{approveError}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      You can still{" "}
                      <Link
                        href={`/my-portraits?email=${encodeURIComponent(email)}`}
                        className="underline hover:text-foreground"
                      >
                        open My Portraits
                      </Link>{" "}
                      with your email to see if your files appear.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {approveStatus === "submitting" || wf3Status === "waiting" ? (
                    <div
                      ref={loaderRef}
                      className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm mx-auto"
                    >
                      <div className="w-full rounded-organic bg-muted/40 border border-border p-6 text-center">
                        <div className="flex justify-center mb-3 text-primary transition-all duration-500">
                          {(() => {
                            const StepIcon = LOADER_STEPS[loaderStep].icon
                            return <StepIcon className="h-10 w-10" aria-hidden />
                          })()}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {LOADER_STEPS[loaderStep].text}
                        </p>
                        <div className="flex justify-center gap-1.5 mt-4">
                          {LOADER_STEPS.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                i <= loaderStep
                                  ? "w-4 bg-primary"
                                  : "w-1.5 bg-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Please don&apos;t close this tab — we&apos;re getting everything ready for you.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={
                          approveStatus === ("submitting" as ApproveStatus) ||
                          wf3Status === ("waiting" as typeof wf3Status)
                        }
                        className="w-full rounded-organic-sm"
                      >
                        Email my portraits →
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Your files will also appear on this page immediately after submitting.
                      </p>
                    </>
                  )}
                </div>
              </form>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button variant="outline" className="rounded-organic-sm" asChild>
                <Link href="/create">Create another portrait</Link>
              </Button>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // Default: Step 2 — payment received + loader or error
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto w-full max-w-7xl px-4 py-14 md:py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-organic-sm bg-primary/20 text-primary mb-4">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {sessionId ? "Payment received" : "Portrait started!"}
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            {sessionId
              ? "Thank you for your order. We're preparing your portrait preview."
              : "We're using 1 portrait from your pack. Our studio is rendering your artwork — this usually takes a minute or two."}
          </p>

          {isStep2Loading && (
            <>
              <div className="mt-10 flex justify-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-organic-pill border-2 border-primary/40 bg-primary/5">
                  <video
                    src="/video/FF-Loader.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover scale-[1.05]"
                  />
                </div>
              </div>
              {preview.status === "loading" &&
                typeof (preview as { attempt?: number }).attempt === "number" &&
                (preview as { attempt: number }).attempt >= 10 && (
                  <p className="mt-3 text-xs text-muted-foreground max-w-md mx-auto">
                    Taking longer than usual? Try refreshing the page in a minute — your portrait may
                    already be ready.
                  </p>
                )}
            </>
          )}

          {isError && (
            <div className="mt-8 flex items-start justify-center gap-2 rounded-organic-sm border border-destructive/40 bg-destructive/5 p-4 text-left max-w-md mx-auto">
              <AlertCircle className="mt-[2px] h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{preview.message}</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <section className="mx-auto max-w-7xl flex-1 px-4 py-14 sm:px-6 text-center">
            <p className="text-muted-foreground">Loading…</p>
          </section>
          <Footer />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
