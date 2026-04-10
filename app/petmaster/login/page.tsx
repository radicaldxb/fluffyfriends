"use client"

import { useState } from "react"

export default function PetmasterLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/petmaster-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError("Incorrect password")
        setLoading(false)
        return
      }
      window.location.href = "/petmaster"
    } catch {
      setError("Incorrect password")
      setLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#F2EEE2", color: "#111827" }}
    >
      <div className="w-full max-w-sm rounded-organic border border-[#111827]/15 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
        <h1 className="text-center font-heading text-2xl font-extrabold tracking-tight text-[#111827]">
          Petmaster
        </h1>
        <p className="mt-2 text-center text-sm text-[#111827]/70">Sign in with password</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="petmaster-password" className="sr-only">
              Password
            </label>
            <input
              id="petmaster-password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-organic-sm border border-[#111827]/20 bg-[#F2EEE2]/50 px-4 py-3 text-[#111827] placeholder:text-[#111827]/40 focus:border-[#F09A54] focus:outline-none focus:ring-2 focus:ring-[#F09A54]/30"
              placeholder="Password"
            />
          </div>
          {error ? (
            <p className="text-center text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-organic-sm px-4 py-3 font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#F09A54" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  )
}
