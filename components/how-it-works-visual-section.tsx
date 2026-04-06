import Image from "next/image"
import Link from "next/link"
import { Frame, Palette, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const featureColumns = [
  {
    src: "/images/Oscar-portrait.webp",
    alt: "Portrait format pet portrait mockup",
    overlayLabel: "Portrait design",
    body: "Tall and gallery-ready. Perfect for staircases, hallways, and feature walls.",
    imageClassName: "object-cover object-top",
  },
  {
    src: "/images/Mochi-Landscape.webp",
    alt: "Landscape format pet portrait mockup",
    overlayLabel: "Landscape design",
    body: "Wide and cinematic. Ideal for mantels, shelves, and wide frames.",
    imageClassName: "object-cover",
  },
  {
    src: "/images/Willy-frame.webp",
    alt: "Pet name crafted into the portrait artwork",
    overlayLabel: "Pet name and unique characteristics",
    body: "Not a caption. Not a watermark. Their name is crafted into the costume itself — a badge, a crest, a name tag. Uniquely theirs.",
    imageClassName: "object-cover",
  },
] as const

const steps = [
  {
    step: "01",
    Icon: Palette,
    title: "Choose their theme",
    description:
      "King, Queen, Fireman, Pilot, Admiral, Samurai, Veterinarian, or Police Officer. Every theme is designed so your pet's name becomes part of the portrait itself.",
  },
  {
    step: "02",
    Icon: Upload,
    title: "Upload one photo",
    description:
      "One clear photo is all we need. We check it works before you pay — no surprises, no wasted money.",
  },
  {
    step: "03",
    Icon: Frame,
    title: "Receive your portrait",
    description:
      "Within minutes, two print-ready files land in your inbox — portrait format and landscape format — plus a free guide for printing and framing.",
  },
] as const

export function HowItWorksVisualSection() {
  return (
    <section id="process" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Part A */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">HOW IT WORKS</p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Simple enough for anyone.
            <br />
            Beautiful enough for any wall.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No tech skills needed. No subscription. Just your favourite photo and a few minutes of your time.
          </p>
        </div>

        {/* Part B — three step cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.Icon
            return (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-organic border border-border bg-card p-8 shadow-md transition-all hover:shadow-lg"
              >
                <span className="absolute -right-2 -top-4 select-none text-8xl font-black text-foreground/[0.03]">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-organic-sm bg-primary/10 text-primary shadow-sm transition-colors group-hover:bg-primary/15">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Part C — three image columns */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          {featureColumns.map((col) => (
            <figure key={col.src} className="flex flex-col items-center text-center">
              <div className="relative h-[240px] w-full overflow-hidden rounded-2xl shadow-md md:h-[340px]">
                <Image
                  src={col.src}
                  alt={col.alt}
                  fill
                  className={cn(col.imageClassName)}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-orange-500/80 via-orange-500/35 to-transparent px-3 pb-10 pt-4">
                  <p className="text-center text-sm font-semibold text-white drop-shadow-sm">
                    {col.overlayLabel}
                  </p>
                </div>
              </div>
              <figcaption className="mt-4 w-full">
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{col.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Part D */}
        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
            asChild
          >
            <Link href="/create">Create My Portrait →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
