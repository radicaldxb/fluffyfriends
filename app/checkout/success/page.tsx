 "use client"

import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"
import { useSearchParams } from "next/navigation"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-14 md:py-20 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-6">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Payment received
        </h1>
        <p className="mt-4 text-muted-foreground">
          Thank you for your order. We&apos;re now preparing your 4K portrait download.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          You&apos;ll receive an email with your secure download link in just a few minutes.
          If it doesn&apos;t arrive, please check your spam folder or search for
          <span className="font-semibold"> FluffyFriends</span> in your inbox.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button className="rounded-organic-sm" asChild>
            <Link href="/create">Create another portrait</Link>
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <section className="mx-auto flex max-w-lg flex-1 flex-col items-center px-4 py-14 text-center">
            <p className="text-muted-foreground">Loading…</p>
          </section>
          <Footer />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}

