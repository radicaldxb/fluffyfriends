/** Watermark Cloudinary delivery URLs (shared by /create and /preview). Single light diagonal — not tiled. */
export function applyWatermark(cloudinaryUrl: string): string {
  // Centered rotated text overlay (~16% opacity). Tiling removed — lighter emotional reveal while still deterring theft.
  const overlay = "l_text:Arial_120_bold:FluffyFriends,co_white,o_16/a_-22,fl_layer_apply"
  return cloudinaryUrl.replace("/image/upload/", `/image/upload/${overlay}/`)
}

/**
 * Transform a Cloudinary image URL into a download-ready URL:
 * - fl_attachment: Content-Disposition: attachment (browser saves the file instead of displaying inline)
 * - f_jpg: forces JPEG format, defeating Cloudinary's auto-AVIF/WebP negotiation
 * - q_100: maximum JPEG quality, minimal recompression (delivers ~95% of source size)
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
    "/image/upload/fl_attachment,f_jpg,q_100/",
  )
}
