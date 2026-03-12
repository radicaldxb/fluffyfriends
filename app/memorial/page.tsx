"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Pet Memorial Portraits — Honour the Pet You Loved | FluffyFriends",
  description:
    "A lasting portrait of a pet that has passed. Transform their photo into a beautiful piece of art to keep, display, and remember them by. Coming soon.",
}

export default function MemorialPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: "memorial" }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        setStatus("error")
        setErrorMessage("Something went wrong — please try hello@fluffyfriends.online.")
        return
      }

      setStatus("success")
    } catch {
      setStatus("error")
      setErrorMessage("Something went wrong — please try hello@fluffyfriends.online.")
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Coming Soon
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            They Deserve to Be Remembered Beautifully
          </h1>
          <p className="text-sm text-muted-foreground">
            A portrait that captures who they were — their character, their presence, their place in your
            life. A piece of art you&apos;ll keep forever.
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-3 rounded-organic border border-border bg-card px-4 py-5 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            A dedicated way to honour the pet you loved
          </h2>
          <p className="text-sm text-muted-foreground">
            FluffyFriends Memorial Portraits are a dedicated premium product for pets that are no longer with
            us. We take your favourite photo — however old, however imperfect — and create a high-resolution
            portrait that celebrates their life. It&apos;s something to hang on your wall, to give as a gift
            to someone who loved them, or simply to keep close.
          </p>
        </div>

        <div className="mt-8 max-w-3xl space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Coming very soon
          </h2>
          <p className="text-sm text-muted-foreground">
            We are putting the finishing touches on our Memorial Portrait experience — from themes and
            framing suggestions to the way we handle older photos. It will be available soon as a dedicated,
            premium way to remember the pet you loved.
          </p>
        </div>

        <div className="mt-10 max-w-3xl rounded-organic border border-border bg-card px-4 py-5 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Be the first to know when it launches
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll notify you the moment Memorial Portraits are available. No spam — just one email when
            it&apos;s ready.
          </p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-organic-sm sm:w-auto"
            >
              {status === "loading" ? "Sending…" : "Notify Me"}
            </Button>
          </form>
          {status === "success" && (
            <p className="mt-3 text-sm text-foreground">
              We&apos;ll be in touch. Thank you.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mt-10 max-w-3xl space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            In the meantime
          </h2>
          <p className="text-sm text-muted-foreground">
            While we finish the Memorial Portrait experience, our standard portrait themes are available now.
            Many customers choose the King or similar regal themes as a dignified and beautiful way to honour
            a pet that has passed and is no longer with them.
          </p>
          <p className="text-sm text-primary">
            <a href="/" className="hover:underline">
              Browse portrait themes →
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

