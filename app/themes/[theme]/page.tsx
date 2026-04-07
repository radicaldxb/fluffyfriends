import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SketchDivider } from "@/components/sketch-divider"
import { ThemePageFaq } from "@/components/theme-page-faq"
import { getTheme, themeIds, themes, type Theme } from "@/lib/themes"

const BASE = "https://fluffyfriends.online"

/** OG assets in /public/images/og — filename per theme id (Vet = Veterinarian theme) */
const OG_IMAGE_BY_THEME_ID: Record<string, string> = {
  pilot: "OG-Pilot.webp",
  king: "OG-King.webp",
  queen: "OG-Queen.webp",
  fireman: "OG-Fireman.webp",
  police: "OG-Police.webp",
  admiral: "OG-Admiral.webp",
  veterinarian: "OG-Vet.webp",
  samurai: "OG-Samurai.webp",
}

type PageProps = { params: Promise<{ theme: string }> }

export function generateStaticParams() {
  return themeIds.map((theme) => ({ theme }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme: slug } = await params
  const theme = getTheme(slug)
  if (!theme) return {}
  const ogFile = OG_IMAGE_BY_THEME_ID[slug]
  const description = `${theme.tagline} ${theme.story.slice(0, 140)}…`
  const pageUrl = `${BASE}/themes/${slug}`
  const ogImageUrl = ogFile ? `${BASE}/images/og/${ogFile}` : undefined
  return {
    title: `${theme.name} Pet Portrait Theme — AI Art | FluffyFriends`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    ...(ogImageUrl && {
      openGraph: {
        title: `${theme.name} Pet Portrait Theme — AI Art | FluffyFriends`,
        description,
        url: pageUrl,
        siteName: "FluffyFriends",
        images: [
          {
            url: ogImageUrl,
            alt: `FluffyFriends ${theme.name} pet portrait theme`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image" as const,
        title: `${theme.name} Pet Portrait Theme — AI Art | FluffyFriends`,
        description,
        images: [ogImageUrl],
      },
    }),
  }
}

function buildProductJsonLd(theme: Theme) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `FluffyFriends ${theme.name} Pet Portrait`,
    description: theme.story,
    brand: { "@type": "Brand", name: "FluffyFriends" },
    offers: {
      "@type": "Offer",
      price: "17.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/create`,
    },
  }
}

function buildFaqJsonLd(theme: Theme) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: theme.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export default async function ThemeLandingPage({ params }: PageProps) {
  const { theme: slug } = await params
  const theme = getTheme(slug)
  if (!theme) notFound()

  const createHref = `/create?theme=${encodeURIComponent(theme.id)}`
  const productLd = buildProductJsonLd(theme)
  const faqLd = buildFaqJsonLd(theme)

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[min(72vh,600px)] w-full">
        <Image
          src={theme.masterImage}
          alt={`FluffyFriends ${theme.name} pet portrait theme`}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[min(72vh,600px)] flex-col items-center justify-end px-4 pb-12 pt-28 text-center sm:pb-16 md:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">
            Portrait theme
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {theme.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg font-medium text-foreground/95 sm:text-xl">{theme.tagline}</p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-organic-sm">
              <Link href={createHref}>Create your {theme.name} portrait →</Link>
            </Button>
          </div>
        </div>
      </section>

      <SketchDivider />

      {/* Story */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">The story</h2>
          <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg md:text-xl text-pretty">
            {theme.story}
          </p>
        </div>
      </section>

      <SketchDivider />

      {/* What&apos;s included — three pillars */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          What&apos;s included
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-organic border border-border bg-card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Personalisation</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {theme.hasNameTag && theme.nameTagFormat ? (
                <>
                  Personalised name tag:{" "}
                  <span className="font-medium text-foreground">{theme.nameTagFormat.replace(/\{\{PET_NAME\}\}/g, "your pet")}</span>
                </>
              ) : (
                "Artistic composition — no name tag on the artwork, for a clean classical look."
              )}
            </p>
          </div>
          <div className="rounded-organic border border-border bg-card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Two print-ready files</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Landscape format up to 65×36cm (25×14in) and portrait format up to 22×31cm (8.5×12in) — both
              high-resolution JPEGs ready for professional printing.
            </p>
          </div>
          <div className="rounded-organic border border-border bg-card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Fast delivery</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Most portraits are ready within minutes. If quality doesn&apos;t meet our standard, we work with you on
              remakes per our terms.
            </p>
          </div>
        </div>
      </section>

      <SketchDivider />

      {/* Print ideas */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Print &amp; display ideas
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {theme.printIdeas.map((idea, i) => (
            <div
              key={i}
              className="rounded-organic border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-muted-foreground sm:p-6"
            >
              {idea}
            </div>
          ))}
        </div>
      </section>

      <SketchDivider />

      {/* FAQ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {theme.name} — frequently asked
        </h2>
        <div className="mx-auto mt-8 max-w-3xl rounded-organic border border-border bg-card px-4 py-2 sm:px-6 sm:py-3">
          <ThemePageFaq faqs={theme.faqs} sectionId={theme.id} />
        </div>
      </section>

      <SketchDivider />

      {/* Related themes */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Related themes
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {theme.relatedThemes
            .map((relatedId) => themes[relatedId])
            .filter((t): t is Theme => t != null)
            .map((related) => (
              <Link
                key={related.id}
                href={`/themes/${related.id}`}
                className="group overflow-hidden rounded-organic border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={related.previewImage}
                    alt={`${related.name} theme preview`}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-foreground">{related.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{related.tagline}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-primary">View theme →</span>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <SketchDivider />

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-2xl rounded-organic border border-border bg-secondary/30 px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Ready for your {theme.name} portrait?
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-primary">From $17</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Upload a photo, choose this theme at checkout, and get print-ready files in minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="rounded-organic-sm">
              <Link href={createHref}>Create your {theme.name} portrait →</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
