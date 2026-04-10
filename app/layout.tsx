import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Nunito } from "next/font/google"
import Script from "next/script"
import { headers } from "next/headers"
import "./globals.css"
import { Ga4PageView } from "@/components/ga4-pageview"
import { MetaPixelPageView } from "@/components/meta-pixel-pageview"
import { ScrollToTop } from "@/components/scroll-to-top"
import { GTM_CONSENT_DEFAULT_SCRIPT, GTM_HEAD_SCRIPT, GTM_NS_IFRAME_SRC } from "@/lib/gtm"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "FluffyFriends — AI Pet Portraits",
  description:
    "Named, print-ready, and delivered in minutes. One photo is all it takes. From $17, one-time.",
  alternates: {
    canonical: "https://fluffyfriends.online",
  },
  generator: "v0.app",
  icons: {
    icon: [{ url: '/image/favicon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#faf8f4',
  userScalable: true,
}

/** Meta Pixel ID — digits only; set `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` in Netlify. */
const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ?? ""
const loadFacebookPixel = /^\d{5,24}$/.test(facebookPixelId)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? ""
  const isPetmasterRoute = pathname.startsWith("/petmaster")

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
        {!isPetmasterRoute ? (
          <>
            {/* Consent defaults before GTM so GA4 can send (see lib/gtm.ts). */}
            <script
              dangerouslySetInnerHTML={{
                __html: GTM_CONSENT_DEFAULT_SCRIPT,
              }}
            />
            {/* Google Tag Manager — not loaded on /petmaster */}
            <script
              dangerouslySetInnerHTML={{
                __html: GTM_HEAD_SCRIPT,
              }}
            />
            {loadFacebookPixel ? (
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
      fbq('init', '${facebookPixelId}');
      fbq('track', 'PageView');
    `,
                }}
              />
            ) : null}
          </>
        ) : null}
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        {!isPetmasterRoute ? (
          <>
            <noscript>
              <iframe
                src={GTM_NS_IFRAME_SRC}
                height={0}
                width={0}
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
            {loadFacebookPixel ? (
              <noscript>
                <img
                  height={1}
                  width={1}
                  style={{ display: "none" }}
                  src={`https://www.facebook.com/tr?id=${encodeURIComponent(facebookPixelId)}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            ) : null}
            <Ga4PageView />
            {loadFacebookPixel ? <MetaPixelPageView /> : null}
          </>
        ) : null}
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
