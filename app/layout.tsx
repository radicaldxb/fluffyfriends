import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
