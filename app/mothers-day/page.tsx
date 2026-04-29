import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import MothersDayPageClient from "./MothersDayPageClient"

const SITE = "https://fluffyfriends.online"

export const metadata = {
  title: "Mother's Day Pet Portrait — A Gift She'll Keep on Her Wall | FluffyFriends",
  description:
    "Order by May 8 to print and frame in time for Mother's Day. Personalised pet portraits, delivered in minutes. 20% off with FORMUM20.",
  alternates: {
    canonical: `${SITE}/mothers-day`,
  },
  openGraph: {
    title: "Mother's Day Pet Portrait — A Gift She'll Keep on Her Wall",
    description:
      "Order by May 8 to print and frame in time for Mother's Day. 20% off with FORMUM20.",
    url: `${SITE}/mothers-day`,
    siteName: "FluffyFriends",
    images: [{ url: `${SITE}/images/og/OG-Mothersday.webp`, alt: "FluffyFriends — Mother's Day pet portrait gift" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mother's Day Pet Portrait — A Gift She'll Keep on Her Wall",
    description:
      "Order by May 8 to print and frame in time for Mother's Day. 20% off with FORMUM20.",
    images: [`${SITE}/images/og/OG-Mothersday.webp`],
  },
}

export default function MothersDayPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[min(100vw,36rem)] bg-background" aria-hidden />
        }
      >
        <MothersDayPageClient />
      </Suspense>
      <Footer />
    </main>
  )
}
