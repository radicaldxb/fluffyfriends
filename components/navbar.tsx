"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

/**
 * Home anchors must match section ids: gallery-section (#gallery), how-it-works (#process),
 * pricing-section (#pricing), about-section (#about). (When Reviews is re-enabled: #reviews.)
 * See app/page.tsx.
 */
const navLinks = [
  { label: "Gallery", href: "/#gallery" },
  { label: "How it works", href: "/#process" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "My Portraits", href: "/my-portraits" },
]

type NavbarProps = {
  /** /create: hide links and CTA during the pre-reveal email gate; logo only. */
  emailGateMode?: boolean
}

export function Navbar({ emailGateMode = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (emailGateMode) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6" aria-label="FluffyFriends">
          <a href="/" className="flex shrink-0 items-center" aria-label="FluffyFriends home">
            <Image
              src="/logos/FluffyFriends-logo.webp"
              alt="FluffyFriends"
              width={112}
              height={112}
              sizes="(max-width: 768px) 40px, 52px"
              className="h-10 w-10 object-contain sm:h-11 sm:w-11 md:h-[3.45rem] md:w-[3.45rem]"
              priority
              unoptimized
            />
          </a>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" className="flex shrink-0 items-center" aria-label="FluffyFriends home">
          {/* Circular mark — all breakpoints (tablet + desktop use icon instead of wordmark) */}
          <Image
            src="/logos/FluffyFriends-logo.webp"
            alt="FluffyFriends"
            width={112}
            height={112}
            sizes="(max-width: 768px) 40px, 52px"
            className="h-10 w-10 object-contain sm:h-11 sm:w-11 md:h-[3.45rem] md:w-[3.45rem]"
            priority
            unoptimized
          />
        </a>

        <ul className="hidden items-center justify-center gap-5 md:flex md:flex-1 md:max-w-2xl">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            className="hidden sm:inline-flex rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02]"
            asChild
          >
            <a href="/create">Create Their Portrait →</a>
          </Button>
          <button
            type="button"
            className="flex h-11 min-h-11 min-w-11 items-center justify-center text-foreground md:hidden -m-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-7 w-7 shrink-0" strokeWidth={2.75} aria-hidden />
            ) : (
              <Menu className="h-7 w-7 shrink-0" strokeWidth={2.75} aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 pt-2 border-t border-border/50">
              <Button
                size="lg"
                className="w-full rounded-organic-sm px-7 py-3.5 text-base font-semibold shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.02]"
                asChild
              >
                <a href="/create" onClick={() => setMobileOpen(false)}>Create Their Portrait →</a>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
