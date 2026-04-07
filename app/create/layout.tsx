import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Create Your Pet Portrait | FluffyFriends",
  description:
    "Upload one photo of your pet, choose a theme, and receive two print-ready portrait files in minutes. Named and personalised.",
  alternates: {
    canonical: "https://fluffyfriends.online/create",
  },
}

const CREATE_URL = "https://fluffyfriends.online/create"

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "FluffyFriends AI Pet Portrait",
  description:
    "Transform your pet photo into a print-ready AI portrait. Choose from 8 themes including King, Queen, Fireman, Police Officer, Admiral, Veterinarian, Samurai, and Pilot. Delivered as high-resolution landscape and portrait format files.",
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
