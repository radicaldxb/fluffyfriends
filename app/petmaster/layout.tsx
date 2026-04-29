"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Menu, PawPrint, X } from "lucide-react"
import { cn } from "@/lib/utils"

const agentsSubLinks = [
  { href: "/petmaster/agents", label: "Overview" },
  { href: "/petmaster/agents/approvals", label: "Approvals" },
  { href: "/petmaster/agents/brain", label: "Brain" },
] as const

const mainNavAfterAgents = [
  { href: "/petmaster/tasks", label: "Tasks" },
  { href: "/petmaster/backlog", label: "Backlog" },
  { href: "/petmaster/dm", label: "DM Generator" },
  { href: "/petmaster/users", label: "Users" },
] as const

function isAgentsPath(pathname: string) {
  return pathname.startsWith("/petmaster/agents")
}

function isSubLinkActive(pathname: string, href: string) {
  if (href === "/petmaster") {
    return pathname === "/petmaster" || pathname === "/petmaster/"
  }
  if (href === "/petmaster/agents") {
    return (
      pathname === "/petmaster/agents" || pathname === "/petmaster/agents/"
    )
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function linkClass(active: boolean) {
  return `block rounded-organic-sm px-3 py-2.5 text-sm font-medium transition-colors ${
    active ? "bg-white/10 text-[#F09A54]" : "text-[#F2EEE2]/90 hover:bg-white/5 hover:text-[#F2EEE2]"
  }`
}

function subLinkClass(active: boolean) {
  return `block rounded-organic-sm py-2 pl-8 pr-3 text-sm transition-colors ${
    active
      ? "bg-white/10 text-[#F09A54] font-medium"
      : "text-[#F2EEE2]/80 hover:bg-white/5 hover:text-[#F2EEE2]"
  }`
}

export default function PetmasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [agentsOpen, setAgentsOpen] = useState(() => isAgentsPath(pathname))

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isAgentsPath(pathname)) {
      setAgentsOpen(true)
    }
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
          className="flex h-11 min-h-11 min-w-11 items-center justify-center rounded-organic-sm text-[#F2EEE2] hover:bg-white/10"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? (
            <X className="h-7 w-7 shrink-0" strokeWidth={2.75} aria-hidden />
          ) : (
            <Menu className="h-7 w-7 shrink-0" strokeWidth={2.75} aria-hidden />
          )}
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

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2" aria-label="PetMaster">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/petmaster"
              className={linkClass(isSubLinkActive(pathname, "/petmaster"))}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>

            {/* Collapsible Agents group */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setAgentsOpen((o) => !o)}
                aria-expanded={agentsOpen}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-organic-sm px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  isAgentsPath(pathname) ? "text-[#F09A54]" : "text-[#F2EEE2]/90",
                  "hover:bg-white/5",
                )}
              >
                <span>Agents</span>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0 text-[#F2EEE2]/50 transition-transform", agentsOpen && "rotate-90")}
                  aria-hidden
                />
              </button>
              {agentsOpen && (
                <ul className="ml-0 flex flex-col border-l border-white/10 pl-1.5" role="list">
                  {agentsSubLinks.map(({ href, label }) => {
                    const active = isSubLinkActive(pathname, href)
                    return (
                      <li key={href}>
                        <Link href={href} className={subLinkClass(active)} onClick={() => setMobileOpen(false)}>
                          {label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {mainNavAfterAgents.map(({ href, label }) => {
              const active = isSubLinkActive(pathname, href)
              return (
                <Link key={href} href={href} className={linkClass(active)} onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              )
            })}
          </div>
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

      {/* Main — charcoal background on Agents routes so tall pages never show cream from the outer shell */}
      <main
        className={cn(
          "min-h-screen pt-14 md:ml-[220px] md:pt-0",
          pathname.startsWith("/petmaster/agents") ? "bg-[#111827]" : "",
        )}
      >
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
