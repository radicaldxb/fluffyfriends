import { TestimonialQuoteBlock } from "@/components/testimonial-quote-block"

const REMI_IG = "https://www.instagram.com/theremingtonkai/"

/** Remi's owner — above #pricing. Avatar: /public/images/testimonials/remi-avatar.webp (500×500 source, displayed small). */
export function HomeBuyerQuoteSection() {
  return (
    <section aria-label="Customer story" className="relative py-8 md:py-12">
      <TestimonialQuoteBlock
        relaxed
        eyebrow="What buyers are doing with theirs"
        quoteLines={[
          `I'll be putting them in frames in`,
          `Remi's doggy corner of the living room.`,
        ]}
        instagram={{ href: REMI_IG, handle: "@theremingtonkai" }}
        detailLine="Remi's owner · United States · May 2026"
        avatar={{
          src: "/images/testimonials/remi-avatar.webp",
          alt: "",
          instagramHref: REMI_IG,
          label: "Remi's owner on Instagram (@theremingtonkai)",
        }}
      />
    </section>
  )
}
