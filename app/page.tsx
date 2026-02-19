import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProcessSection } from "@/components/process-section"
import { GallerySection } from "@/components/gallery-section"
import { PricingSection } from "@/components/pricing-section"
import { PrintOptionsSection } from "@/components/print-options-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"
import { SketchDivider } from "@/components/sketch-divider"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <SketchDivider />
      <ProcessSection />
      <SketchDivider />
      <GallerySection />
      <SketchDivider />
      <PrintOptionsSection />
      <SketchDivider />
      <PricingSection />
      <SketchDivider />
      <ReviewsSection />
      <Footer />
    </main>
  )
}
