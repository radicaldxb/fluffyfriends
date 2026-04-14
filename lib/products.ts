/**
 * Product definitions for checkout.
 * Single source of truth; kept in sync with PricingSection copy.
 */

export type ProductId = "starter" | "portrait_pack" | "family_pack"

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
    id: "starter",
    name: "Starter",
    description: "One pet. One theme. See exactly what yours looks like.",
    priceCents: 1700,
    priceDisplay: "$17",
    perPortrait: 1,
    type: "download",
  },
  {
    id: "portrait_pack",
    name: "Portrait Pack",
    description: "Four portraits. Your choice of pets, your choice of themes.",
    priceCents: 4900,
    priceDisplay: "$49",
    perPortrait: 4,
    type: "download",
    badge: "Most Popular",
    savePercent: 28, // approx: 4 * 17 = 68 → save 19
  },
  {
    id: "family_pack",
    name: "Family Pack",
    description: "Eight portraits for the whole family. Every pet. Every theme.",
    priceCents: 7900,
    priceDisplay: "$79",
    perPortrait: 8,
    type: "download",
    badge: "Best Value",
    savePercent: 42, // approx: 8 * 17 = 136 → save 57
  },
]

export function getProduct(id: ProductId): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export const CREDIT_VALIDITY_MONTHS = 12
