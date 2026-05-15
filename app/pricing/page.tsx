import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PricingSection } from "@/components/pricing-section"

export const metadata: Metadata = {
  title: "Pricing — One Payment, Yours Forever | FluffyFriends",
  description:
    "One payment, yours forever—starter, portrait pack, and family pack. Print-ready personalised pet portraits with their name in the art.",
  alternates: {
    canonical: "https://fluffyfriends.online/pricing",
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <PricingSection />
      <Footer />
    </main>
  )
}
