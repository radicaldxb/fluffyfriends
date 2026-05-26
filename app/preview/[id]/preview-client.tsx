"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { PreviewRevealStageB } from "@/components/preview-reveal-stage-b"
import { cn } from "@/lib/utils"

export type PortraitForPreviewLink = {
  id: string
  pet_name: string | null
  theme: string | null
}

type Props = {
  portrait: PortraitForPreviewLink
  portraitCreatedAtIso?: string | null
  expired: boolean
  watermarkLandscapeSrc: string
  watermarkPortraitSrc: string
  rawLandscapeFallbackUrl: string | null
}

export function PreviewRouteClient({
  portrait,
  portraitCreatedAtIso,
  expired,
  watermarkLandscapeSrc,
  watermarkPortraitSrc,
  rawLandscapeFallbackUrl,
}: Props) {
  const theme = portrait.theme?.trim() || ""
  const rawName = portrait.pet_name?.trim() || ""
  const params = new URLSearchParams()
  if (theme) params.set("theme", theme)
  if (rawName) params.set("name", rawName)
  const createHref = params.toString() ? `/create?${params.toString()}` : "/create"

  if (expired) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="flex-1 py-14 md:py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              This preview has expired
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              But we can create a new one for{" "}
              <span className="text-foreground font-medium">{rawName ? rawName : "your pet"}</span> right now.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild className="rounded-organic-sm bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 hover:bg-primary/90">
                <Link href={createHref}>Start again on Create</Link>
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className={cn("min-h-screen bg-background flex flex-col", "pb-24 md:pb-0")}>
      <Navbar />
      <section className={cn("flex-1 pt-4 pb-8 md:py-14")}>
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <PreviewRevealStageB
            portraitId={portrait.id}
            theme={portrait.theme}
            petNameTrimmed={rawName}
            watermarkLandscapeSrc={watermarkLandscapeSrc}
            watermarkPortraitSrc={watermarkPortraitSrc}
            rawFallbackUrl={rawLandscapeFallbackUrl}
            portraitCreatedAtIso={portraitCreatedAtIso}
            defaultProductId="starter"
            mobileStickyPriceSuffix=" USD"
          />
        </div>
      </section>
      <Footer />
    </main>
  )
}
