import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { SketchSquiggle } from "@/components/sketch-divider"
import { cn } from "@/lib/utils"

type TestimonialQuoteBlockProps = {
  /** Orange uppercase eyebrow, centred */
  eyebrow: string
  /** One or more lines of the quote (joined with line breaks) */
  quoteLines: string[]
  /** Full attribution line(s), centred — include links as needed */
  attribution: ReactNode
  /** Optional centred avatar between quote and attribution */
  avatar?: { src: string; alt?: string; instagramHref: string; label: string }
  className?: string
  /** Hand-drawn squiggles (matches SketchDivider line) */
  squiggleAbove?: boolean
  squiggleBelow?: boolean
  /** Extra vertical rhythm inside the quote block */
  relaxed?: boolean
}

const quoteMarkClass =
  "inline select-none align-top font-serif text-[2rem] leading-none text-muted-foreground/25 sm:text-[2.25rem] md:text-[2.75rem]"

/**
 * Shared serif quote + decorative quotes + optional avatar — used for Remi (homepage) and Benny (pricing).
 */
export function TestimonialQuoteBlock({
  eyebrow,
  quoteLines,
  attribution,
  avatar,
  className,
  squiggleAbove = false,
  squiggleBelow = true,
  relaxed = false,
}: TestimonialQuoteBlockProps) {
  const gapAfterEyebrow = relaxed ? "mt-8 md:mt-10" : "mt-6 md:mt-8"
  const gapAvatar = relaxed ? "mt-9 md:mt-10" : "mt-8 md:mt-9"
  const gapAttribution = relaxed ? "mt-6 md:mt-8" : "mt-5 md:mt-6"

  return (
    <div className={className}>
      {squiggleAbove ? (
        <div className="mx-auto max-w-7xl px-6 pb-6 md:pb-8" aria-hidden>
          <SketchSquiggle />
        </div>
      ) : null}

      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>

      <blockquote className={cn("relative mx-auto max-w-3xl text-foreground", gapAfterEyebrow)}>
        <p
          className="text-balance text-center font-serif text-[22px] font-normal leading-[1.3] md:text-[28px] lg:text-[34px]"
        >
          <span className={`${quoteMarkClass} mr-0.5`} aria-hidden>
            &ldquo;
          </span>
          {quoteLines.map((line, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
          <span className={quoteMarkClass} aria-hidden>
            &rdquo;
          </span>
        </p>
      </blockquote>

      {avatar ? (
        <div className={cn("flex justify-center", gapAvatar)}>
          <Link
            href={avatar.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-opacity hover:opacity-90"
            aria-label={avatar.label}
          >
            <Image
              src={avatar.src}
              alt={avatar.alt ?? ""}
              width={72}
              height={72}
              className="h-16 w-16 rounded-full object-cover sm:h-[72px] sm:w-[72px]"
            />
          </Link>
        </div>
      ) : null}

      <p
        className={cn(
          "mx-auto max-w-2xl text-center text-sm font-normal leading-relaxed text-muted-foreground md:text-[15px] md:leading-relaxed",
          gapAttribution,
        )}
      >
        {attribution}
      </p>

      {squiggleBelow ? (
        <div className="mx-auto mt-8 max-w-7xl px-6 pt-4 md:mt-10 md:pt-6" aria-hidden>
          <SketchSquiggle />
        </div>
      ) : null}
    </div>
  )
}

/** Convenience: standard linked @handle in attribution row */
export function InstagramHandleLink({
  href,
  children,
}: {
  href: string
  children: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
    >
      {children}
    </Link>
  )
}
