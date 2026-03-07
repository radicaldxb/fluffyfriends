import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">
          By using FluffyFriends you agree to use the service for personal, non-commercial purposes. AI-generated art may contain variations. Full terms coming soon.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-primary font-medium hover:underline">← Back to home</Link>
        </p>
      </section>
      <Footer />
    </main>
  )
}
