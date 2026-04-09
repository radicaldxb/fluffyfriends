import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"

export const dynamic = "force-static"

export function generateMetadata(): Metadata {
  return {
    title: "Blog | FluffyFriends",
    description: "Personalised pet portrait ideas, gift guides, and stories for pet lovers.",
  }
}

function formatPublishedAt(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ""
  return new Date(t).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="flex-1 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 md:mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-heading">
              Blog
            </h1>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              Personalised pet portrait ideas, gift guides, and stories for pet lovers.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 rounded-organic border border-border bg-card/50">
              Articles coming soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full rounded-organic border border-border bg-card overflow-hidden transition-shadow hover:shadow-md hover:border-primary/30"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {post.coverImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.coverImage}
                            alt={post.coverImageAlt || post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </>
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-sm"
                          aria-hidden
                        >
                          FluffyFriends
                        </div>
                      )}
                    </div>
                    <div className="p-5 text-left">
                      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{post.readingTime}</span>
                        {post.publishedAt ? (
                          <time dateTime={post.publishedAt}>{formatPublishedAt(post.publishedAt)}</time>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
