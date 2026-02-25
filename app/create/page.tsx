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
import { Check, ImageOff, AlertCircle, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"

type Status = "idle" | "uploading" | "processing" | "success" | "error"

const WIZARD_STEPS = [
  { id: 1, label: "Style", short: "1" },
  { id: 2, label: "Photo", short: "2" },
  { id: 3, label: "Go", short: "3" },
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
  const [resultPortraitId, setResultPortraitId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [ageConfirm, setAgeConfirm] = useState(false)
  const [showcasePermission, setShowcasePermission] = useState(true)
  const [wizardStep, setWizardStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadUrlRef = useRef<string | null>(null)
  const processingStartedAtRef = useRef<number>(0)

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(async () => {
        try {
          const { data: rows, error } = await supabase
            .from("pet_portraits")
            .select("id, image_url, created_at, pet_name, original_image_url, status, rejection_reason")
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
          const exactMatch = (rows ?? []).find((row) => uploadUrl && withOriginal(row) === uploadUrl)
          const newestAfterStart = (rows ?? []).find(
            (row) => row?.image_url && new Date(row.created_at).getTime() >= cutoff
          )
          const matched = exactMatch ?? newestAfterStart
          if (matched && withStatus(matched).status === "rejected") {
            setStatus("error")
            setMessage(
              (matched as { rejection_reason?: string }).rejection_reason ||
                "This photo doesn't meet our requirements. Please upload a single pet only (no group photos, people, or objects)."
            )
            return
          }
          if (matched?.image_url) {
            setResultImageUrl(matched.image_url)
            setResultPetName(matched.pet_name ?? null)
            setResultPortraitId((matched as { id?: string }).id ?? null)
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

  function applyFile(selected: File | null) {
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
    const maxBytes = 10 * 1024 * 1024
    if (selected.size > maxBytes) {
      setFile(null)
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStatus("idle")
    setMessage("")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyFile(e.target.files?.[0] ?? null)
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    applyFile(f ?? null)
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
      const res = await fetch("/api/create-portrait", { method: "POST", body: formData })
      const contentType = res.headers.get("content-type")
      const text = await res.text()
      if (!contentType?.includes("application/json")) {
        setStatus("error")
        setMessage(`Server error: ${text || res.status}`)
        return
      }
      let data: { error?: string; error_id?: string; webhook_ok?: boolean; webhook_error?: string; webhook_status?: number; upload_url?: string } = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        setStatus("error")
        setMessage("Invalid response from server.")
        return
      }
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || `Request failed (${res.status})` + (data.error_id ? ` (${data.error_id})` : ""))
        return
      }
      if (data.webhook_ok === false) {
        setStatus("error")
        setMessage(data.webhook_error || `Workflow didn't start (${data.webhook_status ?? "no response"}).`)
        return
      }
      uploadUrlRef.current = typeof data.upload_url === "string" ? data.upload_url : null
      processingStartedAtRef.current = Date.now()
      setStatus("processing")
      setMessage("We're creating your portrait. Usually ready in 2–3 minutes.")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong.")
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
    setWizardStep(1)
    setMessage("")
    setResultImageUrl(null)
    setResultPetName(null)
    setResultPortraitId(null)
    setPreviewError(false)
    setAgreeTerms(false)
    setAgeConfirm(false)
    setShowcasePermission(true)
    uploadUrlRef.current = null
    processingStartedAtRef.current = 0
    fileInputRef.current && (fileInputRef.current.value = "")
  }

  function handleTryAnotherPhoto() {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setStatus("idle")
    setMessage("")
    setWizardStep(2)
    fileInputRef.current && (fileInputRef.current.value = "")
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  function goNext() {
    setSlideDirection("next")
    setWizardStep((s) => Math.min(3, s + 1))
  }
  function goPrev() {
    setSlideDirection("prev")
    setWizardStep((s) => Math.max(1, s - 1))
  }

  const isRejectionError =
    status === "error" &&
    message &&
    (message.toLowerCase().includes("single pet") ||
      message.toLowerCase().includes("group") ||
      message.toLowerCase().includes("please upload") ||
      message.toLowerCase().includes("doesn't meet"))

  const selectedTheme = themes.find((t) => t.id === theme)

  // Show wizard only when idle or error (and not after submit)
  const showWizard = status === "idle" || status === "error"
  const progressPercent = showWizard ? (wizardStep / 3) * 100 : 100

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Top progress bar — smooth, always visible during wizard */}
      {showWizard && (
        <div className="sticky top-[57px] z-40 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />
        </div>
      )}

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</a>

          {showWizard && (
            <>
              {/* Step indicator — minimal, not a blob */}
              <div className="mt-6 flex items-center justify-center gap-2" aria-label="Progress">
                {WIZARD_STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-organic-sm text-sm font-semibold transition-all duration-300",
                        wizardStep > s.id
                          ? "bg-primary text-primary-foreground"
                          : wizardStep === s.id
                            ? "border-2 border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                            : "border border-border bg-muted/50 text-muted-foreground"
                      )}
                      aria-current={wizardStep === s.id ? "step" : undefined}
                    >
                      {wizardStep > s.id ? <Check className="h-4 w-4" /> : s.short}
                    </div>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mx-1.5 h-0.5 w-6 rounded-full transition-colors duration-300 sm:w-8",
                          wizardStep > s.id ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Single step content with motion */}
              <div className="relative mt-10 min-h-[320px] overflow-hidden">
                {/* Step 1 — Choose style */}
                {wizardStep === 1 && (
                  <div
                    key="step1"
                    className={cn(
                      "animate-in fade-in-0 duration-300",
                      slideDirection === "next" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                    )}
                  >
                    <h2 className="text-xl font-semibold text-foreground">Pick a style</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Your pet in this look. Choose one.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {themes.length === 0 ? (
                        <div className="col-span-full flex gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square w-full max-w-[140px] animate-pulse rounded-organic bg-muted" />
                          ))}
                        </div>
                      ) : (
                        themes.map((t, index) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTheme(t.id)}
                            className={cn(
                              "group relative overflow-hidden rounded-organic border-2 text-left transition-all duration-200 hover:border-primary/60 hover:shadow-md",
                              theme === t.id
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card"
                            )}
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <div className="relative aspect-square w-full bg-muted">
                              <Image
                                src={t.previewUrl}
                                alt={t.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                              {theme === t.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-organic-sm bg-primary text-primary-foreground">
                                    <Check className="h-4 w-4" />
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <span className="font-heading font-semibold text-foreground">{t.name}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button
                        type="button"
                        onClick={goNext}
                        disabled={!theme}
                        className="rounded-organic-sm px-6"
                      >
                        Continue
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Photo */}
                {wizardStep === 2 && (
                  <div
                    key="step2"
                    className={cn(
                      "animate-in fade-in-0 duration-300",
                      slideDirection === "next" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                    )}
                  >
                    <h2 className="text-xl font-semibold text-foreground">Add your pet&apos;s photo</h2>
                    <p className="mt-1 text-sm text-muted-foreground">One pet only — dog or cat. We&apos;ll check before processing.</p>
                    <input
                      ref={fileInputRef}
                      id="pet-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="pet-photo"
                      className={cn(
                        "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-organic border-2 border-dashed py-10 transition-colors",
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {previewUrl && file ? (
                        <div className="relative w-full max-w-sm overflow-hidden rounded-organic-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="Preview" className="h-auto w-full object-contain max-h-64" />
                        </div>
                      ) : (
                        <>
                          <ImageOff className="h-10 w-10 text-muted-foreground" aria-hidden />
                          <span className="mt-2 text-sm font-medium text-foreground">
                            Drag a photo here or tap to choose
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG or WebP · max 10 MB</span>
                        </>
                      )}
                    </label>
                    <div className="mt-4">
                      <label htmlFor="pet-name" className="block text-sm font-medium text-foreground">Pet name (optional)</label>
                      <input
                        id="pet-name"
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="e.g. Max, Luna"
                        className="mt-1.5 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                    <div className="mt-8 flex justify-between">
                      <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={goNext}
                        disabled={!file}
                        className="rounded-organic-sm px-6"
                      >
                        Continue
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Review & create (soft consent) */}
                {wizardStep === 3 && (
                  <div
                    key="step3"
                    className={cn(
                      "animate-in fade-in-0 duration-300",
                      slideDirection === "next" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                    )}
                  >
                    <h2 className="text-xl font-semibold text-foreground">You&apos;re all set</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Quick confirm, then we&apos;ll create your portrait.</p>

                    {/* Summary */}
                    <div className="mt-6 flex gap-4 rounded-organic border border-border bg-card p-4">
                      {selectedTheme && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-organic-sm bg-muted">
                          <Image src={selectedTheme.previewUrl} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      {previewUrl && (
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-organic-sm bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{selectedTheme?.name ?? "Style"}</p>
                        <p className="text-sm text-muted-foreground">{petName.trim() || "Your pet"}</p>
                      </div>
                    </div>

                    {/* Lightweight consent — minimal, not a scary box */}
                    <div className="mt-6 space-y-2.5 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox checked={ageConfirm} onCheckedChange={(c) => setAgeConfirm(c === true)} className="rounded border-2" aria-required />
                        <span className="text-sm text-muted-foreground">I&apos;m 18 or older</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c === true)} className="rounded border-2" aria-required />
                        <span className="text-sm text-muted-foreground">I agree with the <a href="/terms" className="text-primary underline hover:no-underline">Terms and Conditions</a></span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox checked={showcasePermission} onCheckedChange={(c) => setShowcasePermission(c === true)} className="rounded border-2" />
                        <span className="text-sm text-muted-foreground">Feature my portrait on the website and social media</span>
                      </label>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 flex justify-between">
                      <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={!agreeTerms || !ageConfirm || status === "uploading"}
                        className="rounded-organic-sm px-6"
                      >
                        {status === "uploading" ? "Uploading…" : "Create my portrait"}
                        <Sparkles className="ml-1 h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Error state — only when wizard is shown and there's an error */}
              {status === "error" && message && (
                <div
                  className={cn(
                    "mt-6 animate-in fade-in-0 duration-300",
                    isRejectionError ? "rounded-organic border border-amber-500/40 bg-amber-500/5 p-4" : "rounded-organic-sm border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
                  )}
                  role="alert"
                >
                  {isRejectionError ? (
                    <>
                      <p className="font-medium text-foreground">This photo couldn&apos;t be used</p>
                      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                      <p className="mt-2 text-xs text-foreground">One pet only · no people or other animals.</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3 rounded-organic-sm" onClick={handleTryAnotherPhoto}>
                        Choose another photo
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                      <span className="text-sm">{message}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Processing */}
          {status === "processing" && (
            <div className="animate-in fade-in-0 duration-300 flex flex-col items-center justify-center py-16 text-center">
              <div className="relative">
                    <div className="h-20 w-20 rounded-organic-sm border-2 border-primary/30 bg-primary/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="h-2 w-2 animate-ping rounded-full bg-primary" style={{ animationDuration: "1.2s" }} />
                    </div>
                  </div>
              <p className="mt-6 text-lg font-semibold text-foreground">Creating your portrait</p>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <p className="mt-1 text-xs text-muted-foreground">You can leave this page — we&apos;ll add it when it&apos;s ready.</p>
              <div className="mt-6 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Success — preview with watermark, no right-click/save, CTA to buy */}
          {status === "success" && (resultImageUrl || resultPortraitId) && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center py-8 text-center">
              <p className="text-lg font-semibold text-foreground">Your portrait is ready</p>
              <p className="mt-1 text-sm text-muted-foreground">Purchase to download in 4K and print.</p>

              {/* Preview container: no right-click, no drag, max 800px, watermark */}
              <div
                className="relative mt-6 w-full max-w-[800px] overflow-hidden rounded-organic border-2 border-border shadow-lg"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              >
                <div className="relative aspect-video w-full min-h-[240px] bg-muted">
                  {/* Use plain img so preview works regardless of Next/Image domain config */}
                  {resultPortraitId && !previewError ? (
                    <img
                      src={`/api/portrait-preview?id=${encodeURIComponent(resultPortraitId)}`}
                      alt={resultPetName || "Your pet portrait"}
                      className="absolute inset-0 h-full w-full object-contain"
                      draggable={false}
                      style={{ pointerEvents: "none" }}
                      onError={() => setPreviewError(true)}
                    />
                  ) : resultImageUrl ? (
                    <img
                      src={resultImageUrl}
                      alt={resultPetName || "Your pet portrait"}
                      className="absolute inset-0 h-full w-full object-contain"
                      draggable={false}
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Loading preview…
                    </div>
                  )}
                  {/* Watermark overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-background/10 pointer-events-none"
                    aria-hidden
                  >
                    <div className="rotate-[-12deg] select-none text-xl font-bold text-foreground/30 tracking-widest sm:text-2xl">
                      PREVIEW — Unlock 4K
                    </div>
                  </div>
                </div>
              </div>
              {resultPetName && <p className="mt-3 text-sm text-muted-foreground">{resultPetName}</p>}

              {/* Primary CTA: buy / download */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button className="rounded-organic-sm px-8 py-6 text-base" asChild>
                  <a href={resultPortraitId ? `/checkout?portrait=${encodeURIComponent(resultPortraitId)}` : "/checkout"}>
                    Get my 4K download — $29
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">Secure payment · Instant download</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={handleReset} className="rounded-organic-sm">
                    Create another
                  </Button>
                  <Button variant="outline" className="rounded-organic-sm" asChild>
                    <a href="/#gallery">View in gallery</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SketchDivider />
      <Footer />
    </main>
  )
}
