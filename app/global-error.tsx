"use client"

import { useEffect } from "react"
import "./globals.css"
import { Button } from "@/components/ui/button"
import { GTM_CONSENT_DEFAULT_SCRIPT, GTM_HEAD_SCRIPT, GTM_NS_IFRAME_SRC } from "@/lib/gtm"

/**
 * Replaces the root layout when active; must repeat GTM here so tags still load.
 * Normal routes inherit GTM from `app/layout.tsx` only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: GTM_CONSENT_DEFAULT_SCRIPT,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: GTM_HEAD_SCRIPT,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <noscript>
          <iframe
            src={GTM_NS_IFRAME_SRC}
            height={0}
            width={0}
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-20 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Something went wrong</h1>
          <p className="leading-relaxed text-muted-foreground">We couldn&apos;t load this page. Try again.</p>
          <Button type="button" onClick={reset} className="rounded-organic-sm">
            Try again
          </Button>
        </main>
      </body>
    </html>
  )
}
