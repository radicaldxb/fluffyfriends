"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { GalleryImageLightbox } from "@/components/gallery-image-lightbox"
import { supabase } from "@/lib/supabase"
import { isValidDownloadUrl } from "@/lib/utils"

const staticPortraits: Portrait[] = [
  { src: "/images/gallery-fireman.jpg", theme: "Fireman", pet: "French Bulldog", location: null, users: null },
  { src: "/images/gallery-samurai.jpg", theme: "Samurai", pet: "Shiba Inu", location: null, users: null },
  { src: "/images/gallery-renaissance.jpg", theme: "Renaissance", pet: "British Shorthair", location: null, users: null },
  { src: "/images/gallery-astronaut.jpg", theme: "Astronaut", pet: "Labrador Retriever", location: null, users: null },
  { src: "/images/gallery-pirate.jpg", theme: "Pirate", pet: "Terrier", location: null, users: null },
  { src: "/images/gallery-wizard.jpg", theme: "Wizard", pet: "Persian Cat", location: null, users: null },
]

/** Aligned with /gallery: pet_name + location (column) with city/country fallback */
type Portrait = {
  src: string
  theme: string
  pet: string
  location?: string | null
  users?: { city?: string | null; country?: string | null } | null
}

const GALLERY_LIMIT = 8

export function GallerySection() {
  const [fromDb, setFromDb] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from("pet_portraits")
        .select("image_url, original_image_url, pet_name, status, showcase_consent, location, users(city, country)")
        .not("image_url", "is", null)
        .neq("status", "rejected")
        .eq("showcase_consent", true)
        .order("created_at", { ascending: false })
        .limit(GALLERY_LIMIT)
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
            const users = row.users as { city?: string; country?: string } | null
            const locRaw = row.location
            return {
              src,
              theme: "Portrait",
              pet: row.pet_name || "Pet",
              location: typeof locRaw === "string" && locRaw.trim() ? locRaw.trim() : null,
              users: users ?? null,
            }
          })
          .filter(
            (p): p is NonNullable<typeof p> =>
              p !== null,
          )
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
              {portraits.slice(0, GALLERY_LIMIT).map((portrait, index) => {
                const locationLine =
                  portrait.location ||
                  (portrait.users?.city && portrait.users?.country
                    ? `${portrait.users.city}, ${portrait.users.country}`
                    : null)
                const imgAlt = locationLine ? `${portrait.pet} · ${locationLine}` : portrait.pet
                const lightboxAlt =
                  locationLine
                    ? `${portrait.pet} · ${locationLine}`
                    : `${portrait.pet} – ${portrait.theme}`
                return (
                <div
                  key={`${portrait.src}-${index}`}
                  className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-organic border border-border/50"
                >
                  <Image
                    src={portrait.src}
                    alt={imgAlt}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={portrait.src.startsWith("http")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        src: portrait.src,
                        alt: lightboxAlt,
                      })
                    }
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
                )
              })}
            </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/gallery"
            className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
          >
            See all portraits →
          </Link>
        </div>
      </div>

      <GalleryImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />
    </section>
  )
}
