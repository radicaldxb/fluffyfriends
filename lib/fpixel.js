export const FB_PIXEL_ID = "1775434052703488"

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
