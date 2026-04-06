import Image from "next/image"
import Link from "next/link"
import { Frame, Palette, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

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

const featureColumns = [
  {
    src: "/images/king-portrait-wall.webp",
    alt: "Portrait format pet portrait on wall",
    headline: "Hang it on your wall.",
    body: "Portrait format — tall and gallery-ready. Perfect for staircases, hallways, and feature walls.",
  },
  {
    src: "/images/mochi-landscape-wall.webp",
    alt: "Landscape format pet portrait on wall",
    headline: "Display it anywhere.",
    body: "Landscape format — wide and cinematic. Ideal for mantels, shelves, and wide frames.",
  },
  {
    src: "/images/willy-name-detail.webp",
    alt: "Pet name crafted into the portrait artwork",
    headline: "Their name. In the art.",
    body: "Not a caption. Not a watermark. Their name is crafted into the costume itself — a badge, a crest, a name tag. Uniquely theirs.",
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

        {/* Part B */}
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

        {/* Part C */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          {featureColumns.map((col) => (
            <figure key={col.src} className="flex flex-col items-center text-center">
              <div className="relative h-[240px] w-full overflow-hidden rounded-2xl shadow-md md:h-[340px]">
                <Image
                  src={col.src}
                  alt={col.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-4 w-full">
                <h3 className="text-base font-bold tracking-tight text-foreground">{col.headline}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{col.body}</p>
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
            <Link href="/create">See What Your Pet Would Look Like →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
