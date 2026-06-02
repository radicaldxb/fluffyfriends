"use client"

import { Fragment, useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { GalleryImageLightbox } from "@/components/gallery-image-lightbox"
import { supabase } from "@/lib/supabase"
import { isValidDownloadUrl } from "@/lib/utils"

type Portrait = {
  src: string
  pet: string
  location?: string | null
}

const GALLERY_LIMIT = 100

export default function GalleryPage() {
  const [portraits, setPortraits] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    async function fetchAll() {
      setFetchError(null)
      const { data, error } = await supabase
        .from("pet_portraits")
        .select("image_url, original_image_url, pet_name, location")
        .eq("showcase_consent", true)
        .not("image_url", "is", null)
        .neq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(GALLERY_LIMIT)

      if (error) {
        setFetchError(error.message || "Could not load gallery.")
        setLoading(false)
        return
      }

      if (data?.length) {
        const withValidSrc = data
          .map((row) => {
            const imageUrl = (row.image_url as string)?.trim()
            const originalUrl = (row.original_image_url as string)?.trim()
            const src = isValidDownloadUrl(imageUrl)
              ? imageUrl!
              : isValidDownloadUrl(originalUrl)
                ? originalUrl!
                : null
            if (!src) return null
            const locRaw = row.location
            return {
              src,
              pet: row.pet_name || "Pet",
              location: typeof locRaw === "string" && locRaw.trim() ? locRaw.trim() : null,
            }
          })
          .filter(
            (p): p is NonNullable<typeof p> =>
              p !== null,
          )
        setPortraits(withValidSrc)
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="flex-1 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Real pets. Real names. Real people.
              </h1>
              <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
                Every portrait below belongs to someone who loved their pet enough to give them a wall.
              </p>
            </div>
            <Button variant="outline" className="rounded-organic-sm shrink-0" asChild>
              <Link href="/">← Back to home</Link>
            </Button>
          </div>

          {fetchError ? (
            <div className="rounded-organic border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
              <p className="font-medium text-foreground">Gallery couldn&apos;t load</p>
              <p className="mt-2 text-sm text-muted-foreground">{fetchError}</p>
              <Button className="mt-4 rounded-organic-sm" type="button" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : loading ? (
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
              {portraits.map((portrait, index) => {
                const locationLine = portrait.location || null
                const alt = locationLine
                  ? `${portrait.pet} · ${locationLine}`
                  : portrait.pet
                return (
                  <Fragment key={`${portrait.src}-${index}`}>
                    <div className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-organic border border-border/50">
                      {/* Native img: portrait URLs come from Supabase (or other hosts); avoids Next/Image remotePatterns mismatches and matches unoptimized delivery */}
                      <img
                        src={portrait.src}
                        alt={portrait.pet}
                        loading={index < 10 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setLightbox({ src: portrait.src, alt })}
                        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-organic"
                        aria-label={`View larger — ${portrait.pet}`}
                      />
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-orange-500/80 to-transparent px-3 py-4">
                        <p className="text-white text-sm font-semibold drop-shadow-sm">
                          {portrait.pet}
                          {locationLine && (
                            <span className="font-normal text-white/90"> · {locationLine}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {index === 9 ? (
                      <div className="col-span-2 py-2 sm:col-span-3 sm:py-3 lg:col-span-4 xl:col-span-5">
                        <div className="rounded-organic border border-border bg-muted/25 px-5 py-8 text-center md:px-8 md:py-10">
                          <p className="mx-auto max-w-md font-sans text-base text-foreground md:text-lg">
                            See what yours looks like, free, no signup.
                          </p>
                          <Button asChild className="mt-5 rounded-organic-sm px-7 py-3.5 text-base font-semibold">
                            <Link href="/create">See yours Free →</Link>
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </Fragment>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Portraits in this gallery are shown only when the customer has chosen to share them.
          </p>
        </div>
      </div>

      <GalleryImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />

      <Footer />
    </main>
  )
}
