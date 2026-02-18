import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProcessSection } from "@/components/process-section"
import { GallerySection } from "@/components/gallery-section"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-border/50" />
      </div>

      <ProcessSection />

      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-border/50" />
      </div>

      <GallerySection />

      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-border/50" />
      </div>

      <PricingSection />
      <Footer />
    </main>
  )
}
