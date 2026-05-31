import Image from "next/image"
import Link from "next/link"
import { SketchSquiggle } from "@/components/sketch-divider"

const quoteMarkClass =
  "inline select-none align-top font-serif text-[1.5rem] leading-none text-muted-foreground/25 sm:text-[1.75rem]"

const REVIEWS = [
  {
    quote:
      "Honestly obsessed with these portraits! The quality is amazing and the attention to detail in the uniforms perfectly captured our cats' attitude. The whole process was super fast and easy—we can't wait to frame them!",
    handle: "@salemandfloki.siamesecats",
    href: "https://www.instagram.com/salemandfloki.siamesecats/",
    avatarSrc: "/images/testimonials/remi-avatar.webp",
    avatarLabel: "Salem and Floki on Instagram (@salemandfloki.siamesecats)",
  },
  {
    quote:
      "I LOOVVVEEEE THE FINAL PHOTOS! It was easy fun and didn't take much time to do overall an A.... I would say A+",
    handle: "@therealbingo3000",
    href: "https://www.instagram.com/therealbingo3000/",
    avatarSrc: "/images/testimonials/benny-avatar.webp",
    avatarLabel: "Bingo on Instagram (@therealbingo3000)",
  },
] as const

/** Two buyer quotes below Our story on the homepage. */
export function HomeStoryReviewsSection() {
  return (
    <section aria-label="Buyer reviews" className="pb-14 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-7xl px-6 pb-6 md:pb-8" aria-hidden>
          <SketchSquiggle narrow />
        </div>

        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-primary">
          What buyers are doing with theirs
        </p>

        <div className="mt-8 grid grid-cols-1 gap-10 md:mt-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          {REVIEWS.map((review) => (
            <article
              key={review.handle}
              className="flex flex-col items-center text-center"
            >
              <blockquote className="relative w-full max-w-xl text-foreground">
                <p className="text-pretty text-center font-serif text-lg font-normal leading-snug sm:text-xl md:text-[22px] md:leading-[1.35]">
                  <span className={`${quoteMarkClass} mr-0.5`} aria-hidden>
                    &ldquo;
                  </span>
                  {review.quote}
                  <span className={quoteMarkClass} aria-hidden>
                    &rdquo;
                  </span>
                </p>
              </blockquote>

              <div className="mt-6 flex justify-center md:mt-7">
                <Link
                  href={review.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-opacity hover:opacity-90"
                  aria-label={review.avatarLabel}
                >
                  <Image
                    src={review.avatarSrc}
                    alt=""
                    width={500}
                    height={500}
                    sizes="(max-width: 640px) 64px, 72px"
                    quality={90}
                    className="h-16 w-16 rounded-full object-cover sm:h-[72px] sm:w-[72px]"
                  />
                </Link>
              </div>

              <Link
                href={review.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 text-base font-bold text-foreground transition-colors hover:text-primary md:text-[17px]"
              >
                {review.handle}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
