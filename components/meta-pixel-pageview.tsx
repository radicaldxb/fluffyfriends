"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { pageview } from "@/lib/fpixel"

/** PageView on client-side navigations; first paint is covered by the base script in layout. */
export function MetaPixelPageView() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    pageview()
  }, [pathname])

  return null
}
