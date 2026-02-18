import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-12 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            FluffyFriends<span className="text-primary">.online</span>
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6">
          {["Privacy", "Terms", "Support", "Instagram"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          {`\u00A9 ${new Date().getFullYear()} FluffyFriends.online. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}
