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
        <div className="flex flex-col items-center max-md:gap-2.5 md:max-lg:gap-0 lg:flex-row-reverse lg:items-center lg:gap-16">
          {/* Before/after column — taglines + slider */}
          <div className="relative order-2 flex w-full min-w-0 max-w-md shrink-0 flex-col items-center justify-center px-2 sm:max-w-none sm:px-0 md:max-lg:mb-12 lg:order-none lg:mb-0 lg:max-w-none lg:flex-1 lg:justify-end">
            <div className="mb-6 w-full text-center md:mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary md:text-base">
                Made with love. Made to last.
              </p>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                Their moment. Forever.
              </h2>
            </div>
            <HeroBeforeAfterSlider />
          </div>

          <div className="max-lg:contents lg:flex lg:flex-1 lg:flex-col lg:items-start lg:text-left">
            <h1 className="order-1 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:max-md:text-4xl md:text-5xl lg:text-left lg:text-6xl">
              Their name.
              <br />
              <span className="text-primary">In the portrait.</span>
            </h1>

            <p className="order-3 mt-0 max-w-lg text-pretty text-center text-sm leading-relaxed text-muted-foreground max-md:max-w-[min(100%,22rem)] md:text-base lg:mt-5 lg:text-left lg:text-lg">
              Not a filter. Not a caption. Your pet&apos;s name is crafted into the portrait itself: a badge, a crest, a name tag. Upload one photo. Print-ready in minutes.
            </p>

            {/* Trust signals — hidden on small screens only */}
            <div className="order-5 mt-8 hidden w-full max-w-xl text-left md:block lg:mt-8">
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

            <div className="order-4 mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-start lg:mt-8">
              <div className="flex w-full flex-col items-center sm:items-start">
                <Button
                  size="lg"
                  className="inline-flex h-auto w-full items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] max-md:px-5 max-md:py-2.5 max-md:text-sm sm:w-auto"
                  asChild
                >
                  <Link href="/create">Create Their Portrait →</Link>
                </Button>
                <p className="mt-3 text-center text-sm text-muted-foreground sm:text-left">
                  From $17 • Satisfaction guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
