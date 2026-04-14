import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksVisualSection } from "@/components/how-it-works-visual-section"
import { GallerySection } from "@/components/gallery-section"
import { AboutSection } from "@/components/about-section"
import { PricingSection } from "@/components/pricing-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FinalCTASection } from "@/components/final-cta-section"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"
import MobileStickyBar from "@/components/mobile-sticky-bar"

const SITE = "https://fluffyfriends.online"

export const metadata: Metadata = {
  title: "AI Pet Portraits — Named & Personalised | FluffyFriends",
  description:
    "Named, print-ready, and delivered in minutes. One photo is all it takes. From $17, one-time.",
  openGraph: {
    title: "AI Pet Portraits — Named & Personalised | FluffyFriends",
    description:
      "Named, print-ready, and delivered in minutes. One photo is all it takes. From $17, one-time.",
    url: SITE,
    siteName: "FluffyFriends",
    images: [{ url: `${SITE}/images/og/OG-Home.webp`, alt: "FluffyFriends — AI pet portraits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pet Portraits — Named & Personalised | FluffyFriends",
    description:
      "Named, print-ready, and delivered in minutes. One photo is all it takes. From $17, one-time.",
    images: [`${SITE}/images/og/OG-Home.webp`],
  },
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

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AI Pet Portrait",
  description:
    "Transform your pet photo into a personalised, print-ready portrait with their name in the artwork. Choose from 8 themes. From $17.",
  url: "https://fluffyfriends.online/create",
  brand: { "@type": "Brand", name: "FluffyFriends" },
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "17.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://fluffyfriends.online/create",
    },
    {
      "@type": "Offer",
      name: "Portrait Pack",
      price: "49.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://fluffyfriends.online/create",
    },
    {
      "@type": "Offer",
      name: "Family Pack",
      price: "79.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://fluffyfriends.online/create",
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <main className="min-h-screen bg-background flex flex-col">
        <div className="flex flex-1 flex-col">
          <Navbar />
          <HeroSection />
          <GallerySection />
          <SketchDivider />
          <HowItWorksVisualSection />
          <SketchDivider />
          <ReviewsSection />
          <SketchDivider />
          <PricingSection />
          <SketchDivider />
          <AboutSection />
          <SketchDivider />
          <FinalCTASection />
        </div>
        <Footer />
      </main>
      <MobileStickyBar />
    </>
  )
}
