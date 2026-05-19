import { InstagramHandleLink, TestimonialQuoteBlock } from "@/components/testimonial-quote-block"

const REMI_IG = "https://www.instagram.com/theremingtonkai/"

/** Remi's owner — above #pricing. Replace avatar with real IG crop in /public/images/testimonials/remi-owner-avatar.webp when ready. */
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
        avatar={{
          src: "/images/testimonials/remi-owner-avatar.webp",
          alt: "",
          instagramHref: REMI_IG,
          label: "Remi's owner on Instagram (@theremingtonkai)",
        }}
        attribution={
          <>
            Remi&apos;s owner · <InstagramHandleLink href={REMI_IG}>@theremingtonkai</InstagramHandleLink> · United
            States · May 2026
          </>
        }
      />
    </section>
  )
}
