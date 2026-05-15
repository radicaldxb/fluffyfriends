import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AboutSection } from "@/components/about-section"

export const metadata: Metadata = {
  title: "Built for Pet People | FluffyFriends",
  description:
    "Personalised pet portraits built for people who want art worth hanging—your pet's name in the artwork, print quality you can trust.",
  alternates: {
    canonical: "https://fluffyfriends.online/about",
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AboutSection />
      <Footer />
    </main>
  )
}
