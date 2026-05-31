import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SeasonalCampaignSection } from "@/components/seasonal-campaign-section"
import { HowItWorksVisualSection } from "@/components/how-it-works-visual-section"
import { GallerySection } from "@/components/gallery-section"
import { AboutSection } from "@/components/about-section"
import { HomeStoryReviewsSection } from "@/components/home-story-reviews-section"
import { HomeBuyerQuoteSection } from "@/components/home-buyer-quote-section"
import { PricingSection } from "@/components/pricing-section"
import { FinalCTASection } from "@/components/final-cta-section"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"
import MobileStickyBar from "@/components/mobile-sticky-bar"

const SITE = "https://fluffyfriends.online"

export const metadata: Metadata = {
  title: "Personalised Pet Portraits with Their Name in the Art | FluffyFriends",
  description:
    "Personalised pet portraits with your pet's name woven into the artwork. Print-ready in minutes. One photo.",
  openGraph: {
    title: "Personalised Pet Portraits with Their Name in the Art | FluffyFriends",
    description:
      "Personalised pet portraits with your pet's name woven into the artwork. Print-ready in minutes. One photo.",
    url: SITE,
    siteName: "FluffyFriends",
    images: [{ url: `${SITE}/images/og/OG-Home.webp`, alt: "FluffyFriends — personalised pet portraits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personalised Pet Portraits with Their Name in the Art | FluffyFriends",
    description:
      "Personalised pet portraits with your pet's name woven into the artwork. Print-ready in minutes. One photo.",
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
    "FluffyFriends creates personalised pet portraits from your photo—your pet's name in the artwork, museum-quality and print-ready in minutes. Eight themed styles including King, Queen, Fireman, Police Officer, Admiral, Veterinarian, Samurai, and Pilot.",
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
    "Turn your pet photo into a personalised portrait—print-ready files with their name in the art, delivered in minutes.",
  potentialAction: {
    "@type": "OrderAction",
    target: "https://fluffyfriends.online/create",
  },
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Personalised Pet Portrait",
  description:
    "Transform your pet photo into a print-ready portrait with their name in the artwork. Choose from 8 themes.",
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
      <link
        rel="preload"
        as="image"
        href="/images/pet-after.webp"
        fetchPriority="high"
      />
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
          <SeasonalCampaignSection />
          <GallerySection />
          <SketchDivider />
          <HowItWorksVisualSection />
          <SketchDivider />
          <HomeBuyerQuoteSection />
          <PricingSection />
          <SketchDivider />
          <AboutSection />
          <HomeStoryReviewsSection />
          <SketchDivider />
          <FinalCTASection />
        </div>
        <Footer />
      </main>
      <MobileStickyBar />
    </>
  )
}
