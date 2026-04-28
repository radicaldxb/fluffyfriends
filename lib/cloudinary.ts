/** Watermark Cloudinary delivery URLs (shared by /create and /preview). */
export function applyWatermark(cloudinaryUrl: string): string {
  // Tiled rotated text overlay. Note: Cloudinary requires the overlay declaration
  // and the layer-apply (with rotation + tiling flags) in TWO separate components.
  // Verified working syntax: l_text:...,co_white,o_20/a_-20,fl_layer_apply,fl_tiled
  const overlay =
    "l_text:Arial_60_bold:FluffyFriends,co_white,o_20/a_-20,fl_layer_apply,fl_tiled"
  return cloudinaryUrl.replace("/image/upload/", `/image/upload/${overlay}/`)
}
