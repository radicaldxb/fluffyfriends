import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pet Portrait Gallery — Real Pets, Real Names | FluffyFriends",
  description:
    "See real FluffyFriends portraits — every pet named and personalised in the artwork itself.",
  alternates: {
    canonical: "https://fluffyfriends.online/gallery",
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
