import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeforeAfterSlider } from "@/components/before-after-slider"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Subtle radial glow behind hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,149,74,0.15), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left – Copy */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Trust badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-organic-sm border border-border bg-secondary px-4 py-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Loved by pet parents
              </span>
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Pet, Reimagined as{" "}
              <span className="text-primary">Fine Art</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              One photo of your furry friend. Dozens of art styles. Get a
              museum-quality portrait — download in 4K or have it printed and
              delivered to your door.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-organic-sm px-8 text-base font-medium"
                asChild
              >
                <a href="/create">
                  Create My Portrait
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-organic-sm border-border text-foreground hover:bg-secondary/50 px-8 text-base"
                asChild
              >
                <a href="#gallery">See examples</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              One-time purchase • No subscription • Happiness guarantee
            </p>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-organic-sm border-2 border-background bg-secondary"
                    style={{
                      background: `oklch(${0.3 + i * 0.1} 0.04 ${200 + i * 30})`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Portraits created by our community
              </p>
            </div>
          </div>

          {/* Right – Before/After Slider */}
          <div className="w-full max-w-md flex-1 lg:max-w-lg">
            <p className="mb-2 text-center text-xs text-muted-foreground lg:text-left">Drag to compare</p>
            <BeforeAfterSlider
              beforeSrc="/images/pet-before.webp"
              afterSrc="/images/pet-after.webp"
              beforeAlt="Original pet photo"
              afterAlt="Your pet as fine art"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
