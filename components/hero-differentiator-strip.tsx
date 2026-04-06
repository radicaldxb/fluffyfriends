import Image from "next/image"

const columns = [
  {
    src: "/images/king-portrait-wall.webp",
    alt: "Pet portrait in gold frame on wall",
    headline: "Hang it on your wall.",
    subtext:
      "Portrait format — tall and gallery-ready. Perfect for staircases, hallways, and feature walls.",
  },
  {
    src: "/images/mochi-landscape-wall.webp",
    alt: "Landscape format pet portrait on wall",
    headline: "Display it anywhere.",
    subtext:
      "Landscape format — wide and cinematic. Ideal for mantels, shelves, and wide frames.",
  },
  {
    src: "/images/Willy-frame.webp",
    alt: "Pet name personalised into the portrait artwork",
    headline: "Their name. In the art.",
    subtext:
      "Not a caption. Not a watermark. Their name is crafted into the costume itself — a badge, a crest, a name tag. Uniquely theirs.",
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
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{col.subtext}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Both formats included with every order — portrait and landscape. No extra charge. 🐾
        </p>
      </div>
    </section>
  )
}
