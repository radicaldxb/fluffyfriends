import Link from "next/link"
import { Tag, LayoutGrid, BookOpen, Frame, Ticket, Check, X } from "lucide-react"

const features = [
  {
    icon: Tag,
    title: "Their name, in the portrait",
    copy: "Not typed underneath. Not added as a caption. Their name is crafted into the costume itself — a badge, a shield, a name tag, a crest. Whichever theme you choose, the portrait is unmistakably theirs.",
  },
  {
    icon: LayoutGrid,
    title: "Two formats, always included",
    copy: "Wide format for a mantle, console table, or wide frame. Tall format for a staircase, hallway, or narrow wall. Both included in every order, at every price. Most services charge extra. We don't.",
  },
  {
    icon: BookOpen,
    title: "A free print guide — because we thought of everything",
    copy: "Not sure how to get it printed? We've written a clear, simple guide covering local print shops, online printers, and home printing options — with our recommended sizes, paper types, and framing tips. It's included free with every order.",
  },
  {
    icon: Frame,
    title: "A1 print quality, as standard",
    copy: "Our portraits are prepared at the highest resolution available — sharp and detailed enough to print at A1 size (59 × 84 cm) without losing a single whisker. Most portrait tools top out at A4. We start where they finish.",
  },
  {
    icon: Ticket,
    title: "Credits that work your way",
    copy: "One credit, one portrait. Use them however you like — four themes for one pet, or one portrait each for all four of your pets. Credits never expire and never go to waste.",
  },
]

const comparisonRows = [
  { feature: "Name personalised into portrait", fluffy: true, others: false },
  { feature: "Two formats included", fluffy: true, others: false },
  { feature: "Free print guide", fluffy: true, others: false },
  { feature: "A1 print quality", fluffy: true, others: "Rarely" },
  { feature: "One photo needed", fluffy: true, others: "Up to 15" },
  { feature: "Ready in minutes", fluffy: true, others: "Up to 1 hour" },
  { feature: "Flexible credits", fluffy: true, others: false },
  { feature: "No subscription", fluffy: true, others: "Often required" },
]

export function WhyFluffyfriendsSection() {
  return (
    <section id="why-fluffyfriends" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Why FluffyFriends
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            More than a pretty picture. More than any other service.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A lot of portrait tools give you a generic image that could belong to anyone&apos;s pet. We give you something made specifically for yours — personalised, print-ready, and crafted to a standard you&apos;d be proud to hang on your wall.
          </p>
          <p className="mt-2 text-pretty text-sm font-medium text-foreground">
            Here&apos;s what you get with FluffyFriends that you won&apos;t find anywhere else.
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="flex flex-col gap-4 rounded-organic border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-organic-sm bg-[#FDF4E8] text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-pretty text-muted-foreground">
                    {f.copy}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-16 overflow-hidden rounded-organic border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-semibold text-foreground">
                    {" "}
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    FluffyFriends
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3">
                      {row.fluffy === true ? (
                        <Check className="h-5 w-5 text-primary" aria-hidden />
                      ) : (
                        <span className="text-muted-foreground">{row.fluffy}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.others === false ? (
                        <X className="h-5 w-5 text-muted-foreground" aria-hidden />
                      ) : (
                        <span className="text-muted-foreground">{row.others}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
          >
            Make My Portrait →
          </Link>
        </div>
      </div>
    </section>
  )
}
