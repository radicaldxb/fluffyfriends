"use client"

import { useState, useEffect, Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PRODUCTS, getProduct, type ProductId } from "@/lib/products"
import { Check } from "lucide-react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const portraitId = searchParams.get("portrait")?.trim() || null

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [productId, setProductId] = useState<ProductId>("pack_4_4k")
  const [status, setStatus] = useState<"form" | "submitting" | "success" | "error">("form")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const product = getProduct(productId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!portraitId) {
      setErrorMessage("No portrait selected. Start from the create page.")
      return
    }
    const trimmedEmail = email.trim()
    const trimmedFirstName = firstName.trim()

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email.")
      return
    }
    if (!trimmedFirstName) {
      setErrorMessage("Please enter your first name.")
      return
    }

    setStatus("submitting")
    setErrorMessage("")

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          first_name: trimmedFirstName,
          product_id: productId,
          portrait_id: portraitId,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("form")
        setErrorMessage(data.error || `Request failed (${res.status})`)
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      // Fallback: show simple success if no redirect URL
      setOrderId(data.order_id ?? null)
      setStatus("success")
    } catch (err) {
      setStatus("form")
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  // No portrait in URL — prompt to go to create
  if (!portraitId) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="mx-auto max-w-lg px-4 py-14 md:py-20 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Get your 4K download
          </h1>
          <p className="mt-4 text-muted-foreground">
            Select a portrait first. Create your portrait, then choose &quot;Get my 4K download&quot; to come here with your image.
          </p>
          <Button className="mt-6 rounded-organic-sm" asChild>
            <Link href="/create">Go to Create</Link>
          </Button>
        </section>
        <Footer />
      </main>
    )
  }

  // Success state
  if (status === "success") {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="mx-auto max-w-lg px-4 py-14 md:py-20 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-6">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Order recorded
          </h1>
          <p className="mt-4 text-muted-foreground">
            This is a test fallback. If Stripe is connected, you should normally be redirected to the payment page instead of seeing this screen.
          </p>
          {orderId && (
            <p className="mt-2 text-sm text-muted-foreground">
              Order reference: <span className="font-mono text-foreground">{orderId.slice(0, 8)}…</span>
            </p>
          )}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button className="rounded-organic-sm" asChild>
              <Link href="/create">Create another portrait</Link>
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // Form: one-page checkout
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-xl px-4 py-10 md:py-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Get your 4K download
        </h1>
        <p className="mt-2 text-muted-foreground">
          Secure payment · Instant download (test flow — no payment yet)
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Portrait preview */}
          <div className="rounded-organic border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">Your portrait</p>
            <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-organic-sm bg-muted">
              <Image
                src={`/api/portrait-preview?id=${encodeURIComponent(portraitId)}`}
                alt="Your portrait"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Email + name */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Your details</p>
            <div>
              <label htmlFor="checkout-email" className="block text-sm text-muted-foreground mb-1">Email *</label>
              <input
                id="checkout-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label htmlFor="checkout-first-name" className="block text-sm text-muted-foreground mb-1">First name *</label>
              <input
                id="checkout-first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {/* Product choice */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Choose your pack</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(p.id)}
                  className={`rounded-organic-sm border-2 p-4 text-left transition-all ${
                    productId === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {productId === p.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">{p.priceDisplay}</span>
                    {p.savePercent != null && (
                      <span className="text-xs font-medium text-primary">Save {p.savePercent}%</span>
                    )}
                  </div>
                  {p.badge && (
                    <span className="mt-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      {p.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Trust line */}
          <p className="text-xs text-muted-foreground">
            Payment integration coming soon. This test records your order only — no charge.
          </p>

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-organic-sm py-6 text-base sm:w-auto sm:px-8"
          >
            {status === "submitting" ? "Saving…" : product ? `Continue — ${product.priceDisplay}` : "Continue"}
          </Button>
        </form>
      </section>
      <Footer />
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="mx-auto max-w-lg px-4 py-14 text-center">
          <p className="text-muted-foreground">Loading…</p>
        </section>
        <Footer />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
