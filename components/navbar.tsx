"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

/**
 * Home anchors must match section ids: gallery-section (#gallery), how-it-works (#process),
 * reviews-section (#reviews), pricing-section (#pricing), about-section (#about).
 * See app/page.tsx.
 */
const navLinks = [
  { label: "Gallery", href: "/#gallery" },
  { label: "How it works", href: "/#process" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "My Portraits", href: "/my-portraits" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" className="flex shrink-0 items-center" aria-label="FluffyFriends home">
          <Image
            src="/logos/FluffyFriends-logo.webp"
            alt="FluffyFriends — AI Pet Portraits"
            width={112}
            height={112}
            sizes="48px"
            className="h-10 w-10 object-contain md:h-12 md:w-12"
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
            className="text-foreground p-2 md:hidden -m-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
