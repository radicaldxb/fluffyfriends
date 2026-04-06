import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | FluffyFriends",
  description:
    "Everything you need to know about FluffyFriends AI pet portraits — quality, delivery, printing, and pricing.",
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
