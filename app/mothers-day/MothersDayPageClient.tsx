"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

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

export default function MothersDayPageClient() {
  const printCountdown = useCountdown(PRINT_CUTOFF)
  const codeCountdown = useCountdown(CODE_EXPIRY)

  const ctaHref = "/create?promo=FORMUM20"

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Mother&apos;s Day · May 11
              </p>
              <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                The gift she&apos;ll keep <span className="text-primary">on her wall.</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                A personalised portrait of her pet, with their name crafted into the artwork itself. Delivered to your inbox
                in minutes. Print-ready in two formats.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-organic-sm border border-primary/40 bg-primary/10 px-4 py-2">
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

            <div className="order-1 lg:order-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-organic shadow-xl shadow-foreground/10 ring-1 ring-border/50">
                <Image
                  src="/images/pet-after.webp"
                  alt="A framed pet portrait, a Mother's Day gift idea"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 36rem"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY STRIP: print cutoff countdown */}
      <section className="bg-primary py-5">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-5">
            <p className="text-base font-bold uppercase tracking-wider text-primary-foreground">Print cutoff: May 8</p>
            {printCountdown.mounted && !printCountdown.ended ? (
              <div className="flex items-center gap-2 text-lg font-extrabold tabular-nums text-primary-foreground">
                <span>{printCountdown.days}d</span>
                <span aria-hidden className="opacity-60">
                  ·
                </span>
                <span>{printCountdown.hours}h</span>
                <span aria-hidden className="opacity-60">
                  ·
                </span>
                <span>{printCountdown.minutes}m</span>
                <span className="ml-2 hidden text-sm font-semibold opacity-90 sm:inline">left to order in time</span>
              </div>
            ) : printCountdown.ended ? (
              <p className="text-sm font-semibold text-primary-foreground">Digital delivery still available. Order today.</p>
            ) : (
              <div className="min-h-[1.75rem] w-full max-w-xs" aria-hidden />
            )}
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
    </>
  )
}
