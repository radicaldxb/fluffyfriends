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
    <div className="relative z-0 mx-auto w-full max-w-none lg:max-w-md">
      {/* Main portrait card — single stacking context so inactive layers cannot show through */}
      <div className="relative z-[1] isolate aspect-[3/4] overflow-hidden rounded-organic bg-muted shadow-2xl shadow-black/10 ring-1 ring-border/50 lg:aspect-[4/5]">
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
              {/* Theme label inside slide layer so it fades with the portrait (no double label during transition) */}
              <div className="pointer-events-none absolute left-2 top-[28%] z-[5] rounded-organic border border-border bg-card px-4 py-3 shadow-lg sm:-left-5">
                <p className="text-base font-bold text-foreground">{slide.themeLabel}</p>
              </div>
            </div>
          )
        })}

        {/* Name badge */}
        <div className="absolute bottom-3 left-5 z-20 rounded-organic bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
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

        <div className="absolute right-4 top-4 z-20 rounded-organic-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow">
          After →
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
        </div>
      </div>

      <div className="absolute -right-2 bottom-[30%] z-[3] rounded-organic bg-primary px-4 py-3 text-primary-foreground shadow-xl sm:-right-4">
        <p className="text-xs font-medium opacity-90">Print ready</p>
        <p className="text-base font-bold">Up to A1 ↑</p>
      </div>
    </div>
  )
}
