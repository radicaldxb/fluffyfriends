import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 text-center">
        <a href="/" className="shrink-0">
          <Image
            src="/logos/FluffyFriends-logo.webp"
            alt="FluffyFriends.online"
            width={80}
            height={80}
            className="h-[4.6rem] w-[4.6rem] object-contain sm:h-[5.75rem] sm:w-[5.75rem]"
          />
        </a>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          <a href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          <a href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</a>
          <a href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</a>
          <a href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Support</a>
          <a
            href="https://www.instagram.com/fluffyfriendsonline"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Instagram
          </a>
        </nav>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/90">
            Portraits made with love, built to last. 🐾
          </p>
          <p className="text-xs text-muted-foreground">
            {`\u00A9 ${new Date().getFullYear()} FluffyFriends.online`}
          </p>
        </div>
      </div>
    </footer>
  )
}
