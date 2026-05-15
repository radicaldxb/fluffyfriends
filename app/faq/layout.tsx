import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Questions Answered | FluffyFriends",
  description:
    "Answers on print quality, delivery, remakes, pricing, and privacy—personalised pet portraits with their name in the art.",
  alternates: {
    canonical: "https://fluffyfriends.online/faq",
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
