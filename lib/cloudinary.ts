/** Watermark Cloudinary delivery URLs (shared by /create and /preview). Several light diagonal text lines — not tiled. */
export function applyWatermark(cloudinaryUrl: string): string {
  // Chained overlays: same opacity (~16%) and rotation family as before, spread across center + corners
  // so crops can’t easily escape a single band. Each block = l_text + rotate + fl_layer_apply + gravity.
  const layers = [
    "l_text:Arial_110_bold:FluffyFriends,co_white,o_16/a_-22,fl_layer_apply,g_center",
    "l_text:Arial_95_bold:FluffyFriends,co_white,o_16/a_-22,fl_layer_apply,g_north_west,x_40,y_55",
    "l_text:Arial_95_bold:FluffyFriends,co_white,o_16/a_22,fl_layer_apply,g_north_east,x_40,y_55",
    "l_text:Arial_95_bold:FluffyFriends,co_white,o_16/a_22,fl_layer_apply,g_south_west,x_40,y_55",
    "l_text:Arial_95_bold:FluffyFriends,co_white,o_16/a_-22,fl_layer_apply,g_south_east,x_40,y_55",
    "l_text:Arial_88_bold:FluffyFriends,co_white,o_16/a_-22,fl_layer_apply,g_west,x_50,y_0",
    "l_text:Arial_88_bold:FluffyFriends,co_white,o_16/a_22,fl_layer_apply,g_east,x_50,y_0",
  ]
  const overlay = layers.join("/")
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
