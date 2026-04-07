import Image from "next/image"

/** Set to true when Pinterest should appear in the footer again. */
const SHOW_PINTEREST_IN_FOOTER = true

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 text-center">
        <a href="/" className="shrink-0">
          <Image
            src="/logos/FluffyFriends-logo.webp"
            alt="FluffyFriends — AI Pet Portraits"
            width={80}
            height={80}
            className="h-[4.6rem] w-[4.6rem] object-contain sm:h-[5.75rem] sm:w-[5.75rem]"
          />
        </a>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          <a href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          <a href="/themes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Themes</a>
          <a href="/intelligence" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Intelligence</a>
          <a href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Support</a>
          <a href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</a>
          <a href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</a>
        </nav>

        <div className="flex items-center justify-center gap-5">
          <a
            href="https://www.instagram.com/fluffyfriends.online"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FluffyFriends on Instagram"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@fluffyfriendsonline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FluffyFriends on TikTok"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/fluffyfriendsonline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FluffyFriends on Facebook"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          {SHOW_PINTEREST_IN_FOOTER ? (
            <a
              href="https://www.pinterest.com/fluffyfriendsonline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FluffyFriends on Pinterest"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </a>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/90">
            Portraits made with love, built to last.
          </p>
          <p className="text-xs text-muted-foreground">
            {`\u00A9 ${new Date().getFullYear()} FluffyFriends.online`}
          </p>
        </div>
      </div>
    </footer>
  )
}
