"use client"
import { useState } from "react"

export function GiftWaitlist() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit() {
    if (!email) return
    setStatus("loading")
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "gift" }),
    })
    setStatus(res.ok ? "success" : "error")
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="text-sm font-semibold text-primary">🎉 You&apos;re on the list!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you as soon as gift portraits launch.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-2">
      <p className="text-sm text-muted-foreground">
        🎁 Gift portraits are coming soon — be the first to know.
      </p>
      <div className="flex gap-2 w-full max-w-sm">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 rounded-organic-sm border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="rounded-organic-sm bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : "Notify me"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive">Something went wrong — please try again.</p>
      )}
    </div>
  )
}
