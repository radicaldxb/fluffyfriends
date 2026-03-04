"use client"

import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"

function SuccessContent() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="mx-auto flex max-w-xl flex-1 flex-col items-center px-4 py-14 md:py-20 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-3">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Payment received
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Thank you for your order. We&apos;re now generating your FluffyFriends portrait at
          ultra‑high resolution.
        </p>

        {/* Generation animation */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-[999px] border-2 border-primary/40 bg-primary/5 shadow-sm">
            <video
              src="/video/FF-Loader.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover scale-[1.05]"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Our studio is rendering your artwork and preparing your print‑ready files. This usually
            takes a couple of minutes.
          </p>
        </div>

        <p className="mt-6 text-xs text-muted-foreground max-w-md">
          You&apos;ll receive an email with your portrait in both wide and tall formats, plus a
          simple print guide for frames and canvases. If it doesn&apos;t arrive, please check your
          spam folder or search for <span className="font-semibold">FluffyFriends</span> in your
          inbox.
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

