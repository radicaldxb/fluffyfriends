import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-16 md:pt-24 md:pb-24">
      {/* Subtle radial glow behind hero, inspired by redesign */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,149,74,0.15), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left – Copy */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Eyebrow – emotional, not pushy */}
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-primary">
              Made with love. Made to last.
            </p>

            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Pet,
              <br />
              <span className="text-primary">Reimagined</span>
              <br />
              as Fine Art.
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              One photo is all it takes. We craft a personalised, print-ready portrait of your pet — with their name worked into every detail. Beautiful enough to frame. Sharp enough to fill an entire wall.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                asChild
              >
                <Link href="/create">
                  Make My Portrait
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold h-auto"
                asChild
              >
                <Link href="#gallery">See real portraits</Link>
              </Button>
            </div>
            {/* Trust strip – from copy doc */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["From $17, one-time", "No subscription", "Two formats included", "Happiness guarantee"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5"
                >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-organic-sm border border-primary/40 bg-primary/10 text-[12px] font-semibold text-primary">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">{t}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right – Before / After card, styled like redesign */}
          <div className="relative flex w-full flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main portrait card (After) */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-foreground shadow-2xl shadow-foreground/20">
                <Image
                  src="/images/pet-after.webp"
                  alt="Your pet as fine art"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Name badge overlay */}
                <div className="absolute bottom-3 left-5 rounded-2xl bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur-sm z-20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Portrait for
                  </p>
                  <p className="text-lg font-bold leading-tight text-foreground">Jimmy 🐾</p>
                </div>
                {/* After badge */}
              <div className="absolute right-4 top-4 rounded-organic-pill bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow">
                  After ✨
                </div>
              </div>

              {/* Before thumbnail card */}
              <div className="absolute -left-16 -bottom-4 hidden w-40 overflow-hidden rounded-2xl border border-border bg-muted shadow-lg sm:block z-10">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/images/pet-before.webp"
                    alt="Original pet photo"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute left-2 top-2 rounded-organic-pill bg-background/90 px-2 py-1 text-[10px] font-semibold text-muted-foreground shadow">
                    Before
                  </div>
                </div>
              </div>

              {/* Floating theme badge */}
              <div className="absolute -left-6 top-1/3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
                <p className="mb-1 text-xs text-muted-foreground">Theme</p>
                <p className="text-sm font-bold text-foreground">🚒 Fireman</p>
              </div>

              {/* Floating quality badge */}
              <div className="absolute -right-4 bottom-1/3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-xl">
                <p className="text-xs font-medium opacity-80">Print ready</p>
                <p className="text-sm font-bold">Up to A1 ↑</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
