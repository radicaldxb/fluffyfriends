import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    step: "01",
    title: "Choose their theme",
    description:
      "Browse 8 themes — from regal Kings and Queens to fearless Pilots, Admirals and Samurai warriors — each one named and personalised.",
  },
  {
    step: "02",
    title: "Upload one photo",
    description: "One clear photo. We check it before you pay.",
  },
  {
    step: "03",
    title: "Receive your portrait",
    description: "Two print-ready files in your inbox within minutes.",
  },
] as const

const featureCards = [
  {
    id: "portrait",
    image: "/images/Oscar-portrait.webp",
    alt: "Portrait-format pet art mockup on a wall",
    headline: (
      <>
        Portrait format.
        <br />
        Made for your wall.
      </>
    ),
    subtext: "Tall format — perfect for walls, staircases and narrow frames.",
  },
  {
    id: "landscape",
    image: "/images/Mochi-Landscape.webp",
    alt: "Landscape-format pet portrait above a sofa",
    headline: (
      <>
        Landscape format.
        <br />
        Made for your mantle.
      </>
    ),
    subtext: "Wide format — perfect for mantels, sideboards and statement walls.",
  },
  {
    id: "name",
    image: "/images/Willy.webp",
    alt: "Pilot portrait with personalised name tag",
    headline: (
      <>
        Their name.
        <br />
        In the portrait.
      </>
    ),
    subtext: "Not a sticker. Not typed underneath. Crafted into the artwork itself.",
  },
  {
    id: "unique",
    image: "/images/Willy.webp",
    alt: "Unique pet portrait showing character details",
    headline: (
      <>
        Every pet is unique.
        <br />
        So is every portrait.
      </>
    ),
    subtext:
      "One eye, three legs, a splash of white — our AI captures exactly what makes your pet theirs.",
  },
] as const

export function HowItWorksVisualSection() {
  return (
    <section id="process" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Part 1 — How it works */}
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

        {/* Part 2 — What you get */}
        <div className="mx-auto mt-16 max-w-2xl text-center md:mt-24">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">WHAT YOU GET</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {featureCards.slice(0, 2).map((card) => (
            <FeatureCard
              key={card.id}
              image={card.image}
              alt={card.alt}
              headline={card.headline}
              subtext={card.subtext}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Both formats included with every order. No extra charge. 🐾
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {featureCards.slice(2, 4).map((card) => (
            <FeatureCard
              key={card.id}
              image={card.image}
              alt={card.alt}
              headline={card.headline}
              subtext={card.subtext}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  image,
  alt,
  headline,
  subtext,
}: {
  image: string
  alt: string
  headline: ReactNode
  subtext: string
}) {
  return (
    <article className="group flex min-h-[360px] flex-col overflow-hidden rounded-[12px] shadow-md transition-transform duration-200 ease-out hover:-translate-y-1">
      <div className="relative min-h-0 flex-[55] basis-0">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-[45] flex-col justify-center bg-secondary px-4 py-5 sm:px-5">
        <h3 className="text-lg font-bold leading-snug text-foreground">{headline}</h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{subtext}</p>
      </div>
    </article>
  )
}
