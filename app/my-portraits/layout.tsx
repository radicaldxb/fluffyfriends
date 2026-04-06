import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Portraits | FluffyFriends",
  description: "View and download your FluffyFriends pet portraits.",
}

export default function MyPortraitsLayout({ children }: { children: React.ReactNode }) {
  return children
}
