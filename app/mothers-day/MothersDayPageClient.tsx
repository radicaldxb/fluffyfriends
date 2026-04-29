"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Print cutoff — give US shipping enough time to receive a printed portrait by Mother's Day (May 11, 2026).
// 23:59:59 UTC on May 8 corresponds to late afternoon Pacific time on the 8th.
const PRINT_CUTOFF = new Date("2026-05-08T23:59:59Z")
// Discount code expiry
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

  // CTA destination — drives Cindy into /create with FORMUM20 pre-applied.
  const ctaHref = "/create?theme=king&promo=FORMUM20"

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Copy column */}
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Mother&apos;s Day · May 11
              </p>
              <h1 className="font-heading mt-3 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                The gift she&apos;ll keep <span className="text-primary">on her wall.</span>
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                A personalised portrait of her pet — name crafted into the artwork itself. Delivered to your inbox
                in minutes. Print-ready in two formats.
              </p>

              {/* Discount badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-organic-sm border border-primary/40 bg-primary/10 px-4 py-2">
                <span className="text-sm font-bold tracking-wide text-primary">FORMUM20</span>
                <span className="text-sm text-foreground">
                  — 20% off, ends{" "}
                  {codeCountdown.mounted && !codeCountdown.ended
                    ? `${codeCountdown.days}d ${codeCountdown.hours}h ${codeCountdown.minutes}m ${codeCountdown.seconds}s`
                    : "May 10"}
                </span>
              </div>

              {/* Primary CTA */}
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

            {/* Image column */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-organic shadow-xl shadow-foreground/10 ring-1 ring-border/50">
                {/* Swap src when dedicated Mother&apos;s Day hero image is ready */}
                <Image
                  src="/images/pet-after.webp"
                  alt="A framed pet portrait — a Mother's Day gift idea"
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

      {/* URGENCY STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[2.75rem] flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Order by May 8 to print &amp; frame in time
            </p>
            {printCountdown.mounted && !printCountdown.ended ? (
              <div className="flex items-center gap-2 font-mono text-base tabular-nums text-foreground">
                <span>
                  <span className="font-bold">{printCountdown.days}</span>d
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span className="font-bold">{printCountdown.hours}</span>h
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span className="font-bold">{printCountdown.minutes}</span>m
                </span>
              </div>
            ) : printCountdown.mounted && printCountdown.ended ? (
              <p className="text-sm text-muted-foreground">Digital delivery still available — order today</p>
            ) : (
              <span className="inline-block font-mono text-base tabular-nums text-transparent opacity-0" aria-hidden>
                —
              </span>
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
            A portrait of the pet she loves — with their name part of the artwork — is the kind of gift that stays on the
            wall long after the flowers wilt. It speaks to who she is, not what the gift category is.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Their name in the art.",
                body: "Crafted into the painting itself — not a caption underneath.",
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
