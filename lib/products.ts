/**
 * Product definitions for checkout.
 * Single source of truth; add print products here when ready.
 */

export type ProductId = "single_4k" | "pack_4_4k"

export interface Product {
  id: ProductId
  name: string
  description: string
  priceCents: number
  priceDisplay: string
  perPortrait: number
  type: "download"
  badge?: string
  savePercent?: number
}

export const PRODUCTS: Product[] = [
  {
    id: "single_4k",
    name: "1 Portrait (4K)",
    description: "One high-resolution download",
    priceCents: 2900,
    priceDisplay: "$29",
    perPortrait: 1,
    type: "download",
  },
  {
    id: "pack_4_4k",
    name: "4 Portraits (4K)",
    description: "This one + 3 credits (use anytime, any pet, within 12 months)",
    priceCents: 7900,
    priceDisplay: "$79",
    perPortrait: 4,
    type: "download",
    badge: "Best value",
    savePercent: 32,
  },
]

export function getProduct(id: ProductId): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export const CREDIT_VALIDITY_MONTHS = 12
