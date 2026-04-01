/**
 * Analytics via GTM `dataLayer` (no direct gtag in layout). GTM should expose GA4 tags
 * that listen for these events / ecommerce fields.
 */

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

function pushDataLayer(obj: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(obj)
}

/**
 * Virtual page_view for App Router client navigations (initial load is handled by GTM).
 */
export function trackGa4PageView(pagePath: string): void {
  if (typeof window === "undefined") return
  const path = pagePath.startsWith("/") ? pagePath : `/${pagePath}`
  const search = window.location.search || ""
  const pageLocation = `${window.location.origin}${path}${search}`
  pushDataLayer({
    event: "virtual_page_view",
    page_path: path,
    page_location: pageLocation,
    page_title: document.title,
  })
}

/**
 * GA4 recommended ecommerce `purchase` event via dataLayer.
 */
export function trackGa4Purchase(params: Ga4PurchaseParams): void {
  if (typeof window === "undefined") return
  pushDataLayer({ ecommerce: null })
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency,
      items: params.items.map((i) => ({
        item_id: i.item_id,
        item_name: i.item_name,
        ...(i.item_category ? { item_category: i.item_category } : {}),
        ...(i.item_variant ? { item_variant: i.item_variant } : {}),
        price: i.price,
        quantity: i.quantity,
      })),
    },
  })
}
