"use client"

/**
 * Hand-drawn style divider for Digital Sketchbook aesthetic.
 * Slight wobble and soft color to match logo-aligned, warm UI.
 */
export function SketchDivider() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-2" aria-hidden>
      <svg
        width="100%"
        height="28"
        viewBox="0 0 400 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="text-border"
      >
        {/* Main hand-drawn line: gentle organic wave */}
        <path
          d="M0 14 Q80 6, 160 14 Q240 22, 320 14 Q360 10, 400 14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
          fill="none"
        />
        {/* Secondary softer line for depth */}
        <path
          d="M0 18 Q100 12, 200 18 T400 18"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.35"
          fill="none"
        />
      </svg>
    </div>
  )
}
