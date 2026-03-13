import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import MemorialPageClient from "./MemorialPageClient"

export const metadata = {
  title: "Pet Memorial Portraits — Honour the Pet You Loved | FluffyFriends",
  description:
    "A lasting portrait of a pet that has passed. Transform their photo into a beautiful piece of art to keep, display, and remember them by. Coming soon.",
}

export default function MemorialPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <MemorialPageClient />
      <Footer />
    </main>
  )
}

