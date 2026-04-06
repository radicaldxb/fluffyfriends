import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 lg:gap-14">
          <div className="relative min-h-[280px] w-full overflow-hidden rounded-2xl shadow-md sm:min-h-[360px] lg:min-h-[min(32rem,70vh)]">
            <Image
              src="/images/founder-pet-wall.webp"
              alt="A FluffyFriends portrait hanging at home."
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col justify-center text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our story
            </p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Built for pet people, by a pet person.
            </h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground">
              FluffyFriends started because I wanted a portrait of my own pet that was actually worth keeping. Not a filter. Not a novelty. Something I&apos;d be proud to hang on my wall for decades — and pass down.
            </p>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Everything here is what I&apos;d want for myself. The personalisation, the print quality, the two formats, the free guide. Made with care. Built to last.
            </p>
            <p className="mt-6 text-sm italic text-muted-foreground">
              — Stephan, Founder · Dubai
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
