import type { Metadata } from "next"

const SITE = "https://fluffyfriends.online"
const title = "Gallery — Real Pets, Real Names | FluffyFriends"
const description =
  "Real pets, real names—each portrait personalised in the artwork. Browse the gallery, then create yours."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE}/gallery`,
  },
  openGraph: {
    title,
    description,
    url: `${SITE}/gallery`,
    siteName: "FluffyFriends",
    images: [{ url: `${SITE}/images/og/OG-Gallery.webp`, alt: "FluffyFriends pet portrait gallery" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${SITE}/images/og/OG-Gallery.webp`],
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
