"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-1.5 border-t border-border bg-background px-5 pb-5 pt-3 shadow-[0_-4px_20px_hsl(0_0%_0%/0.08)] md:hidden"
    >
      <Link
        href="/create"
        className="block w-full rounded-organic-sm bg-primary py-3.5 text-center text-base font-semibold text-primary-foreground no-underline"
      >
        See Yours Free →
      </Link>
      <p className="m-0 text-center text-xs text-muted-foreground">
        Free preview. No signup. Pay only if you love it.
      </p>
    </div>
  )
}
