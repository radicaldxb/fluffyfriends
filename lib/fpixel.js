/** Inlined at build from Netlify / `.env` — set `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`. */
export const FB_PIXEL_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
    ? String(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID).trim()
    : ""

export const pageview = () => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("track", "PageView")
}

export const initiateCheckout = () => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("track", "InitiateCheckout")
}

export const purchase = (value, currency = "USD") => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq("track", "Purchase", {
    value: value,
    currency: currency,
    content_type: "product",
  })
}
