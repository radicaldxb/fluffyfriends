import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Single",
    price: "$19",
    description: "Perfect for trying out your first portrait.",
    features: [
      "1 AI portrait",
      "Choose from all themes",
      "High-resolution download",
      "Commercial license",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Bundle",
    price: "$39",
    description: "Our most popular option for multi-pet families.",
    features: [
      "5 AI portraits",
      "Choose from all themes",
      "High-resolution download",
      "Commercial license",
      "Priority processing",
    ],
    cta: "Get the Bundle",
    featured: true,
  },
  {
    name: "Unlimited",
    price: "$79",
    description: "For the ultimate pet art collector.",
    features: [
      "Unlimited portraits for 30 days",
      "Choose from all themes",
      "High-resolution download",
      "Commercial license",
      "Priority processing",
      "Early access to new themes",
    ],
    cta: "Go Unlimited",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Invest in timeless memories
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Simple, transparent pricing with no hidden fees. Every plan includes
            your full-resolution artwork.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all ${
                plan.featured
                  ? "border-primary/60 bg-card/80 shadow-[0_0_40px_-12px] shadow-primary/20"
                  : "border-border/50 bg-card/50"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-4 py-1">
                  <span className="text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/one-time</span>
              </div>

              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full rounded-full ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
