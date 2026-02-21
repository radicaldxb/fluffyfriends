import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "4K Digital Download",
    price: "$29",
    priceNote: "one-time",
    description: "Print‑ready, ultra‑sharp file delivered to your inbox.",
    features: [
      "One museum‑quality portrait of your pet",
      "4K+ resolution (print‑ready up to A2)",
      "Instant delivery to your inbox",
      "Full personal print rights",
    ],
    cta: "Get 4K Download",
    featured: false,
  },
  {
    name: "Premium Print + 5 Pack",
    price: "$99",
    priceNote: "one-time",
    description:
      "One framed hero print plus five unique portraits in different styles.",
    features: [
      "1 premium framed print of your favorite",
      "5 unique portraits in different themes",
      "All files in 4K+ resolution",
      "Perfect as a gift set or gallery wall",
    ],
    cta: "Get Premium Bundle",
    featured: false,
  },
  {
    name: "Printed & Delivered",
    price: "From $59",
    priceNote: "+ shipping",
    description:
      "We print, frame, and ship your artwork straight to your door.",
    features: [
      "Premium print on archival paper",
      "Multiple sizes & finishes available",
      "Shipped by trusted print partners",
      "Includes 4K digital file",
      "Perfect as a gift or wall centerpiece",
    ],
    cta: "Get Printed Art",
    featured: true,
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
            Choose how you want your art
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start with a print‑ready 4K download, or let us handle the printing
            and shipping for you.
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            No subscription • No hidden fees • Price shown is final (ex. local tax)
          </p>
        </div>

        {/* Cards — glassmorphism */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-organic border border-border bg-card p-8 shadow-md transition-all ${
                plan.featured
                  ? "ring-2 ring-primary/30 shadow-lg"
                  : "hover:shadow-lg"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 rounded-bl-organic bg-primary px-4 py-1">
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
                <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
              </div>

              <ul className="mt-6 flex flex-col gap-3">
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
                className="mt-8 w-full rounded-organic-sm bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <a href="/create">{plan.cta}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
