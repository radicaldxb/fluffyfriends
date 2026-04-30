"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type SeasonalCampaign = {
  eyebrow: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  imageSrc: string
  imageAlt: string
  endsOn?: string
}

// Active campaign — set to null to hide the section.
const ACTIVE: SeasonalCampaign | null = {
  eyebrow: "Mother's Day · May 11",
  headline: "The gift she'll keep on her wall.",
  body: "A personalised portrait of her pet — name crafted into the artwork itself. 20% off with FORMUM20 through May 10.",
  ctaLabel: "See the gift →",
  ctaHref: "/mothers-day",
  imageSrc: "/images/pet-after.webp",
  imageAlt: "Mother's Day pet portrait gift",
  endsOn: "May 10",
}

export function SeasonalCampaignSection() {
  if (!ACTIVE) return null

  return (
    <section className="bg-secondary py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-organic border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:gap-12 md:p-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-organic-sm">
            <Image
              src={ACTIVE.imageSrc}
              alt={ACTIVE.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 32rem"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {ACTIVE.eyebrow}
            </p>
            <h2 className="font-heading mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {ACTIVE.headline}
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              {ACTIVE.body}
            </p>
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="rounded-organic-sm px-7 py-6 text-base font-semibold"
              >
                <Link href={ACTIVE.ctaHref}>{ACTIVE.ctaLabel}</Link>
              </Button>
            </div>
            {ACTIVE.endsOn && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Ends {ACTIVE.endsOn}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
