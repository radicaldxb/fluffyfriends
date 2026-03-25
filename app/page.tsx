import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HeroDifferentiatorStrip } from "@/components/hero-differentiator-strip"
import { ImmortaliseSection } from "@/components/immortalise-section"
import { ProcessSection } from "@/components/process-section"
import { WhyFluffyfriendsSection } from "@/components/why-fluffyfriends-section"
import { GallerySection } from "@/components/gallery-section"
import { AboutSection } from "@/components/about-section"
import { PricingSection } from "@/components/pricing-section"
import { ReviewsSection } from "@/components/reviews-section"
import { GiftSection } from "@/components/gift-section"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FluffyFriends",
  url: "https://fluffyfriends.online",
  logo: "https://fluffyfriends.online/logos/FluffyFriends-logo.webp",
  description:
    "FluffyFriends is an AI pet portrait service that transforms your pet photo into a museum-quality, print-ready portrait in minutes. Choose from 8 themed costumes including King, Queen, Fireman, Police Officer, Admiral, Veterinarian, Samurai, and Pilot.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@fluffyfriends.online",
    contactType: "customer support",
  },
  sameAs: [
    "https://www.instagram.com/fluffyfriendsonline",
    "https://www.facebook.com/fluffyfriendsonline",
    "https://www.pinterest.com/fluffyfriendsonline",
    "https://www.tiktok.com/@fluffyfriendsonline",
  ],
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FluffyFriends",
  url: "https://fluffyfriends.online",
  description:
    "Transform your pet photo into a stunning AI portrait. Print-ready files delivered in minutes.",
  potentialAction: {
    "@type": "OrderAction",
    target: "https://fluffyfriends.online/create",
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <main className="min-h-screen bg-background flex flex-col">
        <div className="flex flex-1 flex-col">
          <Navbar />
          {/* Below lg: Hero → How it works → Gallery → Pricing → other sections → Gift. lg+: original order. */}
          <div className="order-1 lg:order-1">
            <HeroSection />
          </div>
          <div className="order-2 lg:order-2">
            <HeroDifferentiatorStrip />
          </div>
          <div className="order-6 lg:order-3">
            <SketchDivider />
            <ImmortaliseSection />
          </div>
          <div className="order-3 lg:order-4">
            <SketchDivider />
            <ProcessSection />
          </div>
          <div className="order-7 lg:order-5">
            <SketchDivider />
            <WhyFluffyfriendsSection />
          </div>
          <div className="order-4 lg:order-6">
            <SketchDivider />
            <GallerySection />
          </div>
          <div className="order-8 lg:order-7">
            <SketchDivider />
            <AboutSection />
          </div>
          <div className="order-5 lg:order-8">
            <SketchDivider />
            <PricingSection />
          </div>
          <div className="order-9 lg:order-9">
            <SketchDivider />
            <ReviewsSection />
          </div>
          <div className="order-10 lg:order-10">
            <SketchDivider />
            <GiftSection />
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}
