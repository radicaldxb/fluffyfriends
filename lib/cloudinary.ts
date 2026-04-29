/** Watermark Cloudinary delivery URLs (shared by /create and /preview). */
export function applyWatermark(cloudinaryUrl: string): string {
  // Tiled rotated text overlay. Note: Cloudinary requires the overlay declaration
  // and the layer-apply (with rotation + tiling flags) in TWO separate components.
  // Verified working syntax: l_text:...,co_white,o_20/a_-20,fl_layer_apply,fl_tiled
  const overlay =
    "l_text:Arial_60_bold:FluffyFriends,co_white,o_20/a_-20,fl_layer_apply,fl_tiled"
  return cloudinaryUrl.replace("/image/upload/", `/image/upload/${overlay}/`)
}

/**
 * Transform a Cloudinary image URL into a download-ready URL:
 * - fl_attachment: Content-Disposition: attachment (browser saves the file instead of displaying inline)
 * - f_jpg: forces JPEG format, defeating Cloudinary's auto-AVIF/WebP negotiation
 * - q_auto:best: highest-quality auto-encode
 *
 * Print services (Walgreens/Walmart/CVS/Costco) require JPG, not AVIF or WebP.
 * Always use this for any user-facing "download" link to a Cloudinary asset.
 *
 * Returns null for null/empty input. Returns non-Cloudinary URLs unchanged.
 * Idempotent — already-transformed URLs returned as-is.
 */
export function getDownloadUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Only transform Cloudinary delivery URLs
  if (!trimmed.includes("res.cloudinary.com") || !trimmed.includes("/image/upload/")) {
    return trimmed
  }

  // Idempotent: if already transformed, return as-is
  if (trimmed.includes("fl_attachment") && trimmed.includes("f_jpg")) {
    return trimmed
  }

  // Inject our transformation immediately after /image/upload/
  // Preserves any subsequent transformations (like c_crop for the portrait variant).
  return trimmed.replace(
    "/image/upload/",
    "/image/upload/fl_attachment,f_jpg,q_auto:best/",
  )
}
