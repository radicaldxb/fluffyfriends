"use client"

import { useEffect } from "react"

const TITLE = "Page not found — FluffyFriends.online"

/** Sets the tab title for the global not-found UI (metadata is not available on `not-found.tsx`). */
export function NotFoundDocumentTitle() {
  useEffect(() => {
    document.title = TITLE
  }, [])
  return null
}
