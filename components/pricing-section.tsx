import { Button } from "@/components/ui/button"

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

        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-organic border border-border bg-card p-8 shadow-md transition-all ${
                plan.featured
                  ? "ring-2 ring-primary/30 shadow-lg"
                  : "hover:shadow-lg"
              }`}
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
            </div>
          ))}
        </div>

        {/* Trust line below cards */}
        <p className="mt-10 text-center text-sm font-medium text-foreground">
          Create your portrait first. Choose your package when you&apos;re ready. No payment until step 3.
        </p>
      </div>
    </section>
  )
}
