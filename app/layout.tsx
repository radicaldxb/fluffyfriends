import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Nunito } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ScrollToTop } from "@/components/scroll-to-top"
import EnvBanner from "@/components/env-banner"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] })

export const metadata: Metadata = {
  title: 'FluffyFriends.online — AI Pet Portrait Studio',
  description:
    'Transform your beloved pet into museum-quality fine art with the power of AI. Choose from dozens of stunning themes.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/image/favicon.ico', sizes: 'any' },
      { url: '/image/favicon.svg', type: 'image/svg+xml' },
      {
        url: '/image/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/image/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/image/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#faf8f4',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${nunito.variable}`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_ENV === "staging" && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8KYJG9BH46"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-8KYJG9BH46');
  `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <ScrollToTop />
        {children}
        <EnvBanner />
      </body>
    </html>
  )
}
