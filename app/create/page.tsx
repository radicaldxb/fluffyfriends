"use client"

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SketchDivider } from "@/components/sketch-divider"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Check, ImageOff, AlertCircle } from "lucide-react"

type Status = "idle" | "uploading" | "processing" | "success" | "error"

const STEPS = [
  { id: 1, label: "Theme" },
  { id: 2, label: "Consent" },
  { id: 3, label: "Photo" },
  { id: 4, label: "Create" },
] as const

type ThemeItem = { id: string; name: string; previewUrl: string }

export default function CreatePortraitPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([])
  const [theme, setTheme] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [petName, setPetName] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [resultPetName, setResultPetName] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [ageConfirm, setAgeConfirm] = useState(false)
  const [showcasePermission, setShowcasePermission] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadUrlRef = useRef<string | null>(null)
  const processingStartedAtRef = useRef<number>(0)

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(async () => {
        try {
          const { data: rows, error } = await supabase
            .from("pet_portraits")
            .select("image_url, created_at, pet_name, original_image_url, status, rejection_reason")
            .order("created_at", { ascending: false })
            .limit(15)

          if (error) {
            console.error("Poll error:", error)
            return
          }

          const startedAt = processingStartedAtRef.current
          const uploadUrl = uploadUrlRef.current
          const cutoff = startedAt - 5000

          const withOriginal = (row: { original_image_url?: string }) => (row as { original_image_url?: string }).original_image_url
          const withStatus = (row: { status?: string; rejection_reason?: string }) => row as { status?: string; rejection_reason?: string }
          const exactMatch = (rows ?? []).find(
            (row) => uploadUrl && withOriginal(row) === uploadUrl
          )
          const newestAfterStart = (rows ?? []).find(
            (row) => row?.image_url && new Date(row.created_at).getTime() >= cutoff
          )
          const matched = exactMatch ?? newestAfterStart
          if (matched && withStatus(matched).status === "rejected") {
            setStatus("error")
            setMessage((matched as { rejection_reason?: string }).rejection_reason || "This photo doesn't meet our requirements. Please upload a single pet only (no group photos, people, or objects).")
            return
          }
          if (matched?.image_url) {
            setResultImageUrl(matched.image_url)
            setResultPetName(matched.pet_name ?? null)
            setStatus("success")
          }
        } catch (err) {
          console.error("Poll error:", err)
        }
      }, 3000)

      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (status === "processing") {
          setStatus("error")
          setMessage("This is taking longer than usual. Your portrait may still appear in the gallery soon.")
        }
      }, 300000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [status])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Load themes from API (data-driven; new themes appear without code change)
  useEffect(() => {
    let cancelled = false
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.themes) && data.themes.length > 0) {
          setThemes(data.themes)
        } else if (!cancelled) {
          setThemes([
            { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
            { id: "spaceman", name: "Spaceman", previewUrl: "/images/themes/spaceman-preview.webp" },
          ])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThemes([
            { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
            { id: "spaceman", name: "Spaceman", previewUrl: "/images/themes/spaceman-preview.webp" },
          ])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (!selected) {
      setFile(null)
      return
    }
    if (!selected.type.startsWith("image/")) {
      setFile(null)
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStatus("idle")
    setMessage("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !theme) return

    setStatus("uploading")
    setMessage("")

    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("theme", theme)
      if (petName.trim()) formData.set("pet_name", petName.trim())
      formData.set("showcase_consent", showcasePermission ? "true" : "false")

      const res = await fetch("/api/create-portrait", {
        method: "POST",
        body: formData,
      })

      // Read response text once (can only be read once)
      const contentType = res.headers.get("content-type")
      const text = await res.text()
      
      // Check if response is actually JSON
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[create-portrait] Non-JSON response:", { 
          status: res.status, 
          contentType,
          text: text.slice(0, 200) // Log first 200 chars
        })
        setStatus("error")
        setMessage(`Server error: ${text || `Unexpected response (${res.status})`}`)
        return
      }

      // Parse JSON
      let data
      try {
        if (!text) {
          const errorMsg = `Empty response from server (${res.status})`
          console.error("[create-portrait] Empty response:", { status: res.status, url: res.url })
          setStatus("error")
          setMessage(errorMsg)
          return
        }
        data = JSON.parse(text)
      } catch (parseError) {
        const errorMsg = `Invalid response from server: ${parseError instanceof Error ? parseError.message : "JSON parse error"}`
        console.error("[create-portrait] JSON parse error:", parseError, { 
          status: res.status, 
          url: res.url,
          text: text.slice(0, 200) // Log first 200 chars for debugging
        })
        setStatus("error")
        setMessage(errorMsg)
        return
      }

      if (!res.ok) {
        const errorMsg = data.error || `Request failed (${res.status})`
        console.error("[create-portrait] API error:", {
          status: res.status,
          error: data.error,
          error_id: data.error_id,
          details: data.details,
        })
        setStatus("error")
        setMessage(errorMsg + (data.error_id ? ` (Error ID: ${data.error_id})` : ""))
        return
      }

      if (data.webhook_ok === false) {
        setStatus("error")
        const detail = data.webhook_error || (data.webhook_status ? `Status ${data.webhook_status}` : "No response")
        setMessage(
          `Your photo was uploaded, but the workflow didn't start. n8n didn't accept the trigger (${detail}). Check that the transform-pet workflow is Active and N8N_WEBHOOK_URL uses the production URL (webhook/… not webhook-test/…).`
        )
        return
      }

      uploadUrlRef.current = typeof data.upload_url === "string" ? data.upload_url : null
      processingStartedAtRef.current = Date.now()
      setStatus("processing")
      setMessage("We're creating your portrait. This usually takes a few minutes.")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong."
      console.error("[create-portrait] Request failed:", err)
      setStatus("error")
      setMessage(errorMsg)
    }
  }

  function handleReset() {
    setTheme(null)
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setPetName("")
    setStatus("idle")
    setMessage("")
    setResultImageUrl(null)
    setResultPetName(null)
    uploadUrlRef.current = null
    processingStartedAtRef.current = 0
    fileInputRef.current?.value && (fileInputRef.current.value = "")
  }

  function handleTryAnotherPhoto() {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setStatus("idle")
    setMessage("")
    fileInputRef.current?.value && (fileInputRef.current.value = "")
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  // Current step (1–4) when on form; used for progress clarity
  const step1Done = !!theme
  const step2Done = agreeTerms && ageConfirm
  const step3Done = !!file
  const currentStep =
    status === "processing"
      ? 4
      : status === "success"
        ? 4
        : !step1Done
          ? 1
          : !step2Done
            ? 2
            : !step3Done
              ? 3
              : 4

  const isRejectionError =
    status === "error" &&
    message &&
    (message.toLowerCase().includes("single pet") ||
      message.toLowerCase().includes("group") ||
      message.toLowerCase().includes("please upload") ||
      message.toLowerCase().includes("doesn't meet"))

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Create your portrait
          </p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Upload your pet photo
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            Choose a theme, then upload a clear photo of <strong>one pet only</strong>. We'll create a unique portrait in that style.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            One pet per photo — no group photos, no people, no objects. Best results with a single dog or cat.
          </p>

          {/* Step indicator: clear where you are in the process */}
          {(status === "idle" || status === "uploading" || status === "error" || status === "processing" || status === "success") && (
            <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2" aria-label="Progress">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      currentStep > s.id || status === "success"
                        ? "bg-primary text-primary-foreground"
                        : currentStep === s.id
                          ? "border-2 border-primary bg-primary/10 text-foreground"
                          : "border border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {(currentStep > s.id || status === "success") ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={cn("ml-1.5 hidden text-xs font-medium sm:inline", (currentStep >= s.id || status === "success") ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={cn("mx-2 h-px w-4 sm:w-6", (currentStep > s.id || status === "success") ? "bg-primary/50" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          )}

          {(status === "idle" || status === "uploading" || status === "error") && (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Step 1 — Choose a theme
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {themes.length === 0 ? (
                    <p className="col-span-full text-sm text-muted-foreground">Loading themes…</p>
                  ) : (
                    themes.map((t, index) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        disabled={status === "uploading"}
                        className={cn(
                          "rounded-organic border-2 overflow-hidden text-left transition-all animate-in fade-in-0 duration-300",
                          theme === t.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50",
                          status === "uploading" && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ animationDelay: `${index * 40}ms`, animationFillMode: "backwards" }}
                      >
                        <div className="relative aspect-square w-full bg-muted">
                          <Image
                            src={t.previewUrl}
                            alt={`${t.name} theme preview`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <div className="font-heading font-bold text-foreground">{t.name}</div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            This style
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {!theme && (
                  <p className="mt-2 text-sm text-destructive">Please select a theme</p>
                )}
              </div>

              <div className="rounded-organic border border-border bg-muted/30 p-4 space-y-4">
                <p className="text-sm font-medium text-foreground">Step 2 — Consent</p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    checked={agreeTerms}
                    onCheckedChange={(c) => setAgreeTerms(c === true)}
                    disabled={status === "uploading"}
                    className="mt-0.5"
                    aria-required
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    <span className="text-foreground">(Required)</span> I agree to the Terms of Service and acknowledge that AI-generated art may contain hallucinations or artistic variations.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    checked={ageConfirm}
                    onCheckedChange={(c) => setAgeConfirm(c === true)}
                    disabled={status === "uploading"}
                    className="mt-0.5"
                    aria-required
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    <span className="text-foreground">(Required)</span> I am at least 18 years old.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    checked={showcasePermission}
                    onCheckedChange={(c) => setShowcasePermission(c === true)}
                    disabled={status === "uploading"}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    (Optional) I give permission for FluffyFriends to showcase my pet&apos;s portrait on their website and social media.
                  </span>
                </label>
              </div>

              <div>
                <label htmlFor="pet-photo" className="block text-sm font-medium text-foreground">
                  Step 3 — Pet photo (one pet only)
                </label>
                <p className="mt-1 text-xs text-muted-foreground mb-2">
                  Single dog or cat only. No group photos, no people, no objects (e.g. toys, food). We'll check your photo before processing.
                </p>
                <input
                  ref={fileInputRef}
                  id="pet-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                  disabled={status === "uploading"}
                  className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-organic-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG or WebP, max 10 MB
                </p>
              </div>

              {previewUrl && file && (
                <div className="overflow-hidden rounded-organic border border-border bg-muted/30 animate-in fade-in-0 duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-auto max-h-80 w-full object-contain"
                  />
                </div>
              )}

              <div>
                <label htmlFor="pet-name" className="block text-sm font-medium text-foreground">
                  Pet name (optional)
                </label>
                <input
                  id="pet-name"
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Max, Luna"
                  disabled={status === "uploading"}
                  className="mt-2 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Step 4 — Review and create</p>
                <Button
                type="submit"
                disabled={!file || !theme || !agreeTerms || !ageConfirm || status === "uploading"}
                className="w-full rounded-organic-sm sm:w-auto"
              >
                {status === "uploading" ? "Uploading…" : "Create my portrait"}
                </Button>
              </div>
            </form>
          )}

          {status === "processing" && (
            <div className="mt-10 rounded-organic border border-border bg-muted/30 p-8 text-center animate-in fade-in-0 duration-300">
              <p className="font-medium text-foreground">Step 4 — Creating your portrait</p>
              <div className="mt-3 flex justify-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Usually ready in 2–3 minutes. You can leave this page; we'll add it to the gallery when it's ready.
              </p>
            </div>
          )}

          {status === "success" && resultImageUrl && (
            <div className="mt-10 space-y-6 animate-in fade-in-0 duration-300">
              <div className="rounded-organic border border-border bg-muted/30 p-6 text-center">
                <p className="font-semibold text-foreground">Done — Your portrait is ready!</p>
                <div className="mt-4 overflow-hidden rounded-organic border border-border">
                  <Image
                    src={resultImageUrl}
                    alt={resultPetName || "Your pet portrait"}
                    width={400}
                    height={400}
                    className="h-auto w-full object-contain"
                    unoptimized={resultImageUrl.startsWith("http")}
                  />
                </div>
                {resultPetName && (
                  <p className="mt-3 text-sm text-muted-foreground">{resultPetName}</p>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-organic-sm"
                    asChild
                  >
                    <a href="/#gallery">View in gallery</a>
                  </Button>
                  <Button onClick={handleReset} className="rounded-organic-sm">
                    Create another
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "error" && message && (
            <>
              {isRejectionError ? (
                <div
                  className="mt-6 rounded-organic border border-amber-500/40 bg-amber-500/5 p-5 animate-in fade-in-0 duration-300"
                  role="alert"
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 rounded-full bg-amber-500/20 p-2">
                      <ImageOff className="h-5 w-5 text-amber-600" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">This photo couldn't be used</p>
                      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                      <p className="mt-3 text-xs font-medium text-foreground">What works best:</p>
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground space-y-0.5">
                        <li>One dog or one cat only</li>
                        <li>Clear view of the pet (no people, no other animals)</li>
                        <li>No objects as the main subject (e.g. toys, food)</li>
                      </ul>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-organic-sm"
                        onClick={handleTryAnotherPhoto}
                      >
                        Choose another photo
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "mt-6 rounded-organic-sm border px-4 py-3 text-sm animate-in fade-in-0 duration-300",
                    "border-destructive/50 bg-destructive/10 text-destructive"
                  )}
                  role="alert"
                >
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span>{message}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <SketchDivider />
      <Footer />
    </main>
  )
}
