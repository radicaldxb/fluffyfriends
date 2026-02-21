import { Upload, Palette, Frame } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Photo",
    description:
      "Snap a picture or choose an existing photo of your pet — one pet per photo. Clear, well-lit shots work best.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose a Theme",
    description:
      "Pick from dozens of art styles — Renaissance, Samurai, Astronaut, and more.",
  },
  {
    icon: Frame,
    step: "03",
    title: "Receive Your Art",
    description:
      "Usually in 2–3 minutes, receive a museum-quality portrait ready to print, frame, or share.",
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Three simple steps to a masterpiece
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No artistic skill needed. Just your favorite pet photo and a few
            clicks.
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
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-organic-sm bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
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
