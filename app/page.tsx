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

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <HeroSection />
        <HeroDifferentiatorStrip />
        <SketchDivider />
        <ImmortaliseSection />
        <SketchDivider />
        <ProcessSection />
        <SketchDivider />
        <WhyFluffyfriendsSection />
        <SketchDivider />
        <GallerySection />
        <SketchDivider />
        <AboutSection />
        <SketchDivider />
        <PricingSection />
        <SketchDivider />
        <ReviewsSection />
        <SketchDivider />
        <GiftSection />
      </div>
      <Footer />
    </main>
  )
}
