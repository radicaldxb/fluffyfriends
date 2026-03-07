import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 mx-auto max-w-2xl px-4 py-14 md:py-20 w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Privacy</h1>
        <p className="mt-4 text-muted-foreground">
          We never sell or share your photos. Your uploads are used only to create your portrait and are not used for marketing or shared with third parties. Full privacy policy coming soon.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-primary font-medium hover:underline">← Back to home</Link>
        </p>
      </section>
      <Footer />
    </main>
  )
}
