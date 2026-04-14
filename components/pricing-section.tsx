import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  Clock,
  LayoutTemplate,
  Shuffle,
  Tag,
  X,
  ZoomIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const comparisonRows: {
  feature: string
  icon: LucideIcon
  fluffy: true
  others: false | string
}[] = [
  { feature: "Their name in the portrait", icon: Tag, fluffy: true, others: false },
  { feature: "Portrait + landscape, always included", icon: LayoutTemplate, fluffy: true, others: false },
  { feature: "Free print & frame guide", icon: BookOpen, fluffy: true, others: false },
  { feature: "A1 quality — poster-size sharp", icon: ZoomIn, fluffy: true, others: "Rarely" },
  { feature: "One photo — that's it", icon: Camera, fluffy: true, others: "Up to 15" },
  { feature: "Ready in minutes, not hours", icon: Clock, fluffy: true, others: "Up to 1 hour" },
  { feature: "Use credits any way you like", icon: Shuffle, fluffy: true, others: false },
  { feature: "Pay once, own it forever", icon: BadgeCheck, fluffy: true, others: "Often required" },
]

const plans = [
  {
    name: "Starter",
    price: "$17",
    priceNote: "one-time",
    credits: "1 portrait",
    tagline: "Try it once. We think you'll come back.",
    badge: null as string | null,
    saving: null as string | null,
    features: [
      "1 personalised portrait",
      "Name worked into the portrait",
      "Wide + portrait format included",
      "A1 print quality",
      "Free print guide",
      "Personal print rights — print as many times as you like",
    ],
    cta: "Start For $17",
    featured: false,
  },
  {
    name: "Portrait Pack",
    price: "$49",
    priceNote: "one-time",
    credits: "4 portraits",
    tagline: "Four portraits. Your choice of pets, your choice of themes.",
    badge: "Most Popular",
    saving: "Worth $68 — you save $19",
    features: [
      "4 personalised portraits",
      "Mix themes or pets — completely flexible",
      "Name worked into every portrait",
      "Wide + portrait format on every portrait",
      "A1 print quality",
      "Free print guide",
      "Personal print rights",
    ],
    cta: "Get 4 Portraits — Save $19",
    featured: true,
  },
  {
    name: "Family Pack",
    price: "$79",
    priceNote: "one-time",
    credits: "8 portraits",
    tagline: "Eight portraits for the whole family. Every pet. Every theme.",
    badge: "Best Value",
    saving: "Worth $136 — you save $57",
    features: [
      "8 personalised portraits",
      "Perfect for multiple pets",
      "Name worked into every portrait",
      "Wide + portrait format on every portrait",
      "A1 print quality",
      "Free print guide",
      "Personal print rights",
      "Beautiful as a gift set",
    ],
    cta: "Best Value — 8 Portraits",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Transparent pricing. No surprises. Ever.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            One credit, one portrait. Use them however you like — one pet, many themes, or one theme for all your pets.
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            Create your portrait first. Choose your package when you&apos;re ready. No payment until step 3.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No subscription • No hidden fees • Price shown is final (ex. local tax)
          </p>
        </div>

        {/* Credit explainer — above cards */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          1 portrait = 1 artwork · Mix and match any way you like
        </p>

        {/* Cards — single column on mobile; Portrait Pack first on small screens; three columns md+ */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative overflow-hidden rounded-organic border border-border bg-card p-8 shadow-md transition-all",
                plan.name === "Starter" && "order-2 md:order-1",
                plan.name === "Portrait Pack" && "order-1 md:order-2",
                plan.name === "Family Pack" && "order-3 md:order-3",
                plan.featured
                  ? "ring-2 ring-primary/30 shadow-lg"
                  : "hover:shadow-lg",
              )}
            >
              {(plan.badge === "Most Popular" || plan.badge === "Best Value") && (
                <div className="absolute top-0 right-0 rounded-bl-organic bg-primary px-4 py-1">
                  <span className="text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.tagline}
              </p>
              <p className="mt-2 text-xs font-medium text-primary">
                {plan.credits}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
              </div>
              {plan.saving && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.saving}
                </p>
              )}

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-organic-sm border border-primary/60 bg-primary/10 text-[12px] font-semibold text-primary">
                      ✓
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
                asChild
              >
                <a href="/create">{plan.cta} →</a>
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Satisfaction guaranteed. Recreate or refund.
              </p>
            </div>
          ))}
        </div>

        <div
          className="my-6 flex items-center gap-2.5 rounded-organic-sm border border-border bg-secondary/60 px-5 py-3.5 text-sm text-foreground"
          role="note"
        >
          <span className="text-lg leading-none" aria-hidden>
            {"\u{1F6E1}\u{FE0F}"}
          </span>
          <span className="text-pretty">
            Not happy with your portrait? We will recreate it or refund your credit. No questions asked.
          </span>
        </div>

        {/* Comparison table — light card + CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground">
            No one else does all of this.
          </h2>
          <p className="mt-2 text-base text-muted-foreground">We checked.</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-organic border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
            <table className="w-full table-fixed text-left text-sm md:table-auto">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/60">
                  <th
                    className="w-[70%] px-3 py-4 font-medium text-muted-foreground sm:px-6 md:w-auto"
                    scope="col"
                  >
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="w-[30%] px-2 py-4 text-center sm:px-6 md:w-auto" scope="col">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-bold text-foreground">FluffyFriends</span>
                      <span className="rounded-organic-sm bg-primary px-2.5 py-1 text-[11px] font-semibold leading-tight text-primary-foreground">
                        The one that does it all
                      </span>
                    </div>
                  </th>
                  <th
                    className="hidden px-4 py-4 text-center text-sm font-medium text-muted-foreground md:table-cell sm:px-6"
                    scope="col"
                  >
                    Everyone else
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {comparisonRows.map((row, index) => {
                  const Icon = row.icon
                  return (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border/50 last:border-0",
                      index % 2 === 1 && "bg-secondary/35",
                    )}
                  >
                    <td className="w-[70%] px-3 py-3.5 align-middle sm:px-6 md:w-auto">
                      <span className="flex items-center gap-2">
                        <Icon
                          className="h-4 w-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span className="text-muted-foreground">{row.feature}</span>
                      </span>
                    </td>
                    <td className="w-[30%] px-2 py-3.5 text-center align-middle sm:px-6 md:w-auto">
                      {row.fluffy === true ? (
                        <div className="flex justify-center">
                          <Check
                            className="h-5 w-5 text-primary stroke-[3]"
                            aria-hidden
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{row.fluffy}</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 text-center text-muted-foreground/90 md:table-cell sm:px-6">
                      {row.others === false ? (
                        <div className="flex justify-center">
                          <X
                            className="h-5 w-5 text-muted-foreground/55"
                            aria-hidden
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/90">{row.others}</span>
                      )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>

          <p className="border-b border-border/50 px-4 py-3 text-center text-sm text-muted-foreground md:hidden">
            Others rarely offer all of this.
          </p>

          <div className="border-t border-border/70 bg-secondary/45 px-6 py-8 text-center">
            <p className="text-base font-semibold text-foreground">
              Everything included. One payment. Yours forever.
            </p>
            <Button
              size="lg"
              className="mt-5 inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
              asChild
            >
              <Link href="/create">Create My Portrait →</Link>
            </Button>
          </div>
        </div>

        {/* Trust line below comparison */}
        <p className="mt-10 text-center text-sm font-medium text-foreground">
          Create your portrait first. Choose your package when you&apos;re ready. No payment until step 3.
        </p>
      </div>
    </section>
  )
}
