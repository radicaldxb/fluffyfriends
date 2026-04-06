import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    step: "01",
    title: "Choose their theme",
    description:
      "King, Queen, Fireman, Pilot, Admiral, Samurai, Veterinarian, or Police Officer. Every theme is designed so your pet's name becomes part of the portrait itself.",
  },
  {
    step: "02",
    title: "Upload one photo",
    description:
      "One clear photo is all we need. We check it works before you pay — no surprises, no wasted money.",
  },
  {
    step: "03",
    title: "Receive your portrait",
    description:
      "Within minutes, two print-ready files land in your inbox — portrait format and landscape format — plus a free guide for printing and framing.",
  },
] as const

export function HowItWorksVisualSection() {
  return (
    <section id="process" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">HOW IT WORKS</p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((item) => (
            <div key={item.step} className="text-center md:text-left">
              <p className="text-sm font-bold tabular-nums text-primary">{item.step}</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
            asChild
          >
            <Link href="/create">Start My Portrait →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
