import type { Metadata } from "next"

const SITE = "https://fluffyfriends.online"
const title = "Pet Portrait Gallery — Real Pets, Real Names | FluffyFriends"
const description =
  "See real FluffyFriends portraits — every pet named and personalised in the artwork itself."

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
