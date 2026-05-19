import Image from "next/image"
import Link from "next/link"

const REMI_IG = "https://www.instagram.com/theremingtonkai/"

/** Remi's owner — strong social proof, above #pricing. Replace avatar in /public/images/testimonials/remi-owner-avatar.webp with the real IG crop when available. */
export function HomeBuyerQuoteSection() {
  return (
    <section
      aria-label="Customer story"
      className="relative py-20 md:py-28 lg:py-[7.5rem]"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          What buyers are doing with theirs
        </p>

        <blockquote className="relative mx-auto mt-10 max-w-3xl pt-6 text-foreground md:pt-8">
          <span
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-serif text-[5rem] leading-none text-muted-foreground/25 md:text-[6.25rem]"
            aria-hidden
          >
            &ldquo;
          </span>
          <p
            className="relative z-[1] mx-auto max-w-2xl px-2 font-serif text-[22px] font-normal leading-[1.3] md:text-[28px] lg:text-[34px]"
          >
            I&apos;ll be putting them in frames in
            <br />
            Remi&apos;s doggy corner of the living room.
            <span
              className="ml-0.5 align-top font-serif text-[2.5rem] leading-none text-muted-foreground/25 md:text-[3rem]"
              aria-hidden
            >
              &rdquo;
            </span>
          </p>
        </blockquote>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:mt-16 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Link
            href={REMI_IG}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-opacity hover:opacity-90"
            aria-label="Remi's owner on Instagram (@theremingtonkai)"
          >
            <Image
              src="/images/testimonials/remi-owner-avatar.webp"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          </Link>
          <p className="mx-auto max-w-2xl text-center text-sm font-normal leading-relaxed text-muted-foreground md:text-[15px] md:leading-relaxed">
            Remi&apos;s owner ·{" "}
            <Link
              href={REMI_IG}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              @theremingtonkai
            </Link>{" "}
            · United States · May 2026
          </p>
        </div>
      </div>
    </section>
  )
}
