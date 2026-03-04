import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Make My Portrait | FluffyFriends",
  description:
    "Create a personalised, print-ready portrait of your pet. Choose a style, upload one photo, and get your portrait in minutes. From $17, one-time. No subscription.",
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
