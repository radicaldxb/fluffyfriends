"use client"

import type { SVGProps } from "react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"

const ICON = "h-5 w-5 shrink-0 text-[#6B7280] transition-colors group-hover:text-[#F09A54]"
const LABEL = "text-[10px] leading-tight text-[#6B7280] transition-colors group-hover:text-[#F09A54]"

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={ICON} aria-hidden {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={ICON} aria-hidden {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

type Placement = "below-header" | "below-content"

export function BlogArticleShareButtons({
  url,
  title,
  placement,
  className,
}: {
  url: string
  title: string
  placement: Placement
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const shareFacebook = useCallback(() => {
    const u = encodeURIComponent(url)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener,noreferrer,width=600,height=400")
  }, [url])

  const copyForInstagram = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }, [url])

  const shareEmail = useCallback(() => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`I thought you'd like this: ${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, [title, url])

  const baseBtn =
    "group flex flex-col items-center gap-1 rounded-organic-sm p-1.5 opacity-50 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div
      className={cn(
        placement === "below-header" ? "mt-4 flex justify-end" : "mt-8 flex flex-col items-center gap-4",
        className,
      )}
    >
      {placement === "below-content" ? (
        <>
          <div className="h-px w-full max-w-[680px] bg-[#E5E0D5]" />
          <p className="text-center text-xs font-medium text-muted-foreground">Share this article</p>
        </>
      ) : null}
      <div className={cn("flex flex-wrap items-start gap-6", placement === "below-content" && "justify-center")}>
        <button type="button" onClick={shareFacebook} className={baseBtn} aria-label="Share on Facebook">
          <FacebookIcon />
          <span className={LABEL}>Facebook</span>
        </button>
        <div className="relative flex flex-col items-center">
          <button type="button" onClick={copyForInstagram} className={baseBtn} aria-label="Copy link for Instagram">
            <InstagramIcon />
            <span className={LABEL}>Instagram</span>
          </button>
          {copied ? (
            <span className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-organic-sm border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
              Link copied
            </span>
          ) : null}
        </div>
        <button type="button" onClick={shareEmail} className={baseBtn} aria-label="Share by email">
          <EmailIcon />
          <span className={LABEL}>Email</span>
        </button>
      </div>
    </div>
  )
}
