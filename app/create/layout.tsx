import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Create Your Pet's Portrait | FluffyFriends",
  description:
    "Upload one photo, pick a theme, and get print-ready landscape and portrait files with their name in the art—delivered in minutes.",
  alternates: {
    canonical: "https://fluffyfriends.online/create",
  },
}

const CREATE_URL = "https://fluffyfriends.online/create"

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "FluffyFriends Personalised Pet Portrait",
  description:
    "Transform your pet photo into a print-ready portrait with their name in the artwork. Choose from 8 themes including King, Queen, Fireman, Police Officer, Admiral, Veterinarian, Samurai, and Pilot. High-resolution landscape and portrait files.",
  brand: {
    "@type": "Brand",
    name: "FluffyFriends",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter Portrait",
      price: "17.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: CREATE_URL,
    },
    {
      "@type": "Offer",
      name: "Portrait Pack — 4 portraits",
      price: "49.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: CREATE_URL,
    },
    {
      "@type": "Offer",
      name: "Family Pack — 8 portraits",
      price: "79.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: CREATE_URL,
    },
  ],
}

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  )
}
