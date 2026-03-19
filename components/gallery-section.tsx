"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { isValidDownloadUrl } from "@/lib/utils"

const staticPortraits = [
  { src: "/images/gallery-fireman.jpg", theme: "Fireman", pet: "French Bulldog", city: null as string | null, country: null as string | null },
  { src: "/images/gallery-samurai.jpg", theme: "Samurai", pet: "Shiba Inu", city: null, country: null },
  { src: "/images/gallery-renaissance.jpg", theme: "Renaissance", pet: "British Shorthair", city: null, country: null },
  { src: "/images/gallery-astronaut.jpg", theme: "Astronaut", pet: "Labrador Retriever", city: null, country: null },
  { src: "/images/gallery-pirate.jpg", theme: "Pirate", pet: "Terrier", city: null, country: null },
  { src: "/images/gallery-wizard.jpg", theme: "Wizard", pet: "Persian Cat", city: null, country: null },
]

type Portrait = { src: string; theme: string; pet: string; city?: string | null; country?: string | null }

const GALLERY_LIMIT = 12

export function GallerySection() {
  const [fromDb, setFromDb] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from("pet_portraits")
        .select("image_url, original_image_url, pet_name, status, showcase_consent, users(city, country)")
        .not("image_url", "is", null)
        .neq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(GALLERY_LIMIT * 3)
      if (data?.length) {
        const filtered = data.filter((row) => row.showcase_consent === true)
        const withValidSrc = filtered
          .map((row) => {
            const imageUrl = (row.image_url as string)?.trim()
            const originalUrl = (row.original_image_url as string)?.trim()
            const src = isValidDownloadUrl(imageUrl)
              ? imageUrl!
              : isValidDownloadUrl(originalUrl)
                ? originalUrl!
                : null
            if (!src) return null
            const users = row.users as { city?: string; country?: string } | null
            return {
              src,
              theme: "Portrait",
              pet: row.pet_name || "Pet",
              city: users?.city ?? null,
              country: users?.country ?? null,
            }
          })
          .filter((p): p is Portrait => !!p)
        setFromDb(withValidSrc.slice(0, GALLERY_LIMIT))
      }
      setLoading(false)
    }
    fetchRecent()
  }, [])

  const portraits = fromDb.length > 0 ? fromDb : staticPortraits
  const isFromCommunity = fromDb.length > 0

  return (
    <section id="gallery" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            The Gallery
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real portraits. Real pets. Real names.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            {isFromCommunity ? "Every portrait here belongs to a real pet, with their real name in the design." : "Every portrait in our gallery belongs to a real pet, with their real name in the design. This is what yours could look like."}
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-organic bg-muted" />
            ))}
          </div>
        ) : (
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {portraits.slice(0, GALLERY_LIMIT).map((portrait, index) => (
                <div
                  key={`${portrait.src}-${index}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-organic border border-border/50"
                >
                  <Image
                    src={portrait.src}
                    alt={`${portrait.pet} – ${portrait.theme}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={portrait.src.startsWith("http")}
                  />

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500/80 to-transparent px-3 py-4">
                    <p className="text-white text-sm font-semibold drop-shadow-sm">
                      {portrait.pet}
                      {portrait.city && portrait.country && (
                        <span className="font-normal text-white/90"> · {portrait.city}, {portrait.country}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-sm font-semibold h-auto"
            asChild
          >
            <Link href="/gallery">See your pet here</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
