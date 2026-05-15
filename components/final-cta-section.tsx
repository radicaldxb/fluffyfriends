import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTASection() {
  return (
    <section id="final-cta" className="relative bg-muted py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="flex flex-col items-center">
          <div
            className="flex justify-center gap-0.5"
            aria-label="5 out of 5 stars"
            role="img"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-primary text-primary sm:h-6 sm:w-6"
                strokeWidth={1.5}
                aria-hidden
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Loved by pet owners across the world
          </p>
        </div>

        <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Your pet deserves to be on your wall.
        </h2>

        <p className="mt-4 text-lg text-muted-foreground">
          One photo. In Minutes. Yours Forever.
        </p>

        <Button
          size="lg"
          className="mt-8 inline-flex h-auto items-center gap-2 rounded-organic-sm px-8 py-4 text-lg font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02]"
          asChild
        >
          <Link href="/create">See Yours Free →</Link>
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          No subscription · No hidden fees · Pay when you&apos;re ready
        </p>
      </div>
    </section>
  )
}
