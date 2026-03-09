import { NextResponse } from "next/server"

/**
 * GET /api/themes
 * Temporary implementation: always return the two static themes we have preview images for.
 * This guarantees the /create page shows working theme cards while we wire up dynamic themes.
 */
export async function GET() {
  const themes = [
    { id: "fireman", name: "Fireman", previewUrl: "/images/themes/fireman-preview.webp" },
    { id: "spaceman", name: "Spaceman", previewUrl: "/images/themes/spaceman-preview.webp" },
    { id: "king", name: "King", previewUrl: "/images/themes/king-preview.webp" },
  ]

  return NextResponse.json({ themes })
}
