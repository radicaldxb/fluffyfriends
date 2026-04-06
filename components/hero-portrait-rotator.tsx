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
    nameLine: "Jimmy 🐾",
    themeLabel: "🚒 Fireman",
    alt: "Golden Retriever — Fireman theme portrait",
  },
  {
    id: "misty-queen",
    mainSrc: "/images/Misty-after.webp",
    beforeSrc: "/images/Misty-before.webp",
    nameLine: "Misty 🐾",
    themeLabel: "👑 Queen",
    alt: "Cat — Queen theme portrait",
  },
  {
    id: "buddy-king",
    mainSrc: "/images/king-after.webp",
    beforeSrc: "/images/king-before.webp",
    nameLine: "Buddy 🐾",
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
    <div className="relative z-0 w-full max-w-md">
      {/* Main portrait card — single stacking context so inactive layers cannot show through */}
      <div className="relative z-[1] isolate aspect-[4/5] overflow-hidden rounded-organic bg-foreground shadow-2xl shadow-foreground/20">
        {SLIDES.map((slide, i) => {
          const isRemote = slide.mainSrc.startsWith("http")
          const on = active === i
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity ease-in-out",
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
            </div>
          )
        })}

        {/* Name badge */}
        <div className="absolute bottom-3 left-5 z-20 rounded-organic bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portrait for</p>
          <div className="relative mt-1 min-h-[1.75rem] sm:min-h-[2rem]">
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

        <div className="absolute right-4 top-4 z-20 rounded-organic-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow">
          After ✨
        </div>
      </div>

      {/* Before thumbnail — above card edge, below floating badges that need to read clearly */}
      <div className="absolute bottom-[5.25rem] right-2 z-[2] w-[34%] max-w-[150px] overflow-hidden rounded-organic-sm border border-border bg-muted shadow-lg sm:-bottom-4 sm:left-4 sm:right-auto sm:w-40 sm:max-w-none">
        <div className="relative aspect-[4/5]">
          {SLIDES.map((slide, i) => {
            const on = active === i
            return (
              <div
                key={`before-${slide.id}`}
                className={cn(
                  "absolute inset-0 transition-opacity ease-in-out",
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
          <div className="absolute left-2 top-2 z-20 rounded-organic-pill bg-background/90 px-2 py-1 text-[10px] font-semibold text-muted-foreground shadow">
            Before
          </div>
        </div>
      </div>

      {/* Theme badge — explicit z so it never sits under the portrait card */}
      <div className="absolute left-2 top-[28%] z-[3] rounded-organic border border-border bg-card px-3 py-2.5 shadow-lg sm:-left-5 sm:px-4 sm:py-3">
        <p className="mb-1 text-xs text-muted-foreground">Theme</p>
        <div className="relative min-h-[1.25rem]">
          {SLIDES.map((slide, i) => (
            <p
              key={slide.id}
              className={cn(
                "text-sm font-bold text-foreground transition-opacity ease-in-out",
                active === i
                  ? "relative z-10 opacity-100"
                  : "pointer-events-none absolute left-0 top-0 opacity-0",
              )}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={active !== i}
            >
              {slide.themeLabel}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute -right-2 bottom-[30%] z-[3] rounded-organic bg-primary px-3 py-2.5 text-primary-foreground shadow-xl sm:-right-4 sm:px-4 sm:py-3">
        <p className="text-xs font-medium opacity-80">Print ready</p>
        <p className="text-sm font-bold">Up to A1 ↑</p>
      </div>
    </div>
  )
}
