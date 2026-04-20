"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, PawPrint, X } from "lucide-react"

const navItems = [
  { href: "/petmaster", label: "Dashboard" },
  { href: "/petmaster/tasks", label: "Tasks" },
  { href: "/petmaster/backlog", label: "Backlog" },
  { href: "/petmaster/dm", label: "DM Generator" },
  { href: "/petmaster/users", label: "Users" },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/petmaster") {
    return pathname === "/petmaster" || pathname === "/petmaster/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function PetmasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (pathname === "/petmaster/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F2EEE2] text-[#111827]">
      {/* Mobile top bar */}
      <header
        className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 px-4 md:hidden"
        style={{ backgroundColor: "#111827" }}
      >
        <button
          type="button"
          className="rounded-organic-sm p-2 text-[#F2EEE2] hover:bg-white/10"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="flex items-center gap-1.5 font-mono text-xs text-[#F2EEE2]">
          <PawPrint className="h-3.5 w-3.5 shrink-0 text-[#F09A54]" aria-hidden />
          PetMaster
        </span>
      </header>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[220px] flex-col border-r border-white/10 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ backgroundColor: "#111827", color: "#F2EEE2" }}
      >
        <div className="flex items-center gap-1.5 p-4 pb-2 font-mono text-xs text-[#F2EEE2]">
          <PawPrint className="h-3.5 w-3.5 shrink-0 text-[#F09A54]" aria-hidden />
          PetMaster
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {navItems.map(({ href, label }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-organic-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-[#F09A54]"
                    : "text-[#F2EEE2]/90 hover:bg-white/5 hover:text-[#F2EEE2]"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          <a
            href="/api/petmaster-logout"
            className="block rounded-organic-sm px-3 py-2.5 text-sm font-medium text-[#F2EEE2]/80 hover:bg-white/5 hover:text-[#F2EEE2]"
          >
            Logout
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen pt-14 md:ml-[220px] md:pt-0">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
