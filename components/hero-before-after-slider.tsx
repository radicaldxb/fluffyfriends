"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { ChevronsLeftRight } from "lucide-react"

export default function HeroBeforeAfterSlider() {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
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
    <div className="relative w-full max-w-full -mx-6 sm:mx-0 overflow-hidden rounded-none shadow-xl shadow-foreground/10 ring-0 sm:rounded-[20px] sm:ring-1 sm:ring-border/50">
      <div
        ref={containerRef}
        className="relative aspect-square w-full cursor-col-resize touch-none select-none overflow-hidden rounded-none bg-muted/40 max-md:aspect-auto max-md:h-[min(46vh,300px)] sm:rounded-[20px] md:aspect-square md:h-auto md:bg-transparent"
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
            The real them
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
          Captured forever
        </div>
      </div>
    </div>
  )
}
