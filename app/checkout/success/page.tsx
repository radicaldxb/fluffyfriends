"use client"

import { Suspense, useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, Check, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"

type PreviewState =
  | { status: "idle" | "loading" }
  | {
      status: "ready"
      portraitId: string
      petName: string
      amountDisplay: string
      currency: string
    }
  | { status: "error"; message: string }

type ApproveStatus = "idle" | "submitting" | "success" | "error"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")?.trim() || ""
  const portraitFromQuery = searchParams.get("portrait")?.trim() || ""

  const [preview, setPreview] = useState<PreviewState>({ status: "idle" })
  const [approveStatus, setApproveStatus] = useState<ApproveStatus>("idle")
  const [approveError, setApproveError] = useState<string>("")

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
      if (!sessionId && portraitFromQuery) {
        setPreview({
          status: "ready",
          portraitId: portraitFromQuery,
          petName: "Your pet",
          amountDisplay: "–",
          currency: "",
        })
        return
      }

      setPreview({ status: "loading" })
      try {
        const res = await fetch(`/api/approve-portrait?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            data.error ||
            (data.details ? `${data.error || "Error"}: ${data.details}` : null) ||
            "We couldn't load your portrait preview yet. Please refresh in a moment."
          if (!cancelled) {
            if (attempt < maxAttempts - 1) {
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
        const amountDisplay = `$${(cents / 100).toFixed(2)}`
        const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : "USD"

        if (!cancelled) {
          setPreview({
            status: "ready",
            portraitId,
            petName: data.pet_name || "Your pet",
            amountDisplay,
            currency,
          })
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

  async function handleApprove() {
    if (!sessionId || approveStatus === "submitting" || approveStatus === "success") return
    setApproveStatus("submitting")
    setApproveError("")

    try {
      const res = await fetch("/api/approve-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setApproveStatus("error")
        setApproveError(
          data.error || "We couldn't start the upscale yet. Please try again in a moment.",
        )
        return
      }
      setApproveStatus("success")
    } catch (err) {
      setApproveStatus("error")
      setApproveError(
        err instanceof Error
          ? err.message
          : "We couldn't start the upscale yet. Please try again in a moment.",
      )
    }
  }

  const isStep2Loading =
    (preview.status === "idle" || preview.status === "loading") && approveStatus !== "success"
  const isStep3Preview = preview.status === "ready" && approveStatus !== "success"
  const isStep4Completed = approveStatus === "success"
  const isError = preview.status === "error"

  if (isStep4Completed) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="mx-auto w-full max-w-7xl px-4 py-14 md:py-20 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-organic-sm bg-primary/20 text-primary mb-4">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              You’re all set
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty max-w-md mx-auto">
              Check your email in the next few minutes. We’re upscaling your portrait and will send
              you the download link and print guide. If you don’t see it, check your spam folder.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Button className="rounded-organic-sm" asChild>
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

  if (isStep3Preview) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <SketchDivider />
        <section className="mx-auto w-full max-w-7xl px-4 py-14 md:py-20 sm:px-6">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-1">
              Step 3 · Approve your portrait
            </p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Does this look like {preview.petName}?
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Take a close look at the pose and details. When you’re happy, approve and we’ll email
              your print‑ready files.
            </p>

            <div className="mt-6 rounded-organic border border-border bg-card p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-organic-sm bg-muted">
                <Image
                  src={`/api/portrait-preview?id=${encodeURIComponent(preview.portraitId)}`}
                  alt={`${preview.petName}'s portrait`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Order total:{" "}
                <span className="font-medium text-foreground">
                  {preview.amountDisplay} {preview.currency}
                </span>
                . You’ll receive wide and tall print‑ready files plus a print guide.
              </p>

              {approveError && (
                <div className="mt-3 flex items-start gap-2 rounded-organic-sm border border-destructive/40 bg-destructive/5 p-3">
                  <AlertCircle className="mt-[2px] h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{approveError}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleApprove}
                  disabled={approveStatus === "submitting"}
                  className="rounded-organic-sm"
                >
                  {approveStatus === "submitting" ? "Approving…" : "Approve this portrait"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Not quite right? You can request another render or upload a new photo next.
                </p>
              </div>
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
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-organic-sm bg-primary/20 text-primary mb-4">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Payment received
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Thank you for your order. We’re preparing your portrait preview.
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
              <p className="mt-6 text-sm text-muted-foreground max-w-md mx-auto">
                Our studio is rendering your artwork. This usually takes a minute or two.
              </p>
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
