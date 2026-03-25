import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { NotFoundDocumentTitle } from "@/components/not-found-document-title"
import { SketchDivider } from "@/components/sketch-divider"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <NotFoundDocumentTitle />
      <Navbar />
      <SketchDivider />
      <section className="flex flex-1 flex-col justify-center py-14 md:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">404</p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            This page wandered off
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            We couldn&apos;t find what you were looking for. The link may be broken, or the page may have
            moved — but your pet portraits are always safe on the home page.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/25 h-auto"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold h-auto"
              asChild
            >
              <Link href="/faq">
                <Search className="h-4 w-4" aria-hidden />
                Browse FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
