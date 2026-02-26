import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface MyPortraitsPageProps {
  searchParams: {
    order?: string
  }
}

export default function MyPortraitsPage({ searchParams }: MyPortraitsPageProps) {
  const orderId = searchParams.order || ""

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-14 md:py-20">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Your portraits
        </h1>
        <p className="mt-2 text-muted-foreground">
          This page will show all portraits linked to your order. We&apos;re still wiring up the full experience,
          but your payment and portrait have been recorded.
        </p>
        {orderId && (
          <p className="mt-4 text-xs text-muted-foreground">
            Order reference: <span className="font-mono text-foreground">{orderId}</span>
          </p>
        )}
        {!orderId && (
          <p className="mt-4 text-sm text-muted-foreground">
            No order id was provided. Please use the link from your email or go back to the checkout page.
          </p>
        )}
      </section>
      <Footer />
    </main>
  )
}

