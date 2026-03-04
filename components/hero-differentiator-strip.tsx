import { Tag, LayoutGrid, BookOpen, Frame } from "lucide-react"

const pillars = [
  {
    icon: Tag,
    title: "Personalised to them",
    copy: "Their name, worked into every portrait. Whatever the theme.",
  },
  {
    icon: LayoutGrid,
    title: "Two formats, one price",
    copy: "Wide format and tall format — both included, both print-ready.",
  },
  {
    icon: BookOpen,
    title: "Free print guide",
    copy: "We show you exactly how to get it printed, framed, and on your wall.",
  },
  {
    icon: Frame,
    title: "A1 print quality",
    copy: "Sharp enough to fill an entire wall. Most services top out at A4. We don't.",
  },
]

export function HeroDifferentiatorStrip() {
  return (
    <section className="relative border-t border-border/50 bg-card/30 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-organic-sm bg-[#FDF4E8] text-primary shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-base font-bold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {pillar.copy}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
