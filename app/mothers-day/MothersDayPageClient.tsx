"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState, type SyntheticEvent } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Frame, Mail, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

const PROMO_CODE = "FORMUM20"
const PROMO_DEADLINE = new Date("2026-05-10T23:59:59-04:00")
const PRINT_DEADLINE = new Date("2026-05-08T23:59:59-04:00")

// Tight crop on Mochi's name patch — Card 1 visual.
// Uses Cloudinary transform on an existing portrait. No new asset needed.
const NAME_DETAIL_IMG_URL =
  "https://res.cloudinary.com/radical-thinking/image/upload/c_crop,w_1100,h_750,g_south/c_fill,w_900,h_600/v1774603488/u3mztrerxqukk2oue24b.jpg"

const FALLBACK_IMG = "/images/pet-after.webp"

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000 * 60)
    return () => clearInterval(t)
  }, [])
  if (!now) return null
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { expired: true, days: 0, hours: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  return { expired: false, days, hours }
}

export default function MothersDayPageClient() {
  const searchParams = useSearchParams()
  const petParam = searchParams.get("pet")?.toLowerCase().trim()
  const pet: "cat" | "dog" = petParam === "cat" ? "cat" : "dog"

  const printCountdown = useCountdown(PRINT_DEADLINE)
  const promoCountdown = useCountdown(PROMO_DEADLINE)

  const ctaHref = useMemo(
    () => `/create?promo=${PROMO_CODE}${pet === "cat" ? "&pet=cat" : ""}`,
    [pet],
  )

  const heroImg = FALLBACK_IMG
  const staysImg =
    pet === "cat" ? "/images/mothers-day-stays-cat.webp" : "/images/mothers-day-stays-dog.webp"

  const handleImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget
    if (!t.src.includes("pet-after")) t.src = FALLBACK_IMG
  }

  return (
    <>
      {/* HERO — unchanged */}
      <section className="relative isolate overflow-hidden bg-background pb-12 pt-10 sm:pt-14 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Mother&apos;s Day · May 11
              </p>
              <h1 className="font-heading mt-3 text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                The gift she&apos;ll keep on her wall.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                A personalised portrait of her pet — name crafted into the artwork itself.
                Delivered to your inbox in minutes. Print-ready in two formats.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-organic-sm border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground">
                <span className="font-semibold text-primary">{PROMO_CODE}</span>
                <span>— 20% off, ends May 10</span>
              </div>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-organic-sm px-7 py-6 text-base font-semibold"
                >
                  <Link href={ctaHref}>Make her gift →</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  From $17 · One-time · Satisfaction guaranteed
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-organic shadow-xl shadow-foreground/10">
                <Image
                  src={heroImg}
                  alt="A framed pet portrait — a Mother's Day gift idea"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 36rem"
                  priority
                  fetchPriority="high"
                  onError={handleImgError}
                />
              </div>
              {printCountdown && !printCountdown.expired && (
                <p className="mx-auto mt-4 max-w-md text-center text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Order by May 8 to print &amp; frame in time
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* OUCH — pattern interrupt */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-organic shadow-xl shadow-foreground/10">
            <Image
              src="/images/mothers-day-ouch.webp"
              alt="A wilted Mother's Day bouquet — last year's gift"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 56rem"
              onError={handleImgError}
            />
          </div>
          <p className="mt-6 text-center font-heading text-2xl italic text-muted-foreground md:text-3xl">
            You meant well.
          </p>
        </div>
      </section>

      {/* STAYS — the answer */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-organic shadow-xl shadow-foreground/10">
            <Image
              src={staysImg}
              alt={`A framed pet portrait on the wall above a sleeping ${pet}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 56rem"
              onError={handleImgError}
            />
          </div>
          <p className="mt-6 text-center font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            This stays.
          </p>
        </div>
      </section>

      {/* NOT ANOTHER CANDLE — 3 visual cards */}
      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Not another candle. Not another mug.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              A portrait of the pet she loves — with their name part of the artwork — is the kind
              of gift that stays on the wall long after the flowers wilt.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            {/* Card 1 — Name in art */}
            <div className="overflow-hidden rounded-organic border border-border bg-background shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={NAME_DETAIL_IMG_URL}
                  alt="Close-up of pet name woven into the artwork"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                  onError={handleImgError}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Their name in the art.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Crafted into the painting itself — not a caption underneath.
                </p>
              </div>
            </div>

            {/* Card 2 — Two formats */}
            <div className="overflow-hidden rounded-organic border border-border bg-background shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src="/images/mothers-day-frames-wall.webp"
                  alt="A cat and dog portrait framed on a wall — landscape and portrait formats"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={handleImgError}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Two formats included.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Portrait for walls. Landscape for mantels. Both with every order.
                </p>
              </div>
            </div>

            {/* Card 3 — Framing */}
            <div className="overflow-hidden rounded-organic border border-border bg-background shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src="/images/mothers-day-framing.webp"
                  alt="Hands assembling an oak picture frame on a kitchen counter"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={handleImgError}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Print &amp; frame the same day.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Local print shop, simple frame, on the wall by tonight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE DAYS, THREE STEPS — with lucide icons */}
      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="font-heading mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Three days. Three steps. From your inbox to her wall.
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            <li className="relative rounded-organic border border-border bg-card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Step 1 · Today
              </p>
              <h3 className="font-heading mt-2 text-xl font-bold text-foreground">
                Order today.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Upload one photo. Pick a theme. We email both formats, print-ready, in minutes.
              </p>
            </li>

            <li className="relative rounded-organic border border-border bg-card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Printer className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Step 2 · 1–2 days
              </p>
              <h3 className="font-heading mt-2 text-xl font-bold text-foreground">
                Print at any local print service.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your local print shop or any larger retail outlet with a photo or print kiosk can
                handle this in a day. Same-day pickup is common.
              </p>
            </li>

            <li className="relative rounded-organic border border-border bg-card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Frame className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Step 3 · Same day
              </p>
              <h3 className="font-heading mt-2 text-xl font-bold text-foreground">
                Frame it the same day.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A simple ready-made frame from the same store, or one she already has at home.
                Done.
              </p>
            </li>
          </ol>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Coming soon:</span> FluffyFriends will
            print &amp; frame for you, delivered to her door. For now, your local print service
            has you covered.
          </p>
        </div>
      </section>

      {/* BLOG EXCERPT — emotional human voice, lower on the page */}
      <section className="bg-secondary py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-organic shadow-xl shadow-foreground/10">
              <Image
                src="/images/Oscar-portrait.webp"
                alt="A king portrait hanging in a living room — pet's name in the crown"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 28rem"
                onError={handleImgError}
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                From our journal
              </p>
              <h2 className="font-heading mt-3 text-balance text-2xl font-extrabold leading-snug tracking-tight text-foreground md:text-3xl">
                For the mum who&apos;s really a dog mum first.
              </h2>
              <blockquote className="mt-6 border-l-2 border-primary/40 pl-5 text-pretty text-base italic leading-relaxed text-foreground/85 md:text-lg">
                &ldquo;Every morning, before the rest of the house is awake, she&apos;s already up.
                She&apos;s let the dog out, filled the bowl, waited patiently by the back door. By
                the time anyone else comes downstairs, she&apos;s already done more for this family
                than most people do before lunch — and nobody has said a word about it.&rdquo;
              </blockquote>
              <Link
                href="/blog/mothers-day-dog-mum"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Read the full piece
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Make her something she&apos;ll keep.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            One photo. A name. A few minutes. Code{" "}
            <span className="font-semibold text-primary">{PROMO_CODE}</span> takes 20% off through
            May 10.
          </p>
          <div className="mt-7">
            <Button
              asChild
              size="lg"
              className="rounded-organic-sm px-7 py-6 text-base font-semibold"
            >
              <Link href={ctaHref}>Make her gift →</Link>
            </Button>
          </div>
          {promoCountdown && !promoCountdown.expired && promoCountdown.days <= 7 && (
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {promoCountdown.days > 0
                ? `${promoCountdown.days} day${promoCountdown.days === 1 ? "" : "s"} left`
                : `${promoCountdown.hours} hour${promoCountdown.hours === 1 ? "" : "s"} left`}{" "}
              to use {PROMO_CODE}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
