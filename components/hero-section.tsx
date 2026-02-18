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
            "radial-gradient(ellipse at center, oklch(0.82 0.12 75 / 0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left – Copy */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Trust badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 backdrop-blur-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Loved by 12,000+ pet parents
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Pet, Reimagined as{" "}
              <span className="text-primary">Fine Art</span>
            </h1>

            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Upload a photo of your furry friend and our AI transforms it into
              a stunning, museum-quality portrait in any style you can imagine.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base font-medium"
              >
                Start Your Transformation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-border/60 text-foreground hover:bg-secondary/50 px-8 text-base"
              >
                View Gallery
              </Button>
            </div>

            {/* Social proof avatars */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-secondary"
                    style={{
                      background: `oklch(${0.3 + i * 0.1} 0.04 ${200 + i * 30})`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">2,400+</span>{" "}
                portraits created this week
              </p>
            </div>
          </div>

          {/* Right – Before/After Slider */}
          <div className="w-full max-w-md flex-1 lg:max-w-lg">
            <BeforeAfterSlider
              beforeSrc="/images/pet-before.jpg"
              afterSrc="/images/pet-after.jpg"
              beforeAlt="Original pet photo"
              afterAlt="AI-generated fine art portrait"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
