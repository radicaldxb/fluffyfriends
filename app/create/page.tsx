"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Check, ImageOff, AlertCircle, ChevronRight, ChevronLeft, SunMedium, User, Camera } from "lucide-react"
import { PRODUCTS, type ProductId } from "@/lib/products"

export const dynamic = "force-dynamic"

type Status = "idle" | "uploading" | "processing" | "success" | "error"

const WIZARD_STEPS = [
  { id: 1, label: "Choose a theme", short: "1" },
  { id: 2, label: "Upload their photo", short: "2" },
  { id: 3, label: "Pay & create", short: "3" },
] as const

type ThemeItem = { id: string; name: string; previewUrl: string }

function cleanValidatorMessage(raw: string | null): string {
  if (!raw) return ""
  const stripped = raw.replace(/^valid:\s*no\s*[-–]\s*/i, "").trim()
  if (!stripped) return ""
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

function CreatePageFallback() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="py-10 md:py-14 flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function CreatePortraitContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")?.trim() || ""
  const [themes] = useState<ThemeItem[]>([
    { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
    { id: "police", name: "Police Officer", previewUrl: "/images/themes/police-preview.webp" },
    { id: "admiral", name: "Admiral", previewUrl: "/images/themes/admiral-preview.webp" },
    { id: "vet", name: "Veterinarian", previewUrl: "/images/themes/vet-preview.webp" },
    { id: "king", name: "King", previewUrl: "/images/themes/king-preview.webp" },
    { id: "queen", name: "Queen", previewUrl: "/images/themes/queen-preview.webp" },
    { id: "samurai", name: "Samurai", previewUrl: "/images/themes/samurai-preview.webp" },
    { id: "pilot", name: "Pilot", previewUrl: "/images/themes/pilot-preview.webp" },
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
  const [hasConsented, setHasConsented] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<ProductId>("portrait_pack")
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [checkoutError, setCheckoutError] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle")
  const [voucherMessage, setVoucherMessage] = useState("")
  const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [portraitsRemaining, setPortraitsRemaining] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!emailFromQuery) return
    let cancelled = false
    function fetchBalance() {
      fetch(`/api/portrait-balance?email=${encodeURIComponent(emailFromQuery)}`, { cache: "no-store" })
        .then((r) => r.json().catch(() => ({})))
        .then((data) => {
          if (cancelled) return
          const remaining = typeof data?.portraits_remaining === "number" ? data.portraits_remaining : 0
          setPortraitsRemaining(remaining)
        })
        .catch(() => {
          if (!cancelled) setPortraitsRemaining(null)
        })
    }
    fetchBalance()
    return () => { cancelled = true }
  }, [emailFromQuery])

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
    const resolvedPetName = petName.trim() || "My Pet"
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("theme", theme)
      if (petName.trim()) formData.set("pet_name", petName.trim())
      formData.set("showcase_consent", showcasePermission ? "true" : "false")
      const res = await fetch("/api/create-portrait", { method: "POST", body: formData })
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        portrait_id?: string
        upload_url?: string
        rejected?: boolean
        reason?: string
        error?: string
      }

      if (!res.ok || data.rejected) {
        const rawReason =
          typeof data.reason === "string" && data.reason.trim().length > 0
            ? data.reason.trim()
            : data.error || "This photo doesn't meet our requirements. Please upload a clear photo of a single pet."

        setIsValidationReject(true)
        setStatus("error")
        setMessage(rawReason)
        return
      }

      if (!data.success || !data.portrait_id) {
        setStatus("error")
        setMessage("We couldn't start your portrait. Please try again in a moment.")
        return
      }

      const rawId = typeof data.portrait_id === "string" ? data.portrait_id.trim() : ""
      setResultPortraitId(rawId.startsWith("=") ? rawId.slice(1) : rawId)
      setResultPetName(resolvedPetName)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  // Trigger image validation / n8n workflow without going through the step 3 form submit.
  function handleCheckImage() {
    // Record that the user has already passed consent, so we don't show checkboxes again on retry.
    if (ageConfirm && agreeTerms) {
      setHasConsented(true)
    }
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
    setHasConsented(false)
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
  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId)

  const effectivePackEmail = emailFromQuery
  const showPackFlow = portraitsRemaining != null && portraitsRemaining > 0 && effectivePackEmail

  // [Pet Name] for copy — "their" when no name
  const petNameDisplay = petName.trim()
  const theirOrName = petNameDisplay ? `${petNameDisplay}'s` : "their"
  const pageTitle = petNameDisplay ? `Create ${petNameDisplay}'s portrait` : "Create your portrait"
  const cleanedRejectionMessage = cleanValidatorMessage(message)

  async function handleApplyVoucher() {
    const code = voucherCode.trim()
    if (!code) {
      setVoucherStatus("invalid")
      setVoucherMessage("Please enter a code.")
      setPromotionCodeId(null)
      return
    }
    setVoucherStatus("loading")
    setVoucherMessage("")
    setPromotionCodeId(null)
    try {
      const res = await fetch("/api/validate-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.valid) {
        setVoucherStatus("invalid")
        setVoucherMessage(
          typeof data.error === "string" && data.error ? data.error : "This code is not valid",
        )
        setPromotionCodeId(null)
        return
      }
      setVoucherStatus("valid")
      setPromotionCodeId(typeof data.promotionCodeId === "string" ? data.promotionCodeId : null)
      const appliedCode = (data.code as string | undefined) ?? code.toUpperCase()
      const discountText =
        typeof data.discountText === "string" && data.discountText
          ? data.discountText
          : "discount applied"
      setVoucherMessage(`✓ ${appliedCode} applied — ${discountText}`)
    } catch {
      setVoucherStatus("invalid")
      setVoucherMessage("We couldn't validate this code. Please try again.")
      setPromotionCodeId(null)
    }
  }

  // Show wizard only when idle or error (and not after submit)
  const showWizard = status === "idle" || status === "error"
  const progressPercent = showWizard ? (wizardStep / 3) * 100 : 100

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {portraitsRemaining !== null && portraitsRemaining > 0 && (
        <div className="w-full bg-primary/10 border-b border-primary/20 px-4 py-3 text-center text-sm">
          🐾 Welcome back! You have{" "}
          <strong>
            {portraitsRemaining} portrait
            {portraitsRemaining !== 1 ? "s" : ""} remaining
          </strong>
          . No payment needed at the end.
        </div>
      )}

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
                            "mx-1.5 h-0.5 w-6 rounded-organic-sm transition-colors duration-300 sm:w-8",
                            wizardStep > s.id ? "bg-primary" : "bg-border",
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
                        themes.map((t, index) => {
                          const { id, name, previewUrl } = t
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setTheme(id)}
                              className={cn(
                                "group relative overflow-hidden rounded-organic border-2 text-left transition-all duration-200 hover:border-primary/60 hover:shadow-md",
                                theme === id
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border bg-card"
                              )}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <div className="relative w-full h-40 overflow-hidden rounded-organic-sm bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewUrl}
                                  alt={name}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                                {theme === id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-organic-sm bg-primary text-primary-foreground">
                                      <Check className="h-4 w-4" />
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="p-2.5">
                                <span className="font-heading font-semibold text-foreground">{name}</span>
                              </div>
                            </button>
                          )
                        })
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
                        className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                      >
                        Next — upload their photo
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      Already have a portrait pack?{" "}
                      <Link href="/my-portraits" className="underline hover:text-foreground transition-colors">
                        Access my portraits →
                      </Link>
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
                    {isRejectionError && (
                      <div className="mb-4 rounded-organic-sm border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-left">
                        <p className="text-sm font-semibold text-foreground">Oops — this photo won&apos;t work</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {cleanedRejectionMessage ||
                            "It looks like there might be more than one pet, a person, or another object in the frame."}
                        </p>
                        <p className="mt-2 text-xs text-foreground">
                          Let&apos;s try that again with one clear photo of just your pet.
                        </p>
                      </div>
                    )}
                    <h2 className="text-xl font-semibold text-foreground">
                      Upload {theirOrName} photo
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      One clear photo is all we need. We&apos;ll check it first, so there are no surprises or money wasted.
                    </p>
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
                    {/* Consent under the upload box – first pass only */}
                    {!hasConsented && (
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
                    )}
                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCheckImage}
                        disabled={!file || (!hasConsented && (!ageConfirm || !agreeTerms))}
                        className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                      >
                        Continue — check image
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 currently unused – payment happens after validation success section below */}
              </div>

              {/* Error state — only when wizard is shown and there's an error (non-validator errors only) */}
              {status === "error" && message && !isRejectionError && (
                <div
                  className={cn(
                    "mt-6 animate-in fade-in-0 duration-300",
                    "rounded-organic-sm border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
                  )}
                  role="alert"
                >
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="text-sm">{message}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Processing – validation only */}
          {status === "processing" && (
            <div className="animate-in fade-in-0 duration-300 flex flex-col items-center justify-center py-16 text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-organic-pill border-2 border-primary/40 bg-primary/5 shadow-sm">
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
                  <span
                    key={i}
                    className="h-2 w-2 rounded-organic-sm bg-primary animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success — validation passed, now move to payment or use pack */}
          {status === "success" && resultPortraitId && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center py-10 text-center">
              <p className="text-lg font-semibold text-foreground">
                {petNameDisplay ? `${petNameDisplay} is looking great` : "This photo is looking great"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                {showPackFlow
                  ? "Use one portrait from your pack — no payment needed."
                  : "We're confident this will make a stunning portrait. Choose your package and continue to payment."}
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
                    <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-organic-sm bg-emerald-500 text-white shadow-md">
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

              {/* When user has remaining portraits + email: single CTA, no package selection */}
              {showPackFlow ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Button
                    onClick={async () => {
                      if (!resultPortraitId) return
                      setCheckoutStatus("submitting")
                      setCheckoutError("")
                      // Fire WF2 before redirecting — returning customers skip Stripe so no webhook fires
                      await fetch("/api/trigger-generation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          portrait_id: resultPortraitId,
                          email: effectivePackEmail,
                        }),
                      })
                      // Redirect to success page to wait for portrait preview
                      router.push(
                        `/checkout/success?portrait=${encodeURIComponent(resultPortraitId)}&email=${encodeURIComponent(effectivePackEmail)}`,
                      )
                    }}
                    disabled={checkoutStatus === "submitting"}
                    className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                  >
                    {checkoutStatus === "submitting" ? "Taking you there…" : "Use 1 portrait from my pack →"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    No charge. We&apos;ll use one of your remaining portraits.
                  </p>
                  <Button variant="outline" onClick={handleReset} className="mt-2 rounded-organic-sm">
                    Start over with a different photo
                  </Button>
                </div>
              ) : (
                <>
                  {/* Package selection — only for new customers */}
                  <div className="mt-8 w-full max-w-xl text-left">
                    <p className="text-sm font-medium text-foreground mb-3 text-center sm:text-left">
                      Choose your package
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProductId(p.id)}
                          className={cn(
                            "rounded-organic-sm border-2 p-4 text-left transition-all",
                            selectedProductId === p.id
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/50",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">{p.name}</span>
                            {selectedProductId === p.id && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">{p.priceDisplay}</span>
                            {p.savePercent != null && (
                              <span className="text-xs font-medium text-primary">Save {p.savePercent}%</span>
                            )}
                          </div>
                          {p.badge && (
                            <span className="mt-2 inline-block rounded-organic-sm bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              {p.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {checkoutError && (
                    <p className="mt-4 text-sm text-destructive max-w-md">{checkoutError}</p>
                  )}

                  {/* Voucher code input */}
                  <div className="mt-6 w-full max-w-xl text-left">
                    <div className="rounded-organic-sm border border-border bg-muted/30 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">Have a discount code?</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enter it here before continuing to payment.
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value)
                            if (voucherStatus !== "idle") {
                              setVoucherStatus("idle")
                              setVoucherMessage("")
                              setPromotionCodeId(null)
                            }
                          }}
                          placeholder="Enter discount code"
                          className="w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={voucherStatus === "loading"}
                          onClick={handleApplyVoucher}
                          className="mt-1 inline-flex items-center justify-center rounded-organic-sm px-4 py-2 text-sm font-semibold sm:mt-0"
                        >
                          {voucherStatus === "loading" ? "Checking…" : "Apply"}
                        </Button>
                      </div>
                      {voucherMessage && (
                        <p
                          className={cn(
                            "mt-2 text-xs",
                            voucherStatus === "valid"
                              ? "text-emerald-600"
                              : voucherStatus === "invalid"
                                ? "text-destructive"
                                : "text-muted-foreground",
                          )}
                        >
                          {voucherMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-3">
                    <Button
                      onClick={async () => {
                        if (!resultPortraitId) return
                        setCheckoutStatus("submitting")
                        setCheckoutError("")

                        try {
                          const res = await fetch("/api/create-checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              product_id: selectedProductId,
                              portrait_id: resultPortraitId,
                              ...(theme && { theme }),
                              ...(promotionCodeId && { promotionCodeId }),
                            }),
                          })
                          const data = await res.json().catch(() => ({}))
                          if (!res.ok || !data.url) {
                            setCheckoutStatus("error")
                            setCheckoutError(data.error || "We couldn't start checkout. Please try again in a moment.")
                            return
                          }
                          window.location.href = data.url as string
                        } catch (err) {
                          setCheckoutStatus("error")
                          setCheckoutError(err instanceof Error ? err.message : "We couldn't start checkout. Please try again.")
                        }
                      }}
                      disabled={checkoutStatus === "submitting"}
                      className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                    >
                      {checkoutStatus === "submitting"
                        ? "Connecting to Stripe…"
                        : selectedProduct
                          ? `Continue to payment — ${selectedProduct.priceDisplay}`
                          : "Continue to payment"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Secure Stripe payment · One-time purchase · No subscription.
                    </p>
                    <Button variant="outline" onClick={handleReset} className="mt-2 rounded-organic-sm">
                      Start over with a different photo
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function CreatePortraitPage() {
  return (
    <Suspense fallback={<CreatePageFallback />}>
      <CreatePortraitContent />
    </Suspense>
  )
}
