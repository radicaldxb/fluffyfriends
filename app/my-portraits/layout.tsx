import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Your Portrait | FluffyFriends",
  description:
    "Enter the email you used when you created your portrait to retrieve downloads, previews within 48 hours, and portrait pack credits.",
}

export default function MyPortraitsLayout({ children }: { children: React.ReactNode }) {
  return children
}
