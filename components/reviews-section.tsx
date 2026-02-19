import { Button } from "@/components/ui/button"

const reviews = [
  {
    name: "Sophie & Milo",
    quote:
      "The premium bundle gave us a hero print for the hallway and four extra portraits we rotate on our bookshelf. Everyone comments on it.",
  },
  {
    name: "James & Luna",
    quote:
      "The 4K files are insanely sharp. We printed one large canvas locally and it looks like something from a gallery.",
  },
  {
    name: "Amira & Nala",
    quote:
      "We ordered the printed option as a gift. It arrived framed, ready to hang, and the orange tones look perfect on our dark wall.",
  },
]

export function ReviewsSection() {
  return (
    <section id="reviews" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Loved by pet parents
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real walls, real reactions
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            See how other FluffyFriends owners are using their portraits — from
            print‑ready downloads to full gallery walls with the Premium Print + 5 Pack.
          </p>
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
            className="rounded-organic-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            asChild
          >
            <a href="#pricing">Create My Portrait</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

