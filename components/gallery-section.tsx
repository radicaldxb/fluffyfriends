"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

const staticPortraits = [
  { src: "/images/gallery-fireman.jpg", theme: "Fireman", pet: "French Bulldog" },
  { src: "/images/gallery-samurai.jpg", theme: "Samurai", pet: "Shiba Inu" },
  { src: "/images/gallery-renaissance.jpg", theme: "Renaissance", pet: "British Shorthair" },
  { src: "/images/gallery-astronaut.jpg", theme: "Astronaut", pet: "Labrador Retriever" },
  { src: "/images/gallery-pirate.jpg", theme: "Pirate", pet: "Terrier" },
  { src: "/images/gallery-wizard.jpg", theme: "Wizard", pet: "Persian Cat" },
]

type Portrait = { src: string; theme: string; pet: string }

const GALLERY_LIMIT = 12

export function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [fromDb, setFromDb] = useState<Portrait[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from("pet_portraits")
        .select("image_url, pet_name, status, showcase_consent")
        .not("image_url", "is", null)
        .neq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(GALLERY_LIMIT * 2)
      if (data?.length) {
        const filtered = data.filter((row) => row.showcase_consent === true)
        setFromDb(
          filtered.slice(0, GALLERY_LIMIT).map((row) => ({
            src: row.image_url!,
            theme: "Portrait",
            pet: row.pet_name || "Pet",
          }))
        )
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
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Image
                    src={portrait.src}
                    alt={`${portrait.pet} – ${portrait.theme}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={portrait.src.startsWith("http")}
                  />

                  <div
                    className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/30 to-transparent p-4 transition-opacity duration-300 ${
                      hoveredIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {portrait.pet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-[#1A120820] bg-white px-7 py-3.5 text-sm font-semibold text-[#1A1208] transition-all duration-200 hover:bg-[#F2EEE2]"
          >
            See your pet here
          </Link>
        </div>
      </div>
    </section>
  )
}
