import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HeroDifferentiatorStrip } from "@/components/hero-differentiator-strip"
import { HowItWorksVisualSection } from "@/components/how-it-works-visual-section"
import { GallerySection } from "@/components/gallery-section"
import { AboutSection } from "@/components/about-section"
import { PricingSection } from "@/components/pricing-section"
import { ReviewsSection } from "@/components/reviews-section"
import { GiftSection } from "@/components/gift-section"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"

export const metadata: Metadata = {
  title: "AI Pet Portraits — Named & Personalised | FluffyFriends",
  description:
    "Transform your pet photo into fine art with their name in the artwork. Print-ready in minutes. From $17. Use FLUFFY15 for 15% off.",
}

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
    "https://www.instagram.com/fluffyfriends.online",
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
          <HeroSection />
          <GallerySection />
          <SketchDivider />
          <HeroDifferentiatorStrip />
          <SketchDivider />
          <HowItWorksVisualSection />
          <SketchDivider />
          <ReviewsSection />
          <SketchDivider />
          <PricingSection />
          <SketchDivider />
          <AboutSection />
          <SketchDivider />
          <GiftSection />
        </div>
        <Footer />
      </main>
    </>
  )
}
