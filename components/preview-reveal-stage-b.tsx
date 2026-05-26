"use client"

import ReactDOM from "react-dom"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, Search, X } from "lucide-react"
import { PRODUCTS, type Product, type ProductId } from "@/lib/products"
import { funnelDatalayerPayload } from "@/lib/funnel-datalayer"
import { formatPortraitHoldExpiry } from "@/lib/format-portrait-hold-expiry"

function formatCheckoutPriceFromCents(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`
  return `$${(cents / 100).toFixed(2)}`
}

function possessiveFormPet(name: string): string {
  const t = name.trim()
  if (!t) return ""
  return /s$/i.test(t) ? `${t}'` : `${t}'s`
}

export type PreviewRevealStageBProps = {
  portraitId: string
  theme: string | null
  petNameTrimmed: string
  watermarkLandscapeSrc: string
  watermarkPortraitSrc: string
  rawFallbackUrl: string | null
  /** ISO from `pet_portraits.created_at` — drives 48h hold expiry line */
  portraitCreatedAtIso?: string | null
  /**
   * Default selected package before the customer taps a tier.
   * `/preview/[id]` uses `starter` so the mobile sticky CTA matches Starter ($17); `/create` keeps `portrait_pack`.
   */
  defaultProductId?: ProductId
  /** Appended to the price on the **mobile sticky** checkout button only (e.g. " USD"). */
  mobileStickyPriceSuffix?: string
}

export function PreviewRevealStageB({
  portraitId,
  theme,
  petNameTrimmed,
  watermarkLandscapeSrc,
  watermarkPortraitSrc,
  rawFallbackUrl,
  portraitCreatedAtIso,
  defaultProductId = "portrait_pack",
  mobileStickyPriceSuffix,
}: PreviewRevealStageBProps) {
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(defaultProductId)
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [checkoutError, setCheckoutError] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle")
  const [voucherMessage, setVoucherMessage] = useState("")
  const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null)
  const [voucherPercentOff, setVoucherPercentOff] = useState<number | null>(null)
  const [voucherAmountOffCents, setVoucherAmountOffCents] = useState<number | null>(null)
  const [inspectModalOpen, setInspectModalOpen] = useState(false)
  const [displayLandscapeSrc, setDisplayLandscapeSrc] = useState(watermarkLandscapeSrc)
  const [savePortraitEmail, setSavePortraitEmail] = useState("")
  const [savePortraitEmailError, setSavePortraitEmailError] = useState("")
  const [savePortraitSubmitting, setSavePortraitSubmitting] = useState(false)
  const [savePortraitOk, setSavePortraitOk] = useState(false)

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

  const petNameDisplay = petNameTrimmed
  const holdExpiryText = useMemo(
    () =>
      portraitCreatedAtIso && typeof portraitCreatedAtIso === "string"
        ? formatPortraitHoldExpiry(portraitCreatedAtIso)
        : null,
    [portraitCreatedAtIso],
  )

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
        typeof data.discountText === "string" && data.discountText ? data.discountText : "discount applied"
      setVoucherMessage(`✓ ${appliedCode} applied — ${discountText}`)
    } catch {
      setVoucherStatus("invalid")
      setVoucherMessage("We couldn't validate this code. Please try again.")
      setPromotionCodeId(null)
      setVoucherPercentOff(null)
      setVoucherAmountOffCents(null)
    }
  }

  async function handleSavePortraitEmail() {
    const trimmed = savePortraitEmail.trim()
    if (!trimmed) {
      setSavePortraitEmailError("Please enter your email")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSavePortraitEmailError("Please enter a valid email address")
      return
    }
    if (!portraitId) return
    setSavePortraitSubmitting(true)
    setSavePortraitEmailError("")
    try {
      const res = await fetch("/api/save-preview-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portraitId, email: trimmed }),
      })
      if (!res.ok) {
        setSavePortraitEmailError("We couldn't save your email. Try again.")
        return
      }
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "email_captured_preview",
        ...funnelDatalayerPayload(theme, portraitId),
      })
      setSavePortraitOk(true)
    } catch {
      setSavePortraitEmailError("We couldn't save your email. Try again.")
    } finally {
      setSavePortraitSubmitting(false)
    }
  }

  function pushPackageSelected(product: Product) {
    if (product.id === selectedProductId) return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: "package_changed",
      package_selected: product.id,
      package_price: product.priceDisplay,
      ...funnelDatalayerPayload(theme, portraitId),
    })
    setSelectedProductId(product.id)
  }

  const showStickyUnlock =
    Boolean(watermarkPortraitSrc) &&
    Boolean(portraitId) &&
    Boolean(selectedProduct)

  function renderPreviewUnlockButton(opts?: {
    className?: string
    /** Suffix added to quoted price only for this renderer (sticky mobile passes " USD"). */
    priceSuffix?: string
  }) {
    const suffix = opts?.priceSuffix ?? ""
    return (
      <Button
        data-gtm="create-step3-checkout"
        className={cn(
          "inline-flex h-auto w-full items-center justify-center gap-2 rounded-organic-sm bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90",
          opts?.className,
        )}
        onClick={async () => {
          if (!portraitId) return
          setCheckoutStatus("submitting")
          setCheckoutError("")
          try {
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({
              event: "checkout_initiated",
              package: selectedProductId,
              theme_name: theme ?? "",
              ...funnelDatalayerPayload(theme, portraitId),
            })
            if (typeof window !== "undefined" && typeof window.fbq === "function") {
              window.fbq("track", "InitiateCheckout")
            }
            const res = await fetch("/api/create-checkout-v2", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: selectedProductId,
                portrait_id: portraitId,
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
            window.dataLayer.push({
              event: "create_step3_checkout",
              ...funnelDatalayerPayload(theme, portraitId),
            })
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
            ? `Unlock my portrait — ${previewCheckoutPriceDisplay}${suffix}`
            : "Unlock my portrait"}
      </Button>
    )
  }

  return (
    <>
      <div className="animate-in fade-in-0 zoom-in-95 duration-500 flex flex-col items-center pt-1 pb-6 md:pt-6 md:pb-8">
        <h1 className="font-heading mt-0.5 text-center text-2xl font-extrabold tracking-tight text-foreground md:mt-0 md:text-3xl">
          {petNameDisplay ? (
            <>
              Look at <span className="text-primary">{petNameDisplay}</span>.
            </>
          ) : (
            <>Look at them.</>
          )}
        </h1>
        <p className="mt-2 mb-3 text-center text-sm text-muted-foreground md:mb-4">
          {petNameDisplay ? (
            <>
              <span className="text-primary font-semibold">{possessiveFormPet(petNameDisplay)}</span> portrait is
              ready, unlock the full resolution below.
            </>
          ) : (
            <>Your pet&apos;s portrait is ready, unlock the full resolution below.</>
          )}
        </p>
        <div className="mt-4 mb-3 flex w-full justify-center px-3 md:mt-6 md:mb-4 md:px-0">
          <div className="relative w-full max-w-[min(100vw-1.5rem,36rem)] overflow-hidden rounded-organic border-4 border-primary bg-background shadow-lg shadow-primary/25 md:max-w-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayLandscapeSrc}
              alt={`${petNameTrimmed || "Pet"} — landscape preview`}
              className="w-full select-none object-cover"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              onError={() => {
                if (!rawFallbackUrl) return
                setDisplayLandscapeSrc((cur) => (cur === rawFallbackUrl ? cur : rawFallbackUrl))
              }}
            />
            <button
              type="button"
              onClick={() => setInspectModalOpen(true)}
              aria-label="Inspect portrait details"
              className="absolute top-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 md:top-4 md:right-4 md:h-14 md:w-14"
            >
              <Search className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Full resolution • Both formats included • Print ready
        </p>
        <div className="mt-6 w-full max-w-xl md:mt-8">
          <div className="mb-4 flex items-start gap-3 rounded-organic border border-primary/30 bg-primary/5 px-4 py-3 md:mb-5">
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
            </div>
          </div>
          <h2 className="mb-4 text-lg font-semibold text-foreground md:text-xl">Choose your package</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                      {selectedProductId === p.id && (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold text-primary">{p.priceDisplay}</p>
                    {p.savePercent != null && (
                      <span className="mt-0.5 block text-xs font-medium text-primary">Save {p.savePercent}%</span>
                    )}
                  </div>
                </div>
                {p.badge && (
                  <span className="inline-block rounded-organic-sm bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-8 rounded-organic border border-border bg-card px-4 py-5 md:px-5">
            <p className="text-sm font-semibold text-foreground">Not ready to decide?</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {petNameDisplay ? (
                <>
                  We&apos;ll hold{" "}
                  <span className="font-semibold text-foreground">{possessiveFormPet(petNameDisplay)}</span> portrait
                  until{" "}
                  {holdExpiryText ? (
                    <span className="font-bold text-primary">{holdExpiryText}</span>
                  ) : (
                    <span className="font-bold text-primary">48 hours from when your preview was created</span>
                  )}
                  . After that, it&apos;s gone.
                </>
              ) : (
                <>
                  We&apos;ll hold your pet&apos;s portrait until{" "}
                  {holdExpiryText ? (
                    <span className="font-bold text-primary">{holdExpiryText}</span>
                  ) : (
                    <span className="font-bold text-primary">48 hours from when your preview was created</span>
                  )}
                  . After that, it&apos;s gone.
                </>
              )}
            </p>
            {savePortraitOk ? (
              <p className="mt-3 text-sm font-medium text-emerald-600">You&apos;re on the list — check your inbox soon.</p>
            ) : (
              <>
                <label htmlFor={`save-portrait-email-${portraitId}`} className="sr-only">
                  Email to receive preview
                </label>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <input
                    id={`save-portrait-email-${portraitId}`}
                    type="email"
                    name="save_portrait_email"
                    inputMode="email"
                    autoComplete="email"
                    value={savePortraitEmail}
                    onChange={(e) => {
                      setSavePortraitEmail(e.target.value)
                      if (savePortraitEmailError) setSavePortraitEmailError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        void handleSavePortraitEmail()
                      }
                    }}
                    placeholder="your@email.com"
                    disabled={savePortraitSubmitting}
                    className="w-full min-h-11 flex-1 rounded-organic-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                  />
                  <Button
                    type="button"
                    disabled={savePortraitSubmitting}
                    onClick={() => void handleSavePortraitEmail()}
                    className="h-auto shrink-0 rounded-organic-sm px-5 py-2.5 text-sm font-semibold sm:self-start"
                  >
                    {savePortraitSubmitting ? "Saving…" : "Save my portrait →"}
                  </Button>
                </div>
                {savePortraitEmailError ? (
                  <p className="mt-2 text-sm text-destructive" role="alert">
                    {savePortraitEmailError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
        {checkoutError && (
          <p className="mt-4 text-sm text-destructive max-w-md">{checkoutError}</p>
        )}

        <div className="mt-6 w-full max-w-xl text-left">
          <div className="rounded-organic-sm border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium text-foreground">Have a discount code?</p>
            <p className="mt-1 text-xs text-muted-foreground">Enter it here before continuing to payment.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={voucherCode}
                onFocus={() => {
                  window.dataLayer = window.dataLayer || []
                  window.dataLayer.push({
                    event: "discount_code_attempted",
                    ...funnelDatalayerPayload(theme, portraitId),
                  })
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
            {voucherMessage ? (
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
            ) : null}
          </div>
        </div>

        <div className="mt-4 hidden w-full max-w-xl md:mt-8 md:block">
          {renderPreviewUnlockButton({ className: "mx-auto max-w-xl" })}
        </div>
      </div>

      {showStickyUnlock ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch border-t border-border bg-background px-5 pb-5 pt-3 shadow-[0_-4px_20px_hsl(0_0%_0%/0.08)] md:hidden">
          <div className="mx-auto w-full max-w-2xl">
            {renderPreviewUnlockButton({
              priceSuffix: mobileStickyPriceSuffix,
            })}
          </div>
        </div>
      ) : null}

      {inspectModalOpen && watermarkPortraitSrc
        ? ReactDOM.createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center overflow-auto bg-black/80 p-4"
              onClick={() => setInspectModalOpen(false)}
              role="presentation"
            >
              <div
                className="relative w-max max-w-full"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Portrait inspection"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watermarkPortraitSrc}
                  alt={
                    petNameDisplay
                      ? `${possessiveFormPet(petNameDisplay)} portrait — inspect details`
                      : "Pet portrait — inspect details"
                  }
                  className="max-w-none h-auto object-contain"
                  style={{
                    width: "auto",
                    maxHeight: "90vh",
                    cursor: "grab",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  aria-label="Close inspection"
                  className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-colors hover:bg-white md:top-4 md:right-4"
                >
                  <X className="h-6 w-6" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
