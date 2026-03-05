import { Check, Frame, LayoutGrid, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

const options = [
  {
    label: "Framed wall art",
    size: "Up to 24\" × 36\"",
    icon: Frame,
    description:
      "A statement piece for your living room or hallway, printed on archival paper with a matte black frame.",
  },
  {
    label: "Gallery trio",
    size: "Set of 3 prints",
    icon: LayoutGrid,
    description:
      "Build a mini gallery of your pet in different themes — perfect above a sofa or desk.",
  },
  {
    label: "Gift‑ready bundle",
    size: "Premium Print + 5 Pack",
    icon: Gift,
    description:
      "One hero print plus five unique portraits, all in 4K and ready to frame or share.",
  },
]

export function PrintOptionsSection() {
  return (
    <section id="print-options" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Print options
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Make your walls as unique as your pet
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            From a single hero piece to a full gallery wall, our Premium Print + 5 Pack
            bundle gives you everything you need to show off your furry friend in style.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.label}
                className="relative overflow-hidden rounded-organic border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg"
              >
                {/* Product visual placeholder */}
                <div className="flex aspect-[4/3] items-center justify-center rounded-organic-sm bg-muted/50">
                  <Icon className="h-14 w-14 text-primary/80" aria-hidden />
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-organic-sm border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-organic-sm border border-primary/60 bg-primary/10 text-[12px] font-semibold text-primary">
                    ✓
                  </span>
                  <span>{option.size}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {option.label}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="max-w-xl text-center text-sm text-muted-foreground">
            Want it all? Choose the{" "}
            <span className="font-semibold text-primary">Premium Print + 5 Pack</span>{" "}
            at checkout and we&apos;ll help you create a complete, print‑ready collection
            from a single photo.
          </p>
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
            asChild
          >
            <a href="/create">See pricing</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

