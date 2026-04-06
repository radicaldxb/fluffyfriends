import Image from "next/image"

const columns = [
  {
    src: "/images/Oscar-portrait.webp",
    alt: "Portrait-format pet portrait mockup",
    headline: "Made to hang.",
    subtext: (
      <>
        Portrait format —<br />
        for walls and staircases.
      </>
    ),
  },
  {
    src: "/images/Mochi-Landscape.webp",
    alt: "Landscape-format pet portrait mockup",
    headline: "Made to display.",
    subtext: (
      <>
        Landscape format —<br />
        for mantels and wide frames.
      </>
    ),
  },
  {
    src: "/images/Willy.webp",
    alt: "Pet portrait with personalised name in the artwork",
    headline: "Made for your pet.",
    subtext: (
      <>
        Every marking, every detail.
        <br />
        Their name in the artwork.
      </>
    ),
  },
] as const

export function HeroDifferentiatorStrip() {
  return (
    <section className="relative border-t border-border/50 bg-card/30 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
          {columns.map((col) => (
            <figure key={col.src} className="flex flex-col items-center text-center">
              <div className="relative h-[240px] w-full overflow-hidden rounded-organic shadow-md md:h-[320px]">
                <Image
                  src={col.src}
                  alt={col.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-4 w-full">
                <h3 className="text-base font-bold tracking-tight text-foreground">{col.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{col.subtext}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Both formats included with every order. No extra charge. 🐾
        </p>
      </div>
    </section>
  )
}
