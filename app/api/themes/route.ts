import { NextResponse } from "next/server"

/**
 * GET /api/themes
 * Returns the static themes with preview images used on the /create page.
 */
export async function GET() {
  const themes = [
    { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
    { id: "police", name: "Police Officer", previewUrl: "/images/themes/police-preview.webp" },
    { id: "king", name: "King", previewUrl: "/images/themes/king-preview.webp" },
  ]

  return NextResponse.json({ themes })
}
