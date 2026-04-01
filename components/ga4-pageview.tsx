"use client"

import { Suspense, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackGa4PageView } from "@/lib/ga4"

function Ga4PageViewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    const path = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    trackGa4PageView(path)
  }, [pathname, searchParams])

  return null
}

/** Pushes `virtual_page_view` to `dataLayer` on client navigations; map in GTM → GA4 `page_view`. */
export function Ga4PageView() {
  return (
    <Suspense fallback={null}>
      <Ga4PageViewInner />
    </Suspense>
  )
}
