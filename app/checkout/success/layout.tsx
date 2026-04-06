import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Portrait Is On Its Way | FluffyFriends",
  description:
    "Your personalised pet portrait has been created and sent to your inbox.",
}

export const dynamic = "force-dynamic"

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
