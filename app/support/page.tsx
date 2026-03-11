"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LookupResult = {
  portrait: {
    id: string
    pet_name: string | null
    theme: string | null
    original_image_url: string | null
    generated_image_url: string | null
    status: string | null
  }
  already_remade: boolean
}

export default function SupportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [lookupEmail, setLookupEmail] = useState("")
  const [lookupRef, setLookupRef] = useState("")
  const [lookupError, setLookupError] = useState<string>("")
  const [isLookingUp, setIsLookingUp] = useState(false)

  const [order, setOrder] = useState<LookupResult | null>(null)

  const [name, setName] = useState("")
  const [issueType, setIssueType] = useState("")
  const [message, setMessage] = useState("")
  const [submitError, setSubmitError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const messageLength = message.trim().length
  const supportsRemakeOption = !order?.already_remade

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setLookupError("")
    setOrder(null)

    const email = lookupEmail.trim().toLowerCase()
    const ref = lookupRef.trim()

    if (!email || !ref) {
      setLookupError("Please enter both your email address and order reference.")
      return
    }

    setIsLookingUp(true)
    try {
      const res = await fetch("/api/lookup-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, payment_intent_id: ref }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.found) {
        setLookupError(
          typeof data.error === "string" && data.error
            ? data.error
            : "We couldn't find an order with that reference and email.",
        )
        return
      }
      setOrder({
        portrait: data.portrait,
        already_remade: Boolean(data.already_remade),
      })
      setStep(2)
    } catch (err) {
      setLookupError(
        err instanceof Error
          ? err.message
          : "Something went wrong while looking up your order. Please try again.",
      )
    } finally {
      setIsLookingUp(false)
    }
  }

  async function handleSubmitSupport(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return
    setSubmitError("")

    if (!issueType) {
      setSubmitError("Please choose the type of issue you need help with.")
      return
    }

    if (messageLength < 50) {
      setSubmitError("Please provide more detail (minimum 50 characters).")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/submit-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: lookupEmail.trim().toLowerCase(),
          payment_intent_id: lookupRef.trim(),
          portrait_id: order.portrait.id,
          pet_name: order.portrait.pet_name,
          theme: order.portrait.theme,
          issue_type: issueType,
          message,
          original_image_url: order.portrait.original_image_url,
          generated_image_url: order.portrait.generated_image_url,
          already_remade: order.already_remade,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setSubmitError(
          typeof data.error === "string" && data.error
            ? data.error
            : "We couldn't submit your request. Please try again.",
        )
        return
      }
      setStep(3)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your request. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const issueOptions = [
    { value: "not_arrived", label: "Portrait didn't arrive" },
    ...(supportsRemakeOption
      ? [{ value: "quality_remake", label: "Portrait quality issue — I'd like a remake" }]
      : []),
    { value: "download_issue", label: "Download not working" },
    { value: "billing", label: "Billing question" },
    { value: "other", label: "Something else" },
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto w-full max-w-3xl px-4 py-14 md:py-20 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          How can we help?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If something isn&apos;t quite right with your portrait or order, we&apos;re here to help.
        </p>

        {/* Step 1 – Order lookup */}
        <div className="mt-8 rounded-organic border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Step 1 · Find your order</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You&apos;ll find your order reference in your confirmation email. It starts with{" "}
            <code className="font-mono text-[11px]">pi_</code>.
          </p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={handleLookup}
          >
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email address
              </label>
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Order reference
              </label>
              <input
                type="text"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="pi_xxxxx — found in your confirmation email"
                required
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={isLookingUp}
                className="rounded-organic-sm"
              >
                {isLookingUp ? "Finding your order…" : "Find my order"}
              </Button>
            </div>
          </form>
          {lookupError && (
            <p className="mt-3 text-xs text-destructive">
              {lookupError}
            </p>
          )}
        </div>

        {/* Step 2 – Preview + form */}
        {step >= 2 && order && (
          <div className="mt-10 space-y-6">
            <div className="rounded-organic border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">
                Step 2 · Review your portrait
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Your original photo
                  </p>
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-organic-sm border border-border bg-muted flex items-center justify-center">
                    {order.portrait.original_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.portrait.original_image_url}
                        alt={order.portrait.pet_name || "Original pet photo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No original photo available</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Your portrait
                  </p>
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-organic-sm border border-border bg-muted flex items-center justify-center">
                    {order.portrait.generated_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.portrait.generated_image_url}
                        alt={order.portrait.pet_name || "Generated portrait"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        We&apos;re still preparing your portrait.
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <p>
                  {order.portrait.pet_name || "Your pet"}
                  {order.portrait.theme && ` · ${order.portrait.theme}`}
                </p>
                <p className="mt-0.5">
                  Order: <span className="font-mono">{lookupRef.trim()}</span>
                </p>
                {order.already_remade && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    As a remake has already been issued for this order, our team will review your request
                    personally.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-organic border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">
                Step 3 · Tell us what happened
              </p>
              <form className="mt-4 space-y-4" onSubmit={handleSubmitSupport}>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Issue type *
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    required
                  >
                    <option value="">Choose an option</option>
                    {issueOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Optional, but helpful"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tell us what happened *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 min-h-[120px] resize-vertical"
                    placeholder="Please include as much detail as you can so we can help quickly."
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Minimum 50 characters. You&apos;ve written{" "}
                      <span className={cn(messageLength < 50 && "text-destructive")}>
                        {messageLength}
                      </span>
                      .
                    </span>
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs text-destructive">
                    {submitError}
                  </p>
                )}

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-organic-sm"
                  >
                    {isSubmitting ? "Submitting…" : "Submit request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 3 – Confirmation */}
        {step === 3 && (
          <div className="mt-10 rounded-organic border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">
              We&apos;ve received your request
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team will review it and you&apos;ll hear from us within 24 hours.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If a remake credit is approved, it will be added to your account automatically.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Support</h1>
        <p className="mt-4 text-muted-foreground">
          Need help? Contact us for questions about your order, portrait quality, or technical issues. We’re here to help.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-primary font-medium hover:underline">← Back to home</Link>
        </p>
      </section>
      <Footer />
    </main>
  )
}
