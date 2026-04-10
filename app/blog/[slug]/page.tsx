import type { ComponentPropsWithoutRef } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BlogArticleShareButtons } from "@/components/blog-article-share-buttons"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { cn } from "@/lib/utils"

export const dynamic = "force-static"

const SITE = "https://fluffyfriends.online"

function absoluteAsset(path: string | undefined): string | undefined {
  if (!path?.trim()) return undefined
  const p = path.trim()
  if (p.startsWith("http://") || p.startsWith("https://")) return p
  return `${SITE}${p.startsWith("/") ? "" : "/"}${p}`
}

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) {
    return { title: "Not found | FluffyFriends" }
  }
  const { frontmatter } = result
  const title = (frontmatter.seoTitle?.trim() || frontmatter.title || "Blog").trim()
  const description = (
    frontmatter.seoDescription?.trim() ||
    frontmatter.excerpt?.trim() ||
    ""
  ).trim()

  const ogImageUrl = absoluteAsset(frontmatter.ogImage)
  const coverUrl = absoluteAsset(frontmatter.coverImage)
  const openGraphImages = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630 }]
    : coverUrl
      ? [{ url: coverUrl, width: 1200, height: 630 }]
      : []

  const twitterImages = frontmatter.ogImage?.trim() ? [absoluteAsset(frontmatter.ogImage)!] : []

  return {
    title: `${title} | FluffyFriends`,
    description: description || undefined,
    openGraph: {
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.excerpt,
      url: `${SITE}/blog/${slug}`,
      siteName: "FluffyFriends",
      images: openGraphImages,
      type: "article",
      publishedTime: frontmatter.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.excerpt,
      images: twitterImages,
    },
  }
}

const mdxComponents = {
  img: ({ className, ...props }: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element -- MDX body assets from /public
    <img
      {...props}
      className={cn(
        "my-6 mx-auto block h-auto w-full max-w-full rounded-organic border border-border object-contain object-center",
        className,
      )}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-4 scroll-mt-24 border-b border-border pb-2 font-heading text-2xl font-bold tracking-tight text-foreground first:mt-0"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/90" {...props} />
  ),
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const result = getPostBySlug(slug)
  if (!result) {
    notFound()
  }

  const { frontmatter, content } = result
  const shareUrl = `${SITE}/blog/${slug}`

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <article className="flex-1 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-6 text-sm">
            <Link
              href="/blog"
              className="font-medium text-primary underline-offset-2 transition-colors hover:text-primary/90"
            >
              ← Back to blog
            </Link>
          </p>

          <header className="mx-auto w-full min-w-0 max-w-[680px]">
            {frontmatter.coverImage ? (
              <div className="relative mb-8 w-full overflow-hidden rounded-organic border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frontmatter.coverImage}
                  alt={frontmatter.coverImageAlt || frontmatter.title}
                  className="block h-auto w-full"
                  sizes="(max-width: 680px) calc(100vw - 2rem), 680px"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            ) : null}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {frontmatter.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {frontmatter.publishedAt ? (
                <time dateTime={frontmatter.publishedAt}>{formatPublishedAt(frontmatter.publishedAt)}</time>
              ) : null}
              <span className="font-medium text-primary">{frontmatter.readingTime}</span>
            </div>
            <BlogArticleShareButtons url={shareUrl} title={frontmatter.title} placement="below-header" />
          </header>

          <div className="prose-blog mx-auto mt-12 max-w-[680px] leading-[1.8] text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:hover:text-primary/90 [&_li]:my-1 [&_p]:my-4 [&_strong]:text-foreground [&_ul]:my-4">
            {await MDXRemote({ source: content, components: mdxComponents })}
          </div>

          <BlogArticleShareButtons
            url={shareUrl}
            title={frontmatter.title}
            placement="below-content"
            className="mx-auto max-w-[680px]"
          />
        </div>
      </article>

      <Footer />
    </main>
  )
}
