import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Nunito } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { MetaPixelPageView } from "@/components/meta-pixel-pageview"
import { ScrollToTop } from "@/components/scroll-to-top"
import EnvBanner from "@/components/env-banner"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] })

export const metadata: Metadata = {
  title: 'FluffyFriends.online — AI Pet Portrait Studio',
  description:
    'Transform your beloved pet into museum-quality fine art with the power of AI. Choose from 8 stunning themes.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/image/favicon.svg', type: 'image/svg+xml' }],
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
        <meta name="p:domain_verify" content="072996b898e320f185b73df0af5261d2" />
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
        <Script
          id="facebook-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1775434052703488');
      fbq('track', 'PageView');
    `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <noscript>
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1775434052703488&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <MetaPixelPageView />
        <ScrollToTop />
        {children}
        <EnvBanner />
      </body>
    </html>
  )
}
