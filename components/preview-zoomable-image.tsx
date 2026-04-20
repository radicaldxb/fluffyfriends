"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MIN = 1
const MAX = 2.75
const STEP = 0.25

type PreviewZoomableImageProps = {
  children: React.ReactNode
  className?: string
  frameClassName?: string
  innerClassName?: string
  showControlsMobileOnly?: boolean
}

export function PreviewZoomableImage({
  children,
  className,
  frameClassName,
  innerClassName,
  showControlsMobileOnly = true,
}: PreviewZoomableImageProps) {
  const [zoom, setZoom] = useState(1)
  const frameRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(1)
  const pinchInitialDist = useRef(0)
  const pinchInitialZoom = useRef(1)

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const clamp = useCallback((z: number) => Math.min(MAX, Math.max(MIN, z)), [])

  useEffect(() => {
    const el = frameRef.current
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
      setZoom(clamp(pinchInitialZoom.current * ratio))
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
  }, [clamp])

  const controlBar = (
    <div
      className={cn(
        "mt-2 flex flex-wrap items-center justify-center gap-2",
        showControlsMobileOnly && "md:hidden",
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 min-w-10 rounded-organic-sm px-0"
        aria-label="Zoom out"
        disabled={zoom <= MIN}
        onClick={() => setZoom((z) => clamp(z - STEP))}
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
        className="h-10 min-w-10 rounded-organic-sm px-0"
        aria-label="Zoom in"
        disabled={zoom >= MAX}
        onClick={() => setZoom((z) => clamp(z + STEP))}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      </Button>
      {zoom > MIN ? (
        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setZoom(1)}>
          Reset
        </Button>
      ) : null}
    </div>
  )

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={frameRef}
        className={cn(
          zoom > 1 ? "max-h-[min(70vh,520px)] overflow-auto" : "overflow-hidden",
          frameClassName,
        )}
        style={{ touchAction: zoom > 1 ? "pan-x pan-y" : "manipulation" }}
      >
        <div
          className={cn("mx-auto w-full", innerClassName)}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>
      {controlBar}
    </div>
  )
}
