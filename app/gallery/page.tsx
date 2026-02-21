"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type Portrait = { src: string; pet: string }

export default function GalleryPage() {
  const [portraits, setPortraits] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const { data } = await supabase
        .from("pet_portraits")
        .select("image_url, pet_name, status, showcase_consent")
        .not("image_url", "is", null)
        .neq("status", "rejected")
        .order("created_at", { ascending: false })
      if (data?.length) {
        const filtered = data.filter((row) => row.showcase_consent === true)
        setPortraits(
          filtered.map((row) => ({
            src: row.image_url!,
            pet: row.pet_name || "Pet",
          }))
        )
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Gallery
              </h1>
              <p className="mt-1 text-muted-foreground">
                All community portraits shared with consent.
              </p>
            </div>
            <Button variant="outline" className="rounded-organic-sm shrink-0" asChild>
              <Link href="/">← Back to home</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-organic bg-muted"
                />
              ))}
            </div>
          ) : portraits.length === 0 ? (
            <div className="rounded-organic border border-border bg-muted/30 py-16 text-center">
              <p className="text-muted-foreground">No portraits in the gallery yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Be the first to share your pet&apos;s portrait (with your permission).</p>
              <Button className="mt-4 rounded-organic-sm" asChild>
                <Link href="/create">Create one</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {portraits.map((portrait, index) => (
                <div
                  key={`${portrait.src}-${index}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-organic border border-border/50"
                >
                  <Image
                    src={portrait.src}
                    alt={portrait.pet}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    unoptimized={portrait.src.startsWith("http")}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm font-semibold text-foreground">
                      {portrait.pet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
