"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const INTERVAL_MS = 5000
const FADE_MS = 800

/**
 * Paths must match filenames in `public/images/` exactly (case-sensitive on Linux).
 * Fireman = Golden Retriever, Queen = cat, King = Dachshund (local hero assets only).
 */
const SLIDES = [
  {
    id: "jimmy-fireman",
    mainSrc: "/images/pet-after.webp",
    beforeSrc: "/images/pet-before.webp",
    nameLine: "Jimmy",
    themeLabel: "🚒 Fireman",
    alt: "Golden Retriever — Fireman theme portrait",
  },
  {
    id: "misty-queen",
    mainSrc: "/images/misty-after.webp",
    beforeSrc: "/images/misty-before.webp",
    nameLine: "Misty",
    themeLabel: "👑 Queen",
    alt: "Cat — Queen theme portrait",
  },
  {
    id: "oscar-king",
    mainSrc: "/images/king-after.webp",
    beforeSrc: "/images/king-before.webp",
    nameLine: "Oscar",
    themeLabel: "👑 King",
    alt: "Dachshund — King theme portrait",
  },
]

export function HeroPortraitRotator() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const urls = [...new Set(SLIDES.flatMap((s) => [s.mainSrc, s.beforeSrc]))]
    for (const src of urls) {
      const img = new window.Image()
      img.src = src
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative z-0 mx-auto w-full max-w-[min(100%,28rem)] lg:max-w-md">
      {/* Main portrait card — bg + radius + clip first frame so the frame never “appears after” the image */}
      <div className="relative z-0 isolate aspect-[3/4] overflow-hidden rounded-organic bg-muted shadow-2xl shadow-black/10 ring-1 ring-border/50 [contain:paint] lg:aspect-[4/5]">
        {SLIDES.map((slide, i) => {
          const isRemote = slide.mainSrc.startsWith("http")
          const on = active === i
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity ease-in-out",
                on ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={!on}
            >
              <Image
                src={slide.mainSrc}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 28rem"
                priority={i === 0}
                unoptimized={isRemote}
              />
              {/* Theme pill — inset from portrait edges for breathing room */}
              <div className="pointer-events-none absolute left-4 right-4 top-[24%] z-[5] sm:left-5 sm:right-auto sm:max-w-[11rem]">
                <div className="inline-flex max-w-full rounded-organic-sm border border-border bg-card px-3 py-2 shadow-md sm:px-4 sm:py-2.5">
                  <p className="text-sm font-bold leading-snug text-foreground sm:text-base">
                    {slide.themeLabel}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        <div className="absolute right-4 top-4 z-20">
          <div className="rounded-organic-sm bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow sm:px-4">
            After →
          </div>
        </div>
      </div>

      {/* Before thumbnail — below card paint layer; “after” overlays sit in the next sibling so name is never covered */}
      <div className="absolute bottom-[4.75rem] right-4 z-10 w-[32%] max-w-[140px] overflow-hidden rounded-organic-sm border border-border bg-muted shadow-lg sm:-bottom-4 sm:left-5 sm:right-auto sm:w-40 sm:max-w-none">
        <div className="relative aspect-[4/5]">
          {SLIDES.map((slide, i) => {
            const on = active === i
            return (
              <div
                key={`before-${slide.id}`}
                className={cn(
                  "absolute inset-0 overflow-hidden rounded-organic-sm transition-opacity ease-in-out",
                  on ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
                )}
                style={{ transitionDuration: `${FADE_MS}ms` }}
                aria-hidden={!on}
              >
                <Image
                  src={slide.beforeSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="150px"
                  priority={i === 0}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Above before thumb (z-10): name/print must not sit in a layer below the overlapping thumbnail */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute right-4 top-[4.25rem] max-w-[10.5rem] rounded-organic bg-primary px-3 py-2.5 text-primary-foreground shadow-lg sm:top-[4.5rem] sm:px-4 sm:py-3">
          <p className="text-[11px] font-medium opacity-90 sm:text-xs">Print ready</p>
          <p className="text-sm font-bold leading-tight sm:text-base">Up to A1 ↑</p>
        </div>

        <div className="absolute bottom-5 left-4 max-w-[min(calc(100%-5rem),14rem)] rounded-organic border border-border bg-background px-3 py-2 shadow-lg sm:bottom-6 sm:left-5 sm:px-4 sm:py-2.5">
          <div className="relative min-h-[1.75rem] sm:min-h-[2rem]">
            {SLIDES.map((slide, i) => (
              <p
                key={slide.id}
                className={cn(
                  "text-lg font-bold leading-tight text-foreground transition-opacity ease-in-out",
                  active === i
                    ? "relative z-10 opacity-100"
                    : "pointer-events-none absolute left-0 top-0 opacity-0",
                )}
                style={{ transitionDuration: `${FADE_MS}ms` }}
                aria-hidden={active !== i}
              >
                {slide.nameLine}
              </p>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
