import Image from "next/image"

export function HeroDifferentiatorStrip() {
  return (
    <section className="relative border-t border-border/50 bg-card/30 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
          <figure className="flex flex-col items-center text-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-organic shadow-md">
              <Image
                src="/images/Oscar-portrait.webp"
                alt="Portrait-format pet portrait mockup"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <figcaption className="mt-3 text-sm font-medium leading-relaxed text-foreground">
              Portrait format — for walls and staircases
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center text-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-organic shadow-md">
              <Image
                src="/images/Mochi-Landscape.webp"
                alt="Landscape-format pet portrait mockup"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <figcaption className="mt-3 text-sm font-medium leading-relaxed text-foreground">
              Landscape format — for mantels and wide frames
            </figcaption>
          </figure>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Both formats included with every order. No extra charge. 🐾
        </p>
      </div>
    </section>
  )
}
