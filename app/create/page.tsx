"use client"

import ReactDOM from "react-dom"
import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Check, Camera, AlertCircle, ChevronRight, ChevronLeft, ZoomIn, X } from "lucide-react"
import { PRODUCTS, type Product, type ProductId } from "@/lib/products"
import { themeIds } from "@/lib/themes"
import { initiateCheckout } from "@/lib/fpixel"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type Status =
  | "idle"
  | "uploading"
  | "processing"
  | "generating"
  | "preview"
  | "success"
  | "delivered"
  | "error"

const WIZARD_STEPS = [
  { id: 1, label: "Choose a theme", short: "1" },
  { id: 2, label: "Upload their photo", short: "2" },
  { id: 3, label: "Pay & create", short: "3" },
] as const

type ThemeItem = { id: string; name: string; previewUrl: string }

const themePersonalisation: Record<string, { withName: (n: string) => string; fallback: string }> = {
  fireman: {
    withName: (n) => `${n}'s name on the chest patch`,
    fallback: "Your pet's name on the chest patch",
  },
  police: {
    withName: (n) => `${n}'s name on the badge`,
    fallback: "Your pet's name on the badge",
  },
  admiral: {
    withName: (n) => `${n}'s name on the breast plate`,
    fallback: "Your pet's name on the breast plate",
  },
  vet: {
    withName: (n) => `Dr. ${n} on the badge`,
    fallback: "Your pet's name on the badge",
  },
  king: {
    withName: (n) => `${n}'s initial on the royal chain`,
    fallback: "Your pet's initial on the royal chain",
  },
  queen: {
    withName: (n) => `${n}'s initial in the gold amulet`,
    fallback: "Your pet's initial in the gold amulet",
  },
  samurai: {
    withName: (n) => `${n}'s initial in the armour crest`,
    fallback: "Your pet's initial in the armour crest",
  },
  pilot: {
    withName: (n) => `${n}'s name on the tag`,
    fallback: "Your pet's name on the tag",
  },
}

function cleanValidatorMessage(raw: string | null): string {
  if (!raw) return ""
  const stripped = raw.replace(/^valid:\s*no\s*[-–]\s*/i, "").trim()
  if (!stripped) return ""
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

function formatCheckoutPriceFromCents(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`
  return `$${(cents / 100).toFixed(2)}`
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
  const themeFromQuery = searchParams.get("theme")?.trim().toLowerCase() || ""
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
  const [wizardStep, setWizardStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next")
  const [isDragging, setIsDragging] = useState(false)
  const [isValidationReject, setIsValidationReject] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<ProductId>("portrait_pack")
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [checkoutError, setCheckoutError] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle")
  const [voucherMessage, setVoucherMessage] = useState("")
  const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null)
  const [voucherPercentOff, setVoucherPercentOff] = useState<number | null>(null)
  const [voucherAmountOffCents, setVoucherAmountOffCents] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [portraitsRemaining, setPortraitsRemaining] = useState<number | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [generationPortraitId, setGenerationPortraitId] = useState<string | null>(null)
  /** Raw Cloudinary `image_url` from DB — used if watermarked URL fails to load */
  const previewCloudinaryRawRef = useRef<string | null>(null)
  const portraitPreviewShownRef = useRef(false)
  const packageViewedPreviewRef = useRef(false)
  const packageViewedSuccessRef = useRef(false)
  const [lightboxTheme, setLightboxTheme] = useState<ThemeItem | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!themeFromQuery || !themeIds.includes(themeFromQuery)) return
    setTheme(themeFromQuery)
  }, [themeFromQuery])

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [])

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get("payment")
    const portraitIdFromUrl = params.get("portrait_id")
    if (paymentStatus === "success" && portraitIdFromUrl) {
      setResultPortraitId(portraitIdFromUrl)
      setGenerationPortraitId(portraitIdFromUrl)
      setStatus("delivered")
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
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: "create_step2_upload" })
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

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: "create_step2_image_checked" })

    setIsValidationReject(false)
    setStatus("processing")
    setMessage("Taking a look at their photo…")
    const resolvedPetName = petName.trim() || "My Pet"
    try {
      const formData = new FormData()
      formData.set("file", file)
      formData.set("theme", theme)
      if (petName.trim()) formData.set("pet_name", petName.trim())
      formData.set("showcase_consent", "false")
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
      const normalizedId = rawId.startsWith("=") ? rawId.slice(1) : rawId
      setResultPortraitId(normalizedId)
      setResultPetName(resolvedPetName)
      window.gtag?.("event", "create_step2_complete", {
        theme: theme ?? "",
      })
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'create_step2_complete' })
      window.dataLayer.push({ event: "photo_uploaded" })
      const packCustomer =
        portraitsRemaining != null && portraitsRemaining > 0 && emailFromQuery.trim().length > 0
      if (packCustomer) {
        setStatus("success")
      } else {
        void handleTriggerPreview(normalizedId)
      }
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  // Trigger image validation / n8n workflow without going through the step 3 form submit.
  function handleCheckImage() {
    void handleSubmit({ preventDefault() {} } as unknown as React.FormEvent)
  }

  async function handleTriggerPreview(portraitId: string) {
    setStatus("generating")
    try {
      const res = await fetch("/api/trigger-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portrait_id: portraitId,
          pet_name: petName.trim(),
          theme: theme ?? "",
          pet_image_url: previewUrl ?? "",
          user_email: "",
          showcase_consent: false,
        }),
      })
      if (!res.ok) {
        setStatus("error")
        setMessage("Something went wrong starting your portrait. Please try again.")
        return
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      const pollStart = Date.now()
      pollIntervalRef.current = setInterval(async () => {
        if (Date.now() - pollStart > 180000) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          setStatus("error")
          setMessage("Portrait generation is taking longer than expected. Please try again.")
          return
        }
        try {
          const { data } = await supabase
            .from("pet_portraits")
            .select("status, image_url")
            .eq("id", portraitId)
            .single()
          if (data?.status === "preview" && data?.image_url) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            const raw = String(data.image_url).trim()
            previewCloudinaryRawRef.current = raw
            setPreviewImageUrl(applyWatermark(raw))
            setGenerationPortraitId(portraitId)
            setStatus("preview")
          }
        } catch {
          // keep polling on fetch errors
        }
      }, 4000)
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
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
    setIsValidationReject(false)
    setWizardStep(1)
    setMessage("")
    setResultPetName(null)
    setResultPortraitId(null)
    setPreviewImageUrl(null)
    previewCloudinaryRawRef.current = null
    setGenerationPortraitId(null)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    setPreviewError(false)
    setAgreeTerms(false)
    setAgeConfirm(false)
    fileInputRef.current && (fileInputRef.current.value = "")
    portraitPreviewShownRef.current = false
    packageViewedPreviewRef.current = false
    packageViewedSuccessRef.current = false
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

  // NOTE on which URL to use for the preview: The image_url stored by WF2B is the
  // AVIF preview generated from the Gemini output. This is always in landscape ratio.
  // Use image_url directly — do not attempt to derive a portrait crop URL. One image, one reveal.
  function applyWatermark(cloudinaryUrl: string): string {
    const tile =
      "l_text:Arial_28_bold:FluffyFriends,co_white,o_30,g_north_west,x_30,y_40/" +
      "l_text:Arial_28_bold:FluffyFriends,co_white,o_30,g_north_east,x_30,y_40/" +
      "l_text:Arial_28_bold:FluffyFriends,co_white,o_30,g_south_west,x_30,y_40/" +
      "l_text:Arial_28_bold:FluffyFriends,co_white,o_30,g_south_east,x_30,y_40/" +
      "l_text:Arial_28_bold:FluffyFriends,co_white,o_30,g_center,angle_-20/"
    return cloudinaryUrl.replace("/image/upload/", `/image/upload/${tile}`)
  }

  function goNext() {
    if (wizardStep === 1) {
      if (!petName.trim() || !theme) return
      window.gtag?.("event", "create_step1_complete", {
        theme,
        pet_name: petName.trim(),
      })
      window.gtag?.("event", "checkout_started", {
        theme,
        pet_name: petName.trim(),
      })
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: "create_step1_complete" })
      window.dataLayer.push({ event: "checkout_started", theme, pet_name: petName.trim() })
    }
    setSlideDirection("next")
    setWizardStep((s) => Math.min(3, s + 1))
  }

  function handleProceedToUpload() {
    goNext()
  }

  function goPrev() {
    setSlideDirection("prev")
    setWizardStep((s) => Math.max(1, s - 1))
  }

  const isRejectionError = status === "error" && isValidationReject

  const selectedTheme = themes.find((t) => t.id === theme)
  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId)

  const previewCheckoutPriceDisplay = useMemo(() => {
    if (!selectedProduct) return null
    if (voucherStatus !== "valid" || !promotionCodeId) return selectedProduct.priceDisplay
    let cents = selectedProduct.priceCents
    if (typeof voucherPercentOff === "number") {
      cents = Math.round((cents * (100 - voucherPercentOff)) / 100)
    }
    if (typeof voucherAmountOffCents === "number") {
      cents = Math.max(0, cents - voucherAmountOffCents)
    }
    return formatCheckoutPriceFromCents(cents)
  }, [selectedProduct, voucherStatus, promotionCodeId, voucherPercentOff, voucherAmountOffCents])

  const effectivePackEmail = emailFromQuery
  const showPackFlow = portraitsRemaining != null && portraitsRemaining > 0 && effectivePackEmail

  useEffect(() => {
    if (status !== "preview" || !previewImageUrl) return
    if (portraitPreviewShownRef.current) return
    portraitPreviewShownRef.current = true
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "portrait_preview_shown",
      theme_name: theme ?? "",
    })
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "ViewContent")
    }
  }, [status, previewImageUrl, theme])

  useEffect(() => {
    if (status !== "preview" || !previewImageUrl) return
    if (packageViewedPreviewRef.current) return
    packageViewedPreviewRef.current = true
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "package_viewed",
      default_package: "portrait_pack",
    })
  }, [status, previewImageUrl])

  useEffect(() => {
    if (status !== "success" || !resultPortraitId || showPackFlow) return
    if (packageViewedSuccessRef.current) return
    packageViewedSuccessRef.current = true
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "package_viewed",
      default_package: "portrait_pack",
    })
  }, [status, resultPortraitId, showPackFlow])

  function pushPackageSelected(product: Product) {
    if (product.id === selectedProductId) return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "package_changed",
      package_selected: product.id,
      package_price: product.priceDisplay,
    })
    setSelectedProductId(product.id)
  }

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
      setVoucherPercentOff(null)
      setVoucherAmountOffCents(null)
      return
    }
    setVoucherStatus("loading")
    setVoucherMessage("")
    setPromotionCodeId(null)
    setVoucherPercentOff(null)
    setVoucherAmountOffCents(null)
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
        setVoucherPercentOff(null)
        setVoucherAmountOffCents(null)
        return
      }
      setVoucherStatus("valid")
      setPromotionCodeId(typeof data.promotionCodeId === "string" ? data.promotionCodeId : null)
      setVoucherPercentOff(typeof data.percent_off === "number" ? data.percent_off : null)
      setVoucherAmountOffCents(typeof data.amount_off === "number" ? data.amount_off : null)
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
      setVoucherPercentOff(null)
      setVoucherAmountOffCents(null)
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
          <a
            href="/"
            className="z-40 text-sm text-muted-foreground transition-colors hover:text-foreground max-md:fixed max-md:right-4 max-md:top-[4.75rem] md:static md:top-auto md:right-auto md:z-auto md:mb-6 md:block"
          >
            ← Back to home
          </a>

          <div className="mt-12 md:mt-0">
          {showWizard && (
            <>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {pageTitle}
              </h1>
              <p className="mt-1 hidden text-sm text-muted-foreground md:block">
                Takes less than three minutes. No tech skills needed.
              </p>
              {/* Step indicator — minimal, not a blob */}
              <div className="mt-6 hidden items-center justify-center gap-2 md:flex" aria-label="Progress">
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

              {/* Single step content with motion — z-0 keeps scroll content below fixed bars (back z-40, CTA z-30) */}
              <div className="relative z-0 mt-10 min-h-[320px] overflow-hidden">
                {/* Step 1 — Choose style */}
                {wizardStep === 1 && (
                  <div
                    key="step1"
                    className={cn(
                      "animate-in fade-in-0 duration-300 pb-24 md:pb-0",
                      slideDirection === "next" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                    )}
                  >
                    <h2 className="text-xl font-semibold text-foreground">What&apos;s their name?</h2>
                    <p className="mt-1 hidden text-sm text-muted-foreground md:block">
                      Exactly as you&apos;d like it to appear in the portrait
                    </p>
                    <div className="mt-3">
                      <label
                        htmlFor="pet-name-step1"
                        className="mb-0 hidden text-sm font-medium text-foreground md:block"
                      >
                        Your pet&apos;s name (required)
                      </label>
                      <input
                        id="pet-name-step1"
                        type="text"
                        required
                        value={petName}
                        aria-label="Your pet's name (required)"
                        onFocus={() => {
                          window.dataLayer = window.dataLayer || []
                          window.dataLayer.push({ event: "pet_name_entered" })
                        }}
                        onChange={(e) => setPetName(e.target.value.slice(0, 12))}
                        maxLength={12}
                        placeholder="Your pet's name"
                        className="mt-1.5 w-full rounded-organic-sm border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        aria-invalid={Boolean(theme && !petName.trim())}
                        aria-describedby={theme && !petName.trim() ? "pet-name-step1-error" : undefined}
                      />
                      {theme && !petName.trim() ? (
                        <p id="pet-name-step1-error" className="mt-1.5 text-sm text-destructive" role="alert">
                          Please enter your pet&apos;s name
                        </p>
                      ) : null}
                    </div>
                    <h2 className="mt-8 text-xl font-semibold text-foreground">What&apos;s their theme?</h2>
                    <p className="mt-1 text-sm font-medium text-foreground">Pick their vibe</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {themes.length === 0 ? (
                        <div className="col-span-full grid grid-cols-2 gap-3 md:grid-cols-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                              key={i}
                              className="h-[196px] animate-pulse overflow-hidden rounded-[10px] border border-border bg-muted"
                            />
                          ))}
                        </div>
                      ) : (
                        themes.map((t, index) => {
                          const { id, name, previewUrl } = t
                          const selected = theme === id
                          const trimmedName = petName.trim()
                          const personalisation = themePersonalisation[id] ?? themePersonalisation.fireman
                          const personalisationLine = trimmedName
                            ? personalisation.withName(trimmedName)
                            : personalisation.fallback

                          return (
                            <div
                              key={id}
                              className={`relative flex flex-col overflow-hidden rounded-organic border bg-card transition-all duration-200 ${
                                selected
                                  ? "border-[3px] border-primary opacity-100 shadow-sm"
                                  : "border border-border opacity-80"
                              }`}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <div className="relative h-[140px] w-full overflow-hidden bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewUrl}
                                  alt={name}
                                  className="h-full w-full object-cover object-top transition-transform duration-300"
                                  loading="lazy"
                                />
                                <button
                                  type="button"
                                  aria-label={`Preview ${name}`}
                                  onClick={() => setLightboxTheme({ id, name, previewUrl })}
                                  className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-organic-sm bg-black/50 text-white transition-colors hover:bg-black/70"
                                >
                                  <ZoomIn className="h-4 w-4" aria-hidden />
                                </button>
                                {selected && (
                                  <span
                                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-organic-sm bg-primary text-primary-foreground shadow-md"
                                    aria-hidden
                                  >
                                    <Check className="h-4 w-4" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 p-2">
                                <span className="font-heading text-sm font-semibold text-foreground">{name}</span>
                                <span className="text-xs leading-snug text-primary">{personalisationLine}</span>
                              </div>
                              <div className="px-2 pb-2">
                                <button
                                  type="button"
                                  disabled={selected}
                                  onClick={() => {
                                    setTheme(id)
                                    window.dataLayer = window.dataLayer || []
                                    window.dataLayer.push({
                                      event: "theme_selected",
                                      theme_name: id,
                                    })
                                  }}
                                  className={`w-full rounded-organic py-1.5 text-sm font-semibold text-white transition-all duration-200 ${
                                    selected
                                      ? "cursor-default bg-primary"
                                      : "bg-gradient-to-r from-primary to-orange-400 hover:opacity-90"
                                  }`}
                                >
                                  {selected ? "Selected \u2713" : "Select"}
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {petName.trim() && theme ? (
                      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 md:static md:border-t-0 md:mt-8 md:bg-transparent md:p-0 md:z-auto">
                        <Button
                          type="button"
                          data-gtm="create-step1-next"
                          onClick={handleProceedToUpload}
                          className="h-auto w-full rounded-organic-sm bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-primary/40 transition-colors hover:bg-primary/90 md:mx-auto md:max-w-md"
                        >
                          {`Let's upload ${petName.trim()}'s photo`}
                        </Button>
                      </div>
                    ) : null}
                    {lightboxTheme ? ReactDOM.createPortal(
                          <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                            onClick={() => setLightboxTheme(null)}
                            role="presentation"
                          >
                            <div
                              className="relative flex w-full max-w-sm max-h-[85vh] flex-col overflow-hidden rounded-organic bg-background shadow-2xl"
                              onClick={(e) => e.stopPropagation()}
                              role="dialog"
                              aria-modal="true"
                              aria-labelledby="lightbox-theme-title"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={lightboxTheme.previewUrl}
                                alt={lightboxTheme.name}
                                className="h-auto w-full max-h-[65vh] shrink-0 object-cover object-top"
                              />
                              <div className="shrink-0 bg-gradient-to-r from-primary to-orange-400 px-4 py-3">
                                <p id="lightbox-theme-title" className="text-base font-bold text-white">
                                  {lightboxTheme.name}
                                </p>
                                <p className="text-sm text-white/90">
                                  {(() => {
                                    const trimmed = petName.trim()
                                    const p =
                                      themePersonalisation[lightboxTheme.id] ?? themePersonalisation.fireman
                                    return trimmed ? p.withName(trimmed) : p.fallback
                                  })()}
                                </p>
                              </div>
                              <button
                                type="button"
                                aria-label="Close preview"
                                onClick={() => setLightboxTheme(null)}
                                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                              >
                                <X className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          </div>,
                          document.body,
                        )
                      : null}
                    <p className="mt-8 text-center text-sm text-muted-foreground">
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
                        "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-primary bg-primary/[0.04] py-10 transition-colors",
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary/90 hover:bg-primary/[0.08]"
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
                          <Camera className="h-12 w-12 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                          <span className="mt-2 text-sm font-medium text-foreground">
                            Drop {theirOrName} photo here, or click to browse
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">JPG or PNG · Up to 10 MB</span>
                        </>
                      )}
                    </label>
                    <h3 className="mt-6 text-base font-semibold text-foreground">
                      Any photo works — here&apos;s what gives the best result 🐾
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          ✓
                        </span>
                        <span>Face clearly visible and front-facing</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          ✓
                        </span>
                        <span>One pet only in the photo</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          ✓
                        </span>
                        <span>No humans in the frame</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          ✓
                        </span>
                        <span>Simple background works best</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary" aria-hidden>
                          ✓
                        </span>
                        <span>Natural light if possible</span>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      These are tips, not rules. Upload your best photo and we will let you know if it works.
                    </p>
                    <div className="mt-6 flex justify-between">
                      <Button type="button" variant="outline" onClick={goPrev} className="rounded-organic-sm">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        data-gtm="create-step2-next"
                        onClick={handleCheckImage}
                        disabled={!file}
                        className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                      >
                        Continue
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

          {status === "generating" && (
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
                Creating {petName.trim() ? `${petName.trim()}'s` : "your"} portrait now...
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This takes about a minute. Stay with us.
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

          {status === "preview" && previewImageUrl && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center py-10">
              <div className="mb-6 flex w-full items-center justify-center gap-0 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-organic-sm bg-primary text-[10px] font-bold text-primary-foreground">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-muted-foreground">Pick a theme</span>
                </div>
                <div className="mx-3 h-px w-6 flex-shrink-0 bg-primary" />
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-organic-sm bg-primary text-[10px] font-bold text-primary-foreground">
                    2
                  </span>
                  <span className="font-medium text-foreground">Your preview</span>
                </div>
                <div className="mx-3 h-px w-6 flex-shrink-0 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-organic-sm bg-muted text-[10px] font-bold text-muted-foreground">
                    3
                  </span>
                  <span className="text-muted-foreground">Get your portrait</span>
                </div>
              </div>
              <h2 className="font-heading mb-2 text-center text-3xl font-extrabold tracking-tight text-foreground">
                {petNameDisplay ? `${petNameDisplay}'s` : "Your pet's"} portrait is ready.
              </h2>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                This is your preview. Unlock the full resolution below.
              </p>
              <div className="relative w-full max-w-lg overflow-hidden rounded-[16px] border-4 border-primary/80 shadow-2xl ring-4 ring-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt={`${petName.trim() || "Pet"} — landscape preview`}
                  className="w-full select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  onError={() => {
                    const raw = previewCloudinaryRawRef.current
                    if (!raw) return
                    setPreviewImageUrl((current) => (current === raw ? current : raw))
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 select-none"
                  style={{
                    background: `repeating-linear-gradient(
                      -35deg,
                      transparent,
                      transparent 60px,
                      rgba(255,255,255,0.07) 60px,
                      rgba(255,255,255,0.07) 61px
                    )`,
                  }}
                >
                  {[
                    { top: "8%", left: "5%", rotate: -25 },
                    { top: "8%", left: "58%", rotate: -25 },
                    { top: "22%", left: "30%", rotate: -25 },
                    { top: "36%", left: "5%", rotate: -25 },
                    { top: "36%", left: "58%", rotate: -25 },
                    { top: "50%", left: "30%", rotate: -25 },
                    { top: "64%", left: "5%", rotate: -25 },
                    { top: "64%", left: "58%", rotate: -25 },
                    { top: "78%", left: "30%", rotate: -25 },
                  ].map((pos, i) => (
                    <span
                      key={i}
                      className="pointer-events-none absolute select-none text-sm font-bold tracking-widest text-white/20"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        transform: `rotate(${pos.rotate}deg)`,
                        whiteSpace: "nowrap",
                        maxWidth: "none",
                        overflow: "visible",
                      }}
                    >
                      FluffyFriends
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Full resolution · Both formats included · Watermark removed after purchase
              </p>
              <p className="mt-1.5 max-w-md text-center text-xs text-muted-foreground/70">
                The AI adapts each portrait to your pet&apos;s unique features. The final result may differ
                slightly from this preview.
              </p>
              <div className="mt-8 w-full max-w-xl">
                <div className="mb-5 flex items-start gap-3 rounded-[12px] border border-primary/30 bg-primary/5 px-4 py-3">
                  <span className="mt-0.5 text-primary">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Free print guide included with every order</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Covers paper types, frame sizes, and the best local and online print shops. Yours at any
                      package level.
                    </p>
                  </div>
                </div>
                <p className="mb-3 text-center text-sm font-medium text-foreground sm:text-left">
                  Choose your package
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pushPackageSelected(p)}
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
                      onFocus={() => {
                        window.dataLayer = window.dataLayer || []
                        window.dataLayer.push({ event: "discount_code_attempted" })
                      }}
                      onChange={(e) => {
                        setVoucherCode(e.target.value)
                        if (voucherStatus !== "idle") {
                          setVoucherStatus("idle")
                          setVoucherMessage("")
                          setPromotionCodeId(null)
                          setVoucherPercentOff(null)
                          setVoucherAmountOffCents(null)
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

              <Button
                className="mt-4 w-full max-w-xl inline-flex items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto mx-auto"
                onClick={async () => {
                  if (!generationPortraitId) return
                  setCheckoutStatus("submitting")
                  setCheckoutError("")
                  try {
                    window.dataLayer = window.dataLayer || []
                    window.dataLayer.push({
                      event: "checkout_initiated",
                      package: selectedProductId,
                      theme_name: theme ?? "",
                    })
                    if (typeof window !== "undefined" && typeof window.fbq === "function") {
                      window.fbq("track", "InitiateCheckout")
                    }
                    const res = await fetch("/api/create-checkout-v2", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        product_id: selectedProductId,
                        portrait_id: generationPortraitId,
                        ...(theme && { theme }),
                        ...(promotionCodeId && { promotionCodeId }),
                      }),
                    })
                    const data = await res.json().catch(() => ({}))
                    if (!res.ok || !data.url) {
                      setCheckoutStatus("error")
                      setCheckoutError(
                        typeof data.error === "string" && data.error
                          ? data.error
                          : "We could not start checkout. Please try again.",
                      )
                      return
                    }
                    window.dataLayer = window.dataLayer || []
                    window.dataLayer.push({ event: "create_step3_checkout" })
                    window.location.href = data.url as string
                  } catch {
                    setCheckoutStatus("error")
                    setCheckoutError("We could not start checkout. Please try again.")
                  }
                }}
                disabled={checkoutStatus === "submitting"}
              >
                {checkoutStatus === "submitting"
                  ? "Connecting to Stripe..."
                  : selectedProduct && previewCheckoutPriceDisplay
                    ? `Unlock my portrait — ${previewCheckoutPriceDisplay}`
                    : "Unlock my portrait"}
              </Button>
            </div>
          )}

          {status === "delivered" && resultPortraitId && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-organic-sm bg-emerald-500/15">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="font-heading mb-2 text-2xl font-bold text-foreground">Payment confirmed.</h2>
              <p className="mb-8 max-w-sm text-sm text-muted-foreground">
                Your portrait is being upscaled to full resolution. You will receive an email with your
                download links within a few minutes.
              </p>
              <p className="mb-6 text-xs text-muted-foreground">Portrait ID: {resultPortraitId}</p>
              <Link
                href="/my-portraits"
                className="inline-flex items-center gap-2 rounded-organic-sm bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02]"
              >
                View my portraits
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  previewCloudinaryRawRef.current = null
                  setStatus("idle")
                  setWizardStep(1)
                  setTheme(null)
                  setPetName("")
                  setFile(null)
                  setPreviewUrl(null)
                  setResultPortraitId(null)
                  setGenerationPortraitId(null)
                  setPreviewImageUrl(null)
                  window.history.replaceState({}, "", "/create")
                }}
                className="mt-4 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Create another portrait
              </button>
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
                <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
                  <div className="w-full space-y-2.5 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3 text-left">
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={ageConfirm}
                        onCheckedChange={(c) => setAgeConfirm(c === true)}
                        className="mt-0.5 rounded border-2"
                        aria-required
                      />
                      <span className="text-sm text-muted-foreground">
                        I&apos;m 18 or older{" "}
                        <span className="text-xs">(required to purchase online)</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={agreeTerms}
                        onCheckedChange={(c) => setAgreeTerms(c === true)}
                        className="mt-0.5 rounded border-2"
                        aria-required
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree with the{" "}
                        <a href="/terms" className="text-primary underline hover:no-underline">
                          Terms &amp; Conditions
                        </a>
                      </span>
                    </label>
                  </div>
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
                    disabled={checkoutStatus === "submitting" || !ageConfirm || !agreeTerms}
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
                          onClick={() => pushPackageSelected(p)}
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
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
                      Not happy with your portrait? We will recreate it or refund your credit.
                    </p>
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
                          onFocus={() => {
                            window.dataLayer = window.dataLayer || []
                            window.dataLayer.push({ event: "discount_code_attempted" })
                          }}
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

                  <div className="mt-6 w-full max-w-xl space-y-2.5 rounded-organic-sm border border-border/60 bg-muted/20 px-4 py-3 text-left mx-auto">
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={ageConfirm}
                        onCheckedChange={(c) => setAgeConfirm(c === true)}
                        className="mt-0.5 rounded border-2"
                        aria-required
                      />
                      <span className="text-sm text-muted-foreground">
                        I&apos;m 18 or older{" "}
                        <span className="text-xs">(required to purchase online)</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={agreeTerms}
                        onCheckedChange={(c) => setAgreeTerms(c === true)}
                        className="mt-0.5 rounded border-2"
                        aria-required
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree with the{" "}
                        <a href="/terms" className="text-primary underline hover:no-underline">
                          Terms &amp; Conditions
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-3">
                    <Button
                      data-gtm="create-step3-checkout"
                      onClick={async () => {
                        if (!resultPortraitId) return
                        setCheckoutStatus("submitting")
                        setCheckoutError("")

                        try {
                          window.dataLayer = window.dataLayer || []
                          window.dataLayer.push({
                            event: "checkout_initiated",
                            package: selectedProductId,
                            theme_name: theme ?? "",
                          })
                          if (typeof window !== "undefined" && typeof window.fbq === "function") {
                            window.fbq("track", "InitiateCheckout")
                          }
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
                          window.gtag?.("event", "create_step3_view", {
                            theme: theme ?? "",
                            package: selectedProductId,
                          })
                          initiateCheckout()
                          window.dataLayer = window.dataLayer || []
                          window.dataLayer.push({ event: "create_step3_checkout" })
                          window.location.href = data.url as string
                        } catch (err) {
                          setCheckoutStatus("error")
                          setCheckoutError(err instanceof Error ? err.message : "We couldn't start checkout. Please try again.")
                        }
                      }}
                      disabled={checkoutStatus === "submitting" || !ageConfirm || !agreeTerms}
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
