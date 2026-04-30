"use client"

/**
 * Mother's Day landing page.
 *
 * URL convention:
 * - /mothers-day            → defaults to dog hero (organic/direct traffic)
 * - /mothers-day?pet=cat    → cat hero (cat creative ads land here)
 * - /mothers-day?pet=dog    → dog hero (dog creative ads land here)
 *
 * The `pet` param is forwarded to /create so future work can filter theme
 * previews to match (cat-clicker sees cats throughout the funnel).
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GalleryImageLightbox } from "@/components/gallery-image-lightbox"

// Print cutoff: US shipping time for a printed portrait by Mother's Day (May 11, 2026).
// 23:59:59 UTC on May 8 corresponds to late afternoon Pacific on the 8th.
const PRINT_CUTOFF = new Date("2026-05-08T23:59:59Z")
const CODE_EXPIRY = new Date("2026-05-10T23:59:59Z")

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  if (!now) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: false, mounted: false }
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, mounted: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, ended: false, mounted: true }
}

/** Print cutoff strip — segmented countdown aligned with homepage visual weight */
function PrintCutoffCountdown(props: ReturnType<typeof useCountdown>) {
  const { mounted, ended, days, hours, minutes, seconds } = props
  const segments = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ] as const

  if (!mounted) {
    return <div className="min-h-[5.25rem] w-full max-w-xl sm:max-w-none" aria-hidden />
  }
  if (ended) {
    return (
      <p className="max-w-xl text-center text-base font-semibold leading-snug text-primary-foreground sm:text-lg">
        Digital delivery still available. Order today.
      </p>
    )
  }
  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Time remaining until May 8 print cutoff: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
      className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10"
    >
      <span className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/90 sm:hidden">
        Time left to order prints in time
      </span>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">
        {segments.map(({ label, value }) => (
          <div
            key={label}
            className="flex min-w-[4.75rem] flex-col items-center rounded-organic-sm border border-primary-foreground/25 bg-primary-foreground/12 px-3 py-3 shadow-inner sm:min-w-[5.5rem] sm:px-4 sm:py-3.5 md:min-w-[6.25rem] md:px-5 md:py-4"
          >
            <span className="text-2xl font-extrabold tabular-nums leading-none tracking-tight text-primary-foreground sm:text-3xl md:text-[2.125rem]">
              {value}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80 sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MothersDayPageClient() {
  const searchParams = useSearchParams()
  const petParam = searchParams.get("pet")?.toLowerCase().trim()
  const pet: "cat" | "dog" = petParam === "cat" ? "cat" : "dog"

  const printCountdown = useCountdown(PRINT_CUTOFF)
  const codeCountdown = useCountdown(CODE_EXPIRY)

  const ctaHref = `/create?promo=FORMUM20${pet === "cat" ? "&pet=cat" : ""}`

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Mobile: eyebrow + title first · Desktop: stacks in left column */}
            <div className="order-1 lg:col-start-1 lg:row-start-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Mother&apos;s Day · May 11
              </p>
              <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                The gift she&apos;ll keep <span className="text-primary">on her wall.</span>
              </h1>
            </div>

            {/* Mobile: hero image directly under headline · Desktop: right column */}
            <div className="order-2 min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
              {/*
                Source assets are 1024×572 (~16:9). A 4:3 box forced object-cover to crop
                left/right (tray edges). Match native aspect + center so the full scene shows.
                For retina sharpness, replace files with 2× width (e.g. 2048w) same ratio.
              */}
              <div
                className="relative w-full min-w-0 overflow-hidden rounded-organic shadow-xl shadow-foreground/10 ring-1 ring-border/50"
                style={{ aspectRatio: "1024 / 572" }}
              >
                <Image
                  src={
                    pet === "cat"
                      ? "/images/mothers-day-hero-cat.webp"
                      : "/images/mothers-day-hero-dog.webp"
                  }
                  alt={
                    pet === "cat"
                      ? "A Mother's Day cat portrait gift on a breakfast tray"
                      : "A Mother's Day dog portrait gift on a breakfast tray"
                  }
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 720px"
                  quality={95}
                  priority
                  fetchPriority="high"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    if (!target.src.includes("pet-after")) {
                      target.src = "/images/pet-after.webp"
                    }
                  }}
                />
              </div>
            </div>

            {/* Mobile: deck + promo + CTA under image */}
            <div className="order-3 lg:col-start-1 lg:row-start-2">
              <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg lg:mt-0">
                A personalised portrait of her pet, with their name crafted into the artwork itself. Delivered to your inbox
                in minutes. Print-ready in two formats.
              </p>

              <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-organic-sm border border-primary/40 bg-primary/10 px-4 py-2">
                <span className="text-sm font-bold tracking-wide text-primary">FORMUM20</span>
                <span className="text-sm text-foreground">
                  · 20% off, ends{" "}
                  {codeCountdown.mounted && !codeCountdown.ended
                    ? `in ${codeCountdown.days}d ${codeCountdown.hours}h`
                    : "May 10"}
                </span>
              </div>

              <div className="mt-7">
                <Button
                  asChild
                  size="lg"
                  className="inline-flex h-auto w-full items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 sm:w-auto"
                >
                  <Link href={ctaHref}>Make her gift →</Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">From $17 · One-time · Satisfaction guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY STRIP: print cutoff countdown */}
      <section className="border-y border-primary-foreground/10 bg-primary py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/90 md:text-base">
                Print cutoff: May 8
              </p>
              <p className="mt-2 hidden text-sm font-medium text-primary-foreground/80 md:block md:text-base">
                Order in time so you can pick up prints before Mother&apos;s Day
              </p>
            </div>
            <PrintCutoffCountdown {...printCountdown} />
          </div>
        </div>
      </section>

      {/* WHY THIS GIFT */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Not another candle. Not another mug.
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            A portrait of the pet she loves, with their name woven into the artwork, is the kind of gift that stays on the wall
            long after the flowers wilt. It speaks to who she is, not what the gift category is.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Their name in the art.",
                body: "Crafted into the painting itself, not a caption underneath.",
              },
              {
                title: "Two formats included.",
                body: "Portrait for walls. Landscape for mantels. Both with every order.",
              },
              {
                title: "Delivered in minutes.",
                body: "Upload one photo. We email both formats, print-ready, the same day.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-organic border border-border bg-card p-5 text-left">
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO PRINT AND FRAME */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Three days. Three steps.</p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              From your inbox to her wall.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              We email you two print-ready files (portrait and landscape). Order a print at any major US retailer. Frame it.
              Wrap it.
            </p>
          </div>

          <ol className="mt-10 space-y-5 text-left">
            <li className="rounded-organic border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="text-base font-bold text-foreground">Order today, get the file in minutes.</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Both portrait and landscape formats arrive in your inbox the same day, ready to print.
                  </p>
                </div>
              </div>
            </li>

            <li className="rounded-organic border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="text-base font-bold text-foreground">Print it at a US retailer.</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Walgreens Photo, Walmart Photo, CVS Photo, or Costco Photo all offer same-day or next-day pickup.
                    Recommended sizes: 8×10 or 11×14 for shelves and small walls, 16×20 for a statement piece.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Typical cost: $5–$15 for an 8×10 print, $15–$30 for 16×20.
                  </p>
                </div>
              </div>
            </li>

            <li className="rounded-organic border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="text-base font-bold text-foreground">Frame it the same day.</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Pick up a ready-made frame at Target, Michaels, Hobby Lobby, or Walmart. Most stock frames in standard
                    print sizes for under $25.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tip: a simple black or natural wood frame lets the portrait do the talking.
                  </p>
                </div>
              </div>
            </li>
          </ol>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Order by May 8 to print and frame in time for Mother&apos;s Day.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF — same card treatment as homepage GallerySection */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Real pets, real moms</p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              From cats to dogs, every pet becomes the art.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              {
                src: "https://res.cloudinary.com/radical-thinking/image/upload/v1774603488/u3mztrerxqukk2oue24b.jpg",
                name: "Mochi",
                theme: "Fireman",
                location: "Houston, United States",
              },
              {
                src: "https://res.cloudinary.com/radical-thinking/image/upload/v1774335527/xdjupp5oebzhk3mclz0s.jpg",
                name: "Misty",
                theme: "Queen",
                location: "New York, United States",
              },
              {
                src: "https://res.cloudinary.com/radical-thinking/image/upload/v1775149148/Fluffyfriends/h6qqohgzavsvwg0zbehz.jpg",
                name: "Raddix",
                theme: "King",
                location: "Huntington Beach, United States",
              },
              {
                src: "https://res.cloudinary.com/radical-thinking/image/upload/v1774335833/utruzpjmo0uhwp9btv3i.jpg",
                name: "Bruce",
                theme: "Admiral",
                location: "Perth, Australia",
              },
            ].map((p, index) => {
              const line = `${p.name} · ${p.location}`
              const caption = `${p.name} · ${p.theme}`
              return (
                <div
                  key={`${p.src}-${index}`}
                  className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-organic border border-border/50"
                >
                  <Image
                    src={p.src}
                    alt={caption}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        src: p.src,
                        alt: `${p.name} as a ${p.theme}, FluffyFriends portrait`,
                      })
                    }
                    className="absolute inset-0 z-10 rounded-organic focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`View larger — ${line}`}
                  />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-orange-500/80 to-transparent px-3 py-4">
                    <p className="text-sm font-semibold text-white drop-shadow-sm">
                      {p.name}
                      <span className="font-normal text-white/90"> · {p.location}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/gallery"
              className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              See more pets in our gallery →
            </Link>
          </div>
        </div>
      </section>

      {/* SECONDARY CTA */}
      <section className="bg-card py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Make her something she&apos;ll keep.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            One photo. A name. A few minutes. Code FORMUM20 takes 20% off through May 10.
          </p>
          <div className="mt-6">
            <Button
              asChild
              size="lg"
              className="inline-flex h-auto items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40"
            >
              <Link href={ctaHref}>Make her gift →</Link>
            </Button>
          </div>
        </div>
      </section>

      <GalleryImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />
    </>
  )
}
