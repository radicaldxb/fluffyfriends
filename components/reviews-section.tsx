import { Button } from "@/components/ui/button"

const reviews = [
  {
    name: "Sarah M., proud owner of Biscuit",
    quote:
      "I genuinely did not expect it to look this good. The name detail in the portrait — I completely lost it. It's now framed above our fireplace and everyone who visits asks where I got it.",
  },
  {
    name: "Tom R., proud owner of Luna",
    quote:
      "Bought it as a birthday gift for my partner. She screamed. The quality of the file is incredible — we printed it A2 and every single hair is sharp. It looks like a real painting.",
  },
  {
    name: "Priya K., proud owner of Mochi",
    quote:
      "Was honestly a bit sceptical. Now I've ordered three. The free print guide made everything so easy — I walked into my local print shop, handed them the file, and walked out with something I'll keep forever.",
  },
]

export function ReviewsSection() {
  return (
    <section id="reviews" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Reviews
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real pets. Real owners. Real reactions.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="relative overflow-hidden rounded-organic border border-border bg-card p-6 shadow-md"
            >
              <blockquote className="text-sm text-muted-foreground">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-foreground">
                {review.name}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-foreground">
            Ready to create your portrait?
          </p>
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
            asChild
          >
            <a href="/create">What Would My Pet Look Like?</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

