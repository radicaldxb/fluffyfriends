/** Same ID as `app/layout.tsx` gtag config; override via env if needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-8KYJG9BH46"

export type Ga4PurchaseItem = {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price: number
  quantity: number
}

export type Ga4PurchaseParams = {
  transaction_id: string
  value: number
  currency: string
  items: Ga4PurchaseItem[]
}

/**
 * GA4 recommended ecommerce `purchase` event.
 * Requires gtag loaded (layout); no-ops if unavailable.
 */
export function trackGa4Purchase(params: Ga4PurchaseParams): void {
  if (typeof window === "undefined") return
  const g = window.gtag
  if (typeof g !== "function") return

  g("event", "purchase", {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency,
    items: params.items,
  })
}
