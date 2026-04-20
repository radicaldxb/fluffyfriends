"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronsLeftRight, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ZOOM_MIN = 1
const ZOOM_MAX = 2.75
const ZOOM_STEP = 0.25

export default function HeroBeforeAfterSlider() {
  const [position, setPosition] = useState(50)
  const [zoom, setZoom] = useState(1)
  const zoomRef = useRef(1)
  const pinchInitialDist = useRef(0)
  const pinchInitialZoom = useRef(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const clampZoom = useCallback((z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]]
        pinchInitialDist.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
        pinchInitialZoom.current = zoomRef.current
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || pinchInitialDist.current <= 0) return
      e.preventDefault()
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      const ratio = dist / pinchInitialDist.current
      setZoom(clampZoom(pinchInitialZoom.current * ratio))
    }

    const onTouchEnd = () => {
      pinchInitialDist.current = 0
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [clampZoom])

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" && e.isPrimary === false) return
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    updatePosition(e.clientX)
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  return (
    <div className="relative w-full max-w-full -mx-6 sm:mx-0">
      <div
        className={cn(
          "rounded-[20px] shadow-xl shadow-foreground/10 ring-1 ring-border/50",
          zoom > 1
            ? "max-md:max-h-[min(72vh,540px)] max-md:overflow-auto"
            : "overflow-hidden",
        )}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div
            ref={containerRef}
            className="relative aspect-square w-full cursor-col-resize select-none overflow-hidden rounded-[20px] bg-muted/40 max-md:aspect-auto max-md:h-[min(54vh,380px)] max-md:touch-manipulation md:aspect-square md:h-auto md:bg-transparent md:touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            role="presentation"
          >
            <Image
              src="/images/pet-after.webp"
              alt="Jimmy as a Fireman — AI pet portrait by FluffyFriends"
              fill
              className="object-contain object-center md:object-cover"
              sizes="(max-width: 1024px) 100vw, 28rem"
              priority
              draggable={false}
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <Image
                src="/images/pet-before-new.webp"
                alt="Jimmy the golden retriever — original photo"
                fill
                className="object-contain object-center md:object-cover"
                sizes="(max-width: 1024px) 100vw, 28rem"
                priority
                draggable={false}
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-border/60 md:bottom-4 md:left-4 md:text-sm">
                Before
              </div>
            </div>

            <div
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 bg-primary shadow-md shadow-primary/40"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            />

            <div
              className="pointer-events-none absolute top-1/2 z-30 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-organic-sm bg-card shadow-lg ring-1 ring-border"
              style={{ left: `${position}%` }}
            >
              <ChevronsLeftRight className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
            </div>

            <div className="absolute bottom-4 right-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-border/60 md:text-sm">
              After
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 min-w-10 rounded-organic-sm border-border px-0"
          aria-label="Zoom out"
          disabled={zoom <= ZOOM_MIN}
          onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
        >
          <Minus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </Button>
        <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 min-w-10 rounded-organic-sm border-border px-0"
          aria-label="Zoom in"
          disabled={zoom >= ZOOM_MAX}
          onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </Button>
        {zoom > ZOOM_MIN ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setZoom(1)}
          >
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  )
}
