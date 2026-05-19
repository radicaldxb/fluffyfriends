import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Portrait is Waiting | FluffyFriends",
  description:
    "Enter the email you used when you created your portrait. See saved previews, downloads, and portrait pack credits.",
}

export default function MyPortraitsLayout({ children }: { children: React.ReactNode }) {
  return children
}
