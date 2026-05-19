import Link from "next/link"
import { Fragment } from "react"

const linkClass =
  "font-medium text-primary underline underline-offset-2 decoration-primary/60 hover:text-primary/90"

const RADICAL = "https://radical-thinking.net"

/**
 * Turns plain copy into actionable links: mailto for emails, site URL for Radical Thinking
 * and radical-thinking.net, internal link for fluffyfriends.online/create.
 */
export function ContactRichText({ text }: { text: string }) {
  const re =
    /(fluffyfriends\.online\/create|radical-thinking\.net|\bRadical Thinking\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const parts = text.split(re)

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
          return (
            <a key={i} href={`mailto:${part}`} className={linkClass}>
              {part}
            </a>
          )
        }
        if (part === "radical-thinking.net") {
          return (
            <a key={i} href={RADICAL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {part}
            </a>
          )
        }
        if (part === "Radical Thinking") {
          return (
            <a key={i} href={RADICAL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {part}
            </a>
          )
        }
        if (part === "fluffyfriends.online/create") {
          return (
            <Link key={i} href="/create" className={linkClass}>
              {part}
            </Link>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
