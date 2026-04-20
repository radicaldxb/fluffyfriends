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
        {/* max-lg: flat column + order (mobile / tablet). lg+: flex-row-reverse — slider column right. */}
        <div className="flex flex-col items-center max-md:gap-2.5 md:max-lg:gap-0 lg:flex-row-reverse lg:items-center lg:gap-16">
          {/* Before/after slider — max-md: above body copy; md–lg: after subcopy */}
          <div className="relative order-3 flex w-full min-w-0 max-w-md shrink-0 flex-col items-center justify-center px-2 sm:max-w-none sm:px-0 md:order-4 md:max-lg:mb-12 lg:order-none lg:mb-0 lg:max-w-none lg:flex-1 lg:justify-end">
            <HeroBeforeAfterSlider />
          </div>

          <div className="max-lg:contents lg:flex lg:flex-1 lg:flex-col lg:items-start lg:text-left">
            <p className="order-1 mb-3 w-full text-center text-sm font-semibold uppercase tracking-wider text-primary max-md:mb-2 md:mb-4 md:text-base lg:order-none lg:mb-4 lg:text-left">
              Made with love. Made to last.
            </p>

            <h1 className="order-2 text-balance text-center text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:max-md:text-4xl md:text-5xl lg:order-none lg:text-left lg:text-6xl">
              Their moment.
              <br />
              <span className="text-primary">Forever.</span>
            </h1>

            <p className="order-4 mt-0 max-w-lg text-pretty text-center text-sm leading-relaxed text-muted-foreground max-md:max-w-[min(100%,22rem)] md:order-3 md:text-base lg:order-none lg:mt-5 lg:text-left lg:text-lg">
              Not a filter. Not a caption.
              <br />
              Your pet&apos;s name is crafted into the portrait itself.
              <br />
              Upload one photo. Print-ready in minutes.
            </p>

            {/* Trust signals — hidden on small screens only */}
            <div className="order-5 mt-8 hidden w-full max-w-xl text-left md:mt-8 md:block lg:order-none lg:mt-8">
              <div className="grid gap-x-6 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  { key: "name-art", lines: ["Their name is part of the art.", "Not a caption."] as const },
                  { key: "painting", lines: ["Looks like a real painting, not an AI filter"] as const },
                  { key: "formats", lines: ["Two print-ready formats: portrait and landscape"] as const },
                  { key: "inbox", lines: ["In your inbox in minutes"] as const },
                ].map(({ key, lines }) => (
                  <div key={key} className="inline-flex items-start gap-1.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-organic-sm border border-primary/40 bg-primary/10 text-[12px] font-semibold text-primary">
                      ✓
                    </span>
                    <span className="font-semibold text-foreground">
                      {lines.map((line, i) => (
                        <span key={`${key}-${i}`}>
                          {i > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-6 flex w-full max-w-xl flex-col items-center sm:items-start lg:order-none lg:mt-8">
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
    </section>
  )
}
