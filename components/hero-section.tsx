import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroBeforeAfterSlider from "@/components/hero-before-after-slider"

export function HeroSection() {
  return (
    <section className="relative overflow-x-visible bg-background max-md:pt-8 max-md:pb-10 md:pt-24 md:pb-24">
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
        {/* max-lg: flat column + order (mobile / tablet). lg+: classic flex-row-reverse + nested copy — same as pre-grid desktop. */}
        <div className="flex flex-col items-center max-md:gap-2.5 md:max-lg:gap-0 lg:flex-row-reverse lg:items-center lg:gap-16">
          {/* Right on desktop — before/after slider */}
          <div className="relative order-3 flex w-full min-w-0 max-w-md shrink-0 justify-center px-2 sm:max-w-none sm:px-0 md:order-1 md:max-lg:mb-12 lg:order-none lg:mb-0 lg:max-w-none lg:flex-1 lg:justify-end">
            <HeroBeforeAfterSlider />
          </div>

          <div className="max-lg:contents lg:flex lg:flex-1 lg:flex-col lg:items-start lg:text-left">
            {/* Eyebrow – emotional, not pushy */}
            <p className="order-1 mb-0 max-md:py-0 text-center text-sm font-medium uppercase tracking-widest text-primary md:order-2 lg:order-none lg:mb-6 lg:text-left">
              Made with love. Made to last.
            </p>

            <h1 className="order-2 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:max-md:text-4xl md:order-3 md:text-5xl lg:order-none lg:text-left lg:text-6xl">
              Their name.
              <br />
              <span className="text-primary">In the artwork.</span>
            </h1>

            <p className="order-4 mt-0 max-w-lg text-pretty text-center text-sm leading-relaxed text-muted-foreground max-md:max-w-[min(100%,22rem)] md:order-4 md:text-base lg:order-none lg:mt-5 lg:text-left lg:text-lg">
              Not a filter. Not a caption. Your pet&apos;s name is crafted into the portrait itself: a badge, a crest, a name tag. Upload one photo. Print-ready in minutes.
            </p>

            {/* Trust signals — hidden on small screens only */}
            <div className="order-6 mt-8 hidden w-full max-w-xl text-left md:order-5 md:mt-8 md:block lg:order-none lg:mt-8">
              <div className="grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Their name is part of the art. Not a caption.",
                  "Looks like a real painting, not an AI filter",
                  "Two print-ready formats: portrait and landscape",
                  "In your inbox in minutes",
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

            <div className="order-5 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-start md:order-6 lg:order-none lg:mt-8">
              <Button
                size="lg"
                className="inline-flex h-auto w-full items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] max-md:px-5 max-md:py-2.5 max-md:text-sm sm:w-auto"
                asChild
              >
                <Link href="/create">
                  <span className="md:hidden">See What Your Pet Would Look Like</span>
                  <span className="hidden md:inline">See What Your Pet Would Look Like →</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
