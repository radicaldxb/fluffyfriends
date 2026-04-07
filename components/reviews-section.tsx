"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const reviews = [
  {
    quote:
      "I genuinely did not expect it to look this good. The name detail in the portrait — I completely lost it. It's now framed above our fireplace and everyone who visits asks where I got it.",
    reviewer: "Sarah M.",
    pet: "Biscuit",
    theme: "King theme",
  },
  {
    quote:
      "Bought it as a birthday gift for my partner. She screamed. The quality of the file is incredible — we printed it A2 and every single hair is sharp. It looks like a real painting.",
    reviewer: "Tom R.",
    pet: "Luna",
    theme: "Queen theme",
  },
  {
    quote:
      "Was honestly a bit sceptical. Now I've ordered three. The free print guide made everything so easy — I walked into my local print shop, handed them the file, and walked out with something I'll keep forever.",
    reviewer: "Priya K.",
    pet: "Mochi",
    theme: "Fireman theme",
  },
] as const

const STAR_ROW = "★★★★★"

export function ReviewsSection() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const onSelect = useCallback((carousel: CarouselApi) => {
    setCurrent(carousel.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <section id="reviews" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Reviews</p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real pets. Real owners. Real reactions.
          </h2>
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
          <span className="text-primary" aria-hidden>
            {STAR_ROW}{" "}
          </span>
          Loved by pet owners across the US, Canada, Australia and beyond
        </p>

        <div className="relative mx-auto mt-8 w-full max-w-6xl px-4 sm:px-10 md:px-14">
          <div className="mx-auto w-full max-w-sm sm:max-w-none">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: false,
                containScroll: "trimSnaps",
              }}
              setApi={setApi}
              className="w-full"
            >
              <CarouselPrevious
                variant="outline"
                className="left-0 hidden size-9 rounded-organic-sm border-border hover:bg-secondary/50 lg:flex md:-left-1"
                aria-label="Previous reviews"
              />
              <CarouselContent className="-ml-4">
                {reviews.map((review, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-full pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <article className="flex h-full w-full flex-col rounded-2xl bg-card p-8 shadow-lg">
                      <p className="text-primary" aria-hidden>
                        {STAR_ROW}
                      </p>
                      <blockquote className="mt-4 flex-1 text-pretty text-base leading-relaxed text-foreground">
                        <span className="text-lg font-semibold text-primary" aria-hidden>
                          &ldquo;
                        </span>
                        {review.quote}
                        <span className="text-lg font-semibold text-primary" aria-hidden>
                          &rdquo;
                        </span>
                      </blockquote>
                    <div className="mt-6 border-t border-border pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-bold text-foreground">{review.reviewer}</p>
                        <span className="inline-flex w-fit shrink-0 self-end rounded-organic-sm border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:self-auto">
                          {review.pet} · {review.theme}
                        </span>
                      </div>
                    </div>
                  </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext
                variant="outline"
                className="right-0 hidden size-9 rounded-organic-sm border-border hover:bg-secondary/50 lg:flex md:-right-1"
                aria-label="Next reviews"
              />
            </Carousel>

            <div
              className={cn(
                "mt-6 flex justify-center gap-2",
                reviews.length < 4 && "lg:hidden",
              )}
              role="tablist"
              aria-label="Review slides"
            >
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={current === i}
                  aria-label={`Go to review ${i + 1}`}
                  className={cn(
                    "h-2.5 w-2.5 rounded-organic-sm transition-colors",
                    current === i ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                  onClick={() => api?.scrollTo(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-foreground">Your pet deserves this.</p>
          <Button
            size="lg"
            className="inline-flex items-center gap-2 rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02] h-auto"
            asChild
          >
            <a href="/create">Create My Portrait →</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
