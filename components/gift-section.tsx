import { Cake, TreePine, Heart, Gift } from "lucide-react"
import { GiftWaitlist } from "@/components/gift-waitlist"

const occasions = [
  { icon: Cake, label: "Birthday" },
  { icon: TreePine, label: "Christmas" },
  { icon: Heart, label: "In memory of" },
  { icon: Gift, label: "Just because" },
]

export function GiftSection() {
  return (
    <section id="gifts" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Give a portrait
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            The most thoughtful gift for any pet lover.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A personalised portrait of their pet — for their birthday, for Christmas, or to keep a beloved companion close forever. Choose an occasion, write from the heart, and we&apos;ll do the rest.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {occasions.map((occ) => {
            const Icon = occ.icon
            return (
              <span
                key={occ.label}
                className="inline-flex items-center gap-2 rounded-organic-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                {occ.label}
              </span>
            )
          })}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
          You choose a package, write a personal message, and enter their email address. We send them a beautiful gift card with your message — they upload their pet&apos;s photo, choose a theme, and create their portrait in their own time. No account needed. No rush.
        </p>

        <div className="mt-10 flex justify-center">
          <GiftWaitlist />
        </div>
      </div>
    </section>
  )
}
