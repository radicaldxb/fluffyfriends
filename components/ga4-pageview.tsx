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

/** Sends GA4 page_view on client-side navigations; first paint is covered by gtag config in layout. */
export function Ga4PageView() {
  return (
    <Suspense fallback={null}>
      <Ga4PageViewInner />
    </Suspense>
  )
}
