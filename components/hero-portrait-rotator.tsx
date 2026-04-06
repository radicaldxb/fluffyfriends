"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { themes } from "@/lib/themes"

const INTERVAL_MS = 5000
const FADE_MS = 800

const kingMain = themes.king.masterImage

/** Slide 2 expects `public/images/misty-queen.jpg` — add the file to avoid a broken main image. */
const SLIDES = [
  {
    mainSrc: "/images/pet-after.webp",
    nameLine: "Jimmy 🐾",
    themeLabel: "🚒 Fireman",
    alt: "Example Fireman theme pet portrait",
  },
  {
    mainSrc: "/images/misty-queen.jpg",
    nameLine: "Misty 🐾",
    themeLabel: "👑 Queen",
    alt: "Example Queen theme cat portrait",
  },
  {
    mainSrc: kingMain,
    nameLine: "Buddy 🐾",
    themeLabel: "👑 King",
    alt: "Example King theme pet portrait",
  },
]

export function HeroPortraitRotator() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const urls = SLIDES.map((s) => s.mainSrc)
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
    <div className="relative w-full max-w-md">
      {/* Main portrait card (After) */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-organic bg-foreground shadow-2xl shadow-foreground/20">
        {SLIDES.map((slide, i) => {
          const isRemote = slide.mainSrc.startsWith("http")
          return (
            <div
              key={slide.mainSrc}
              className={cn(
                "absolute inset-0 transition-opacity ease-in-out",
                active === i ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
              )}
              style={{ transitionDuration: `${FADE_MS}ms` }}
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

        {/* Name badge overlay — text crossfades */}
        <div className="absolute bottom-3 left-5 z-20 rounded-2xl bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portrait for</p>
          <div className="relative mt-1 min-h-[1.75rem] sm:min-h-[2rem]">
            {SLIDES.map((slide, i) => (
              <p
                key={slide.nameLine}
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

        {/* After badge — static */}
        <div className="absolute right-4 top-4 z-20 rounded-organic-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow">
          After ✨
        </div>
      </div>

      {/* Before thumbnail — static, same as slide 1 */}
      <div className="absolute bottom-24 right-3 z-10 w-[34%] max-w-[150px] overflow-hidden rounded-organic-sm border border-border bg-muted shadow-lg sm:-bottom-4 sm:-left-16 sm:right-auto sm:w-40 sm:max-w-none">
        <div className="relative aspect-[4/5]">
          <Image
            src="/images/pet-before.webp"
            alt="Original pet photo"
            fill
            className="object-cover"
            sizes="150px"
          />
          <div className="absolute left-2 top-2 rounded-organic-pill bg-background/90 px-2 py-1 text-[10px] font-semibold text-muted-foreground shadow">
            Before
          </div>
        </div>
      </div>

      {/* Floating theme badge — label static, theme line crossfades */}
      <div className="absolute -left-6 top-1/3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
        <p className="mb-1 text-xs text-muted-foreground">Theme</p>
        <div className="relative min-h-[1.25rem]">
          {SLIDES.map((slide, i) => (
            <p
              key={slide.themeLabel}
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

      {/* Floating quality badge — static */}
      <div className="absolute -right-4 bottom-1/3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-xl">
        <p className="text-xs font-medium opacity-80">Print ready</p>
        <p className="text-sm font-bold">Up to A1 ↑</p>
      </div>
    </div>
  )
}
