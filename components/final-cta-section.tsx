import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FinalCTASection() {
  return (
    <section id="final-cta" className="relative bg-muted py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary">5 stars</span>
          <br />
          Loved by pet owners across the world
        </p>

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
          <Link href="/create">Create My Portrait →</Link>
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          No subscription · No hidden fees · Pay when you&apos;re ready
        </p>
      </div>
    </section>
  )
}
