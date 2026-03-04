"use client"

import { Suspense, useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, Check } from "lucide-react"
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
    async function loadPreview() {
      // If we only have a portrait id (e.g. direct link) but no session,
      // show a lightweight preview without pricing.
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
          if (!cancelled) {
            setPreview({
              status: "error",
              message:
                data.error ||
                "We couldn’t load your portrait preview yet. Please refresh in a moment.",
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
            portraitId: data.portrait_id,
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
                : "We couldn’t load your portrait preview. Please try again.",
          })
        }
      }
    }

    loadPreview()

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
          data.error || "We couldn’t start the upscale yet. Please try again in a moment.",
        )
        return
      }
      setApproveStatus("success")
    } catch (err) {
      setApproveStatus("error")
      setApproveError(
        err instanceof Error
          ? err.message
          : "We couldn’t start the upscale yet. Please try again in a moment.",
      )
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="mx-auto flex max-w-2xl flex-1 flex-col items-center px-4 py-14 md:py-20 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-3">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Payment received
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Thank you for your order. Preview your portrait below and, when you&apos;re happy, approve
          it so we can prepare your print‑ready files.
        </p>

        {/* Generation animation */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-[999px] border-2 border-primary/40 bg-primary/5 shadow-sm">
            <video
              src="/video/FF-Loader.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover scale-[1.05]"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Our studio is rendering and preparing your artwork. Approving your portrait lets us
            upscale it for large, razor‑sharp prints.
          </p>
        </div>

        {/* Preview + approval panel */}
        <div className="mt-10 w-full max-w-xl rounded-organic border border-border bg-card p-5 text-left">
          {preview.status === "loading" && (
            <p className="text-sm text-muted-foreground text-center">
              Loading your portrait preview…
            </p>
          )}

          {preview.status === "error" && (
            <div className="flex items-start gap-2 rounded-organic-sm border border-destructive/40 bg-destructive/5 p-3">
              <AlertCircle className="mt-[2px] h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{preview.message}</p>
            </div>
          )}

          {preview.status === "ready" && (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-2">
                Step 2 · Approve your portrait
              </p>
              <h2 className="text-lg font-bold text-foreground">
                Does this look like {preview.petName}?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a close look at the pose, expression, and details. When you&apos;re happy,
                approve it and we&apos;ll email your high‑resolution downloads.
              </p>

              <div className="mt-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-organic-sm bg-muted">
                  <Image
                    src={`/api/portrait-preview?id=${encodeURIComponent(preview.portraitId)}`}
                    alt={`${preview.petName}'s portrait`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Order total:{" "}
                <span className="font-medium text-foreground">
                  {preview.amountDisplay} {preview.currency}
                </span>
                . You&apos;ll receive both wide and tall print‑ready files plus a print guide.
              </p>

              {approveError && (
                <div className="mt-3 flex items-start gap-2 rounded-organic-sm border border-destructive/40 bg-destructive/5 p-3">
                  <AlertCircle className="mt-[2px] h-4 w-4 text-destructive" />
                  <p className="text-xs text-destructive">{approveError}</p>
                </div>
              )}

              <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleApprove}
                  disabled={
                    approveStatus === "submitting" ||
                    approveStatus === "success" ||
                    preview.status !== "ready"
                  }
                  className="inline-flex items-center justify-center bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 rounded-organic-sm"
                >
                  {approveStatus === "submitting"
                    ? "Approving…"
                    : approveStatus === "success"
                      ? "Approved — check your inbox"
                      : "Approve this portrait"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Not quite right? We&apos;ll soon add an option to request another render before you
                  approve.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground max-w-md">
          Once approved, you&apos;ll receive an email with your portrait in both wide and tall
          formats, plus a simple print guide. If it doesn&apos;t arrive, please check your spam
          folder or search for <span className="font-semibold">FluffyFriends</span> in your inbox.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button className="rounded-organic-sm" asChild>
            <Link href="/create">Create another portrait</Link>
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
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
          <section className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-14 text-center">
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

