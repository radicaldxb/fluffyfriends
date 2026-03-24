import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { THEME_DISPLAY_ORDER, themes } from "@/lib/themes"

export const metadata: Metadata = {
  title: "Pet Portrait Themes — King, Queen, Pilot & More | FluffyFriends",
  description:
    "Browse all FluffyFriends AI pet portrait themes: royal, heroes, pilots, samurai, and more. Pick a style and create a print-ready portrait in minutes.",
}

export default function ThemesIndexPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">Themes</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Choose your pet&apos;s portrait theme
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg text-pretty">
            Every theme is designed to match your pet&apos;s personality — from regal royalty to brave first responders.
            Click a theme to learn more, then create your portrait in a few minutes.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {THEME_DISPLAY_ORDER.map((id) => {
            const t = themes[id]
            if (!t) return null
            return (
              <Link
                key={id}
                href={`/themes/${t.id}`}
                className="group overflow-hidden rounded-organic border-2 border-border bg-card text-left transition-all hover:border-primary/60 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-organic-sm bg-muted">
                  <Image
                    src={t.previewImage}
                    alt={`${t.name} theme preview`}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-2.5 sm:p-3">
                  <span className="font-heading font-semibold text-foreground">{t.name}</span>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{t.tagline}</p>
                  <span className="mt-2 inline-block text-xs font-medium text-primary sm:text-sm">View theme →</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="rounded-organic-sm">
            <Link href="/create">Create a portrait — pick a theme at checkout →</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  )
}
