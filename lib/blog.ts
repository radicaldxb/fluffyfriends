import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

const postsDirectory = path.join(process.cwd(), "content/blog")

export type Post = {
  title: string
  slug: string
  publishedAt: string
  excerpt: string
  coverImage?: string
  coverImageAlt?: string
  /** Optional 1200×630 (or similar) asset for OG / Twitter when cover is not ideal */
  ogImage?: string
  seoTitle?: string
  seoDescription?: string
  readingTime: string
  tags: string[]
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean)
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((t) => t.trim()).filter(Boolean)
  }
  return []
}

function matterDataToPost(
  data: Record<string, unknown>,
  slug: string,
  body: string,
): Post {
  const rt = readingTime(body)
  const publishedRaw =
    (typeof data.publishedAt === "string" && data.publishedAt) ||
    (typeof data.date === "string" && data.date) ||
    ""

  return {
    title: typeof data.title === "string" ? data.title : "",
    slug,
    publishedAt: publishedRaw,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
    coverImageAlt: typeof data.coverImageAlt === "string" ? data.coverImageAlt : undefined,
    ogImage: typeof data.ogImage === "string" ? data.ogImage : undefined,
    seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : undefined,
    seoDescription: typeof data.seoDescription === "string" ? data.seoDescription : undefined,
    readingTime: rt.text,
    tags: normalizeTags(data.tags),
  }
}

/**
 * Reads all `.mdx` files from `content/blog/`, returns frontmatter + slug per file,
 * sorted by `publishedAt` descending (newest first).
 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"))
  const posts: Post[] = []

  for (const file of files) {
    const slug = file.replace(/\.mdx$/i, "")
    if (!slug || slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
      continue
    }

    const fullPath = path.join(postsDirectory, file)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)
    posts.push(matterDataToPost(data as Record<string, unknown>, slug, content))
  }

  posts.sort((a, b) => {
    const ta = Date.parse(a.publishedAt)
    const tb = Date.parse(b.publishedAt)
    const na = Number.isNaN(ta) ? 0 : ta
    const nb = Number.isNaN(tb) ? 0 : tb
    return nb - na
  })

  return posts
}

/**
 * Returns frontmatter as `Post` plus raw MDX body string for `next-mdx-remote` (or similar).
 */
export function getPostBySlug(slug: string): { frontmatter: Post; content: string } | null {
  if (!slug || slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    return null
  }

  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)
  const frontmatter = matterDataToPost(data as Record<string, unknown>, slug, content)

  return { frontmatter, content }
}
