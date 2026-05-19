import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

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
}

/**
 * Shared serif quote + decorative quotes + optional avatar — used for Remi (homepage) and Benny (pricing).
 */
export function TestimonialQuoteBlock({
  eyebrow,
  quoteLines,
  attribution,
  avatar,
  className,
}: TestimonialQuoteBlockProps) {
  return (
    <div className={className}>
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>

      <blockquote className="relative mx-auto mt-6 max-w-3xl text-foreground md:mt-8">
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-5">
          <span
            className="select-none font-serif text-[3rem] leading-[0.9] text-muted-foreground/25 sm:text-[3.5rem] md:text-[4rem]"
            aria-hidden
          >
            &ldquo;
          </span>
          <p
            className="max-w-xl text-left font-serif text-[22px] font-normal leading-[1.3] md:text-[28px] lg:text-[34px]"
          >
            {quoteLines.map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
            <span
              className="ml-1 inline-block align-top font-serif text-[2rem] leading-none text-muted-foreground/25 sm:text-[2.25rem] md:text-[2.75rem]"
              aria-hidden
            >
              &rdquo;
            </span>
          </p>
        </div>
      </blockquote>

      {avatar ? (
        <div className="mt-8 flex justify-center md:mt-9">
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

      <p className="mx-auto mt-5 max-w-2xl text-center text-sm font-normal leading-relaxed text-muted-foreground md:mt-6 md:text-[15px] md:leading-relaxed">
        {attribution}
      </p>
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
