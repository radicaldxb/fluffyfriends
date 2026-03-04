import { Palette, Upload, Frame } from "lucide-react"

const steps = [
  {
    icon: Palette,
    step: "01",
    title: "Choose their theme",
    description:
      "Browse our collection of hand-crafted themes — from Brave Fireman to Viking Warrior to Royal Knight. Each one is designed so their name is woven into the portrait itself.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload one photo",
    description:
      "Just one clear photo of your pet. We check it works before you pay a penny — so there are no surprises, no disappointments, and no wasted money.",
  },
  {
    icon: Frame,
    step: "03",
    title: "Pay once, own it forever",
    description:
      "From $17, one time. No subscription. Within minutes, two print-ready files land in your inbox — wide format and tall format — plus a free guide for printing and framing.",
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Simple enough for anyone. Beautiful enough for any wall.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No tech skills needed. No subscriptions. Just your favourite photo and a few minutes of your time.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative overflow-hidden rounded-organic border border-border bg-card p-8 shadow-md transition-all hover:shadow-lg"
            >
              {/* Step number watermark */}
              <span className="absolute -right-2 -top-4 text-8xl font-black text-foreground/[0.03] select-none">
                {item.step}
              </span>

              <div className="relative z-10">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF4E8] text-[#E8863A] shadow-sm transition-colors group-hover:bg-[#FBE3C4]">
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
