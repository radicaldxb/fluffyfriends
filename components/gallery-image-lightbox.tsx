"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

type GalleryImageLightboxProps = {
  open: boolean
  src: string | null
  alt: string
  onClose: () => void
}

/** Black overlay, enlarged image, close (same pattern as /create inspection modal). */
export function GalleryImageLightbox({ open, src, alt, onClose }: GalleryImageLightboxProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (typeof document === "undefined" || !open || !src) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-max max-w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged portrait"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-none h-auto object-contain"
          style={{
            width: "auto",
            maxHeight: "90vh",
            cursor: "grab",
          }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-colors hover:bg-white md:top-4 md:right-4"
        >
          <X className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  )
}
