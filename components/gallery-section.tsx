"use client"

import Image from "next/image"
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

export function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [fromDb, setFromDb] = useState<Portrait[]>([])

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from("pet_portraits")
        .select("image_url, pet_name, status")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(6)
      if (data?.length) {
        setFromDb(
          data.map((row) => ({
            src: row.image_url!,
            theme: row.status || "Portrait",
            pet: row.pet_name || "Pet",
          }))
        )
      }
    }
    fetchRecent()
  }, [])

  const portraits = fromDb.length > 0 ? fromDb : staticPortraits

  return (
    <section id="gallery" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            The Gallery
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Every pet deserves a portrait
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Real portraits from our community. Each piece is unique and inspired by your pet.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portraits.map((portrait, index) => (
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized={portrait.src.startsWith("http")}
              />

              <div
                className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/30 to-transparent p-6 transition-opacity duration-300 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="mb-1 text-xs font-medium uppercase tracking-widest text-primary">
                  {portrait.theme}
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {portrait.pet}
                </p>
              </div>

              <div className="absolute top-4 left-4 rounded-organic-sm bg-background/70 px-3 py-1 backdrop-blur-sm">
                <span className="text-xs font-medium text-foreground">
                  {portrait.theme}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
