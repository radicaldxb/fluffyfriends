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
import { Check, ImageOff, AlertCircle, ChevronRight, ChevronLeft, Sparkles, SunMedium, User, Camera } from "lucide-react"

type Status = "idle" | "uploading" | "processing" | "success" | "error"

const WIZARD_STEPS = [
  { id: 1, label: "Choose a theme", short: "1" },
  { id: 2, label: "Upload their photo", short: "2" },
  { id: 3, label: "Pay & create", short: "3" },
] as const

type ThemeItem = { id: string; name: string; previewUrl: string }

function cleanValidatorMessage(raw: string | null): string {
  if (!raw) return ""
  return raw.replace(/^valid:\s*no\s*[-–]\s*/i, "").trim()
}

export default function CreatePortraitPage() {
  const [themes] = useState<ThemeItem[]>([
    { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
    { id: "spaceman", name: "Spaceman", previewUrl: "/images/themes/spaceman-preview.webp" },
  ])
  const [theme, setTheme] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [petName, setPetName] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [resultPetName, setResultPetName] = useState<string | null>(null)
  const [resultPortraitId, setResultPortraitId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [ageConfirm, setAgeConfirm] = useState(false)
  const [showcasePermission, setShowcasePermission] = useState(true)
  const [wizardStep, setWizardStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next")
  const [isDragging, setIsDragging] = useState(false)
  const [isValidationReject, setIsValidationReject] = useState(false)
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
          const newestAfterStart = (rows ?? []).find((row) => new Date(row.created_at).getTime() >= cutoff)
          const matched = exactMatch ?? newestAfterStart
          if (matched && withStatus(matched).status === "rejected") {
            setIsValidationReject(true)
            setStatus("error")
            setMessage(
              (matched as { rejection_reason?: string }).rejection_reason ||
                "This photo doesn't meet our requirements. Please upload a single pet only (no group photos, people, or objects)."
            )
            return
          }
          if (matched?.id) {
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

    setIsValidationReject(false)
    setStatus("processing")
    setMessage("Taking a look at their photo…")
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
        if (data.rejected) {
          setIsValidationReject(true)
        }
        setStatus("error")
        setMessage(
          data.error ||
            (data.rejected
              ? "This photo doesn't meet our requirements. Please upload a clear photo of a single pet."
              : `Request failed (${res.status})` + (data.error_id ? ` (${data.error_id})` : ""))
        )
        return
      }
      if (data.webhook_ok === false) {
        setStatus("error")
        setMessage(data.webhook_error || `Workflow didn't start (${data.webhook_status ?? "no response"}).`)
        return
      }
      uploadUrlRef.current = typeof data.upload_url === "string" ? data.upload_url : null
      processingStartedAtRef.current = Date.now()
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  // Trigger image validation / n8n workflow without going through the step 3 form submit.
  function handleCheckImage() {
    // Reuse the existing submit logic, but with a fake event.
    void handleSubmit({ preventDefault() {} } as unknown as React.FormEvent)
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
    setIsValidationReject(false)
    setWizardStep(1)
    setMessage("")
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
    setIsValidationReject(false)
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

  const isRejectionError = status === "error" && isValidationReject

  const selectedTheme = themes.find((t) => t.id === theme)

  // [Pet Name] for copy — "their" when no name
  const petNameDisplay = petName.trim()
  const theirOrName = petNameDisplay ? `${petNameDisplay}'s` : "their"
  const pageTitle = petNameDisplay ? `Create ${petNameDisplay}'s portrait` : "Create your portrait"
  const cleanedRejectionMessage = cleanValidatorMessage(message)

  // Show wizard only when idle or error (and not after submit)
  const showWizard = status === "idle" || status === "error"
  const progressPercent = showWizard ? (wizardStep / 3) * 100 : 100

  return (
    <main className="min-h-screen bg-background flex flex-col">
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

      <section className="py-10 md:py-14 flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</a>

          {showWizard && (
            <>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Takes less than three minutes. No tech skills needed.
              </p>
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
                    <h2 className="text-xl font-semibold text-foreground">What&apos;s their theme?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse our collection and pick the one that feels most like them. Their name will be worked into every portrait — whatever you choose.
                    </p>
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
                            <div className="relative w-full h-40 overflow-hidden rounded-organic-sm bg-muted">
                              {/* Use native img here to avoid any Image config issues so previews always show */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={t.previewUrl}
                                alt={t.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
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
                    <div className="mt-6">
                      <label htmlFor="pet-name-step1" className="block text-sm font-medium text-foreground">
                        What&apos;s their name?
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Exactly as you&apos;d like it to appear in the portrait
                      </p>
                      <input
                        id="pet-name-step1"
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value.slice(0, 12))}
                        maxLength={12}
                        placeholder="e.g. Jimmy"
                        className="mt-1.5 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                    {/* Primary CTA – match hero CTA layout and spacing */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        onClick={goNext}
                        disabled={!theme}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 h-auto"
                      >
                        Next — upload their photo
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      You won&apos;t be charged until step 3
                    </p>
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
                    <h2 className="text-xl font-semibold text-foreground">
                      Upload {theirOrName} photo
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      One clear photo is all we need. We&apos;ll check it first, so there are no surprises or money wasted.
                    </p>
                    <p className="mt-4 text-sm font-semibold text-foreground">What makes a great photo</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <SunMedium className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                        <span>Well lit — natural light works best</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                        <span>One pet only — no group shots please</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Camera className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                        <span>Face towards the camera — the more detail, the better the portrait</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Camera className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                        <span>Avoid a busy background in the photo</span>
                      </li>
                    </ul>
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
                            Drop {theirOrName} photo here, or click to browse
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">JPG or PNG · Up to 10 MB</span>
                        </>
                      )}
                    </label>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Photo reviewed before payment — no surprises
                    </p>
                    {/* Consent moves here under the upload box */}
                    <div className="mt-6 space-y-2.5 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          checked={ageConfirm}
                          onCheckedChange={(c) => setAgeConfirm(c === true)}
                          className="mt-0.5 rounded border-2"
                          aria-required
                        />
                        <span className="text-sm text-muted-foreground">
                          I&apos;m 18 or older{" "}
                          <span className="ml-1 text-xs text-muted-foreground">
                            (A quick legal requirement — you must be 18 or older to complete a purchase online.)
                          </span>
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={agreeTerms}
                          onCheckedChange={(c) => setAgreeTerms(c === true)}
                          className="rounded border-2"
                          aria-required
                        />
                        <span className="text-sm text-muted-foreground">
                          I agree with the{" "}
                          <a href="/terms" className="text-primary underline hover:no-underline">
                            Terms &amp; Conditions
                          </a>
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={showcasePermission}
                          onCheckedChange={(c) => setShowcasePermission(c === true)}
                          className="rounded border-2"
                        />
                        <span className="text-sm text-muted-foreground">
                          I agree my portrait can be used on the website and social media
                        </span>
                      </label>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCheckImage}
                        disabled={!file || !ageConfirm || !agreeTerms}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 h-auto"
                      >
                        Continue — check image
                        <ChevronRight className="ml-0.5 h-4 w-4" />
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
                    <h2 className="text-xl font-semibold text-foreground">
                      Almost there — {theirOrName} portrait is ready
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Quick confirm, then we&apos;ll create your portrait.
                    </p>

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
                        <p className="text-sm text-muted-foreground">{petNameDisplay || "Your pet"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Wide + tall format · A1 print quality · Free print guide included
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-medium text-foreground">What happens next</p>
                    <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                      <li>{theirOrName} portrait starts the moment payment goes through</li>
                      <li>Two print-ready files arrive in your inbox within minutes</li>
                      <li>Wide format + tall format — both included</li>
                      <li>Your free print guide shows you exactly how to get it printed and framed</li>
                    </ul>

                    <div className="mt-4 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3">
                      <p className="text-xs font-medium text-foreground">Not happy? We&apos;ll make it right.</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        If the portrait isn&apos;t what you hoped for, we&apos;ll regenerate it — up to four times. Still not right? Full refund. No questions, no hassle, no hard feelings.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                      <p className="text-xs text-muted-foreground">
                        Secure payment · All major cards accepted · One-time only · No subscription
                      </p>
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={!agreeTerms || !ageConfirm || status === "uploading"}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 h-auto"
                        >
                          {status === "uploading" ? "Uploading…" : "Make My Portrait"}
                          <Sparkles className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
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
                      <p className="font-medium text-foreground">Oops — this photo won&apos;t work</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cleanedRejectionMessage ||
                          "It looks like there might be more than one pet, a person, or another object in the frame."}
                      </p>
                      <p className="mt-2 text-xs text-foreground">Let&apos;s try that again with one clear photo of just your pet.</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3 rounded-organic-sm" onClick={handleTryAnotherPhoto}>
                        Upload a new photo
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

          {/* Processing – validation only */}
          {status === "processing" && (
            <div className="animate-in fade-in-0 duration-300 flex flex-col items-center justify-center py-16 text-center">
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
              <p className="mt-6 text-lg font-semibold text-foreground">
                Taking a look at {theirOrName} photo…
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Just making sure it&apos;ll work beautifully
              </p>
              <div className="mt-6 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Success — validation passed, now move to payment */}
          {status === "success" && resultPortraitId && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center py-10 text-center">
              <p className="text-lg font-semibold text-foreground">
                {petNameDisplay ? `${petNameDisplay} is looking great` : "This photo is looking great"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                We&apos;re confident this will make a stunning portrait. Continue when you&apos;re ready.
              </p>

              {/* Approved photo preview with check mark */}
              {previewUrl && (
                <div className="mt-6">
                  <div className="relative mx-auto w-full max-w-sm">
                    <div className="overflow-hidden rounded-organic border border-emerald-400/70 bg-muted shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={resultPetName || "Approved pet photo"}
                        className="h-auto w-full max-h-72 object-cover"
                      />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}

              {resultPetName && (
                <p className="mt-4 text-sm text-muted-foreground">
                  We&apos;ll turn <span className="font-medium text-foreground">{resultPetName}</span> into a{" "}
                  <span className="font-medium text-foreground">{selectedTheme?.name}</span> portrait.
                </p>
              )}

              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 h-auto"
                  asChild
                >
                  <a href={`/checkout?portrait=${encodeURIComponent(resultPortraitId)}`}>
                    Continue to payment
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Secure Stripe payment · We only charge once per portrait.
                </p>
                <Button variant="outline" onClick={handleReset} className="mt-2 rounded-organic-sm">
                  Start over with a different photo
                </Button>
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
