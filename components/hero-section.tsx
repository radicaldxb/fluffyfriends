import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroPortraitRotator } from "@/components/hero-portrait-rotator"

export function HeroSection() {
  return (
    <section className="relative overflow-x-clip bg-background pt-16 pb-16 md:pt-24 md:pb-24">
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
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
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

            {/* Trust signals — above CTAs */}
            <div className="mt-8 grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2 max-w-xl">
              {[
                "From $17, one-time",
                "No subscription",
                "No payment until you've seen your portrait",
                "Two formats included",
                "Credit back in 5 mins if not right",
              ].map((t) => (
                <div key={t} className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-organic-sm border border-primary/40 bg-primary/10 text-[12px] font-semibold text-primary">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                asChild
              >
                <Link href="/create">See What Your Pet Would Look Like →</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold h-auto"
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

          {/* Right – Before / After card, styled like redesign */}
          <div className="relative flex w-full min-w-0 flex-1 justify-center px-2 sm:px-0 lg:justify-end order-1 lg:order-2">
            <HeroPortraitRotator />
          </div>
        </div>
      </div>
    </section>
  )
}
