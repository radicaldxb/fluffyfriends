import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Your Portrait | FluffyFriends",
  description:
    "Print-ready downloads and portrait credits for every order linked to your email—landscape, portrait, and order details in one place.",
}

export default function MyPortraitsLayout({ children }: { children: React.ReactNode }) {
  return children
}
