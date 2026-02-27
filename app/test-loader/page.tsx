"use client";

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TestLoaderPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="flex-1 px-4 py-14 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Loader preview
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            FluffyFriends processing animation
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            This page shows the circular loading video that appears while we&apos;re creating a portrait
            on the create flow.
          </p>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-[999px] border-2 border-primary/40 bg-primary/5 shadow-sm">
              <video
                src="/video/FF-Loader.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Video: <code className="rounded-organic-sm bg-muted px-1.5 py-0.5 text-[0.7rem]">/public/video/FF-Loader.mp4</code>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

