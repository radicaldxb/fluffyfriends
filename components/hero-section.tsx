import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroBeforeAfterSlider from "@/components/hero-before-after-slider"

export function HeroSection() {
  return (
    <section className="relative overflow-x-visible bg-background pt-16 pb-16 md:pt-24 md:pb-24">
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
        {/* Portrait first in DOM so mobile stacks image above headline; lg:flex-row-reverse keeps copy left + portrait right on desktop */}
        <div className="flex flex-col items-center gap-12 lg:flex-row-reverse lg:items-center lg:gap-16">
          {/* Right on desktop — portrait (first in DOM = top on mobile) */}
          <div className="relative flex w-full min-w-0 max-w-md shrink-0 justify-center px-2 sm:max-w-none sm:px-0 lg:flex-1 lg:justify-end">
            <HeroBeforeAfterSlider />
          </div>

          {/* Left on desktop — Copy */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Eyebrow – emotional, not pushy */}
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-primary">
              Made with love. Made to last.
            </p>

            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Their name.
              <br />
              <span className="text-primary">In the artwork.</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Not a filter. Not a caption. Your pet&apos;s name is crafted into the portrait itself — a badge, a crest, a name tag. Upload one photo. Print-ready in minutes.
            </p>

            {/* Trust signals — above CTAs */}
            <div className="mt-8 w-full max-w-xl text-left">
              <div className="grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Their name crafted into the artwork",
                  "Print-ready at poster size",
                  "Two formats — portrait and landscape",
                  "Delivered to your inbox in minutes",
                ].map((t) => (
                  <div key={t} className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-organic-sm border border-primary/40 bg-primary/10 text-[12px] font-semibold text-primary">
                      ✓
                    </span>
                    <span className="font-semibold text-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-start">
              <Button
                size="lg"
                className="inline-flex w-full items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] sm:w-auto h-auto"
                asChild
              >
                <Link href="/create">See What Your Pet Would Look Like →</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="inline-flex w-full items-center justify-center gap-2 rounded-organic-sm border-2 border-foreground/20 px-7 py-3.5 text-base font-semibold sm:w-auto h-auto hover:border-foreground/30"
                asChild
              >
                <Link href="#gallery">Browse the gallery</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground text-center lg:text-left">
              Already have a portrait pack?{" "}
              <Link href="/my-portraits" className="underline hover:text-foreground">
                Access my portraits →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
