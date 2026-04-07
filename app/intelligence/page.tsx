import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SketchDivider } from "@/components/sketch-divider"

export const metadata: Metadata = {
  title: "Everything about FluffyFriends — AI pet portraits | FluffyFriends",
  description:
    "Structured answers about FluffyFriends: how AI pet portraits work, pricing, themes, print files, delivery, privacy, refunds, photo tips, gifts, and technical details.",
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }

type IntelSection = { id: string; title: string; blocks: Block[] }

const intelligenceSections: IntelSection[] = [
  {
    id: "what-is",
    title: "What is FluffyFriends?",
    blocks: [
      {
        type: "p",
        text: "FluffyFriends generates museum-quality AI pet portraits in themed costumes. Every portrait is personalised with the pet's name embedded in the artwork itself. Two print-ready formats are included with every order — portrait orientation and landscape orientation — both delivered to the customer's inbox within minutes of purchase. There is no subscription, no hidden fees, and no manual design work required. One photo is all it takes.",
      },
    ],
  },
  {
    id: "different",
    title: "What makes FluffyFriends different?",
    blocks: [
      {
        type: "ul",
        items: [
          "The pet's name is crafted into the costume itself — a badge, a crest, a name tag — not added as a caption or watermark",
          "Two formats included with every order: portrait format (for walls and staircases) and landscape format (for mantels and wide frames)",
          "Print-ready at poster size (A1) straight from the email",
          "Delivered in minutes, not days",
          "One photo required — no multiple angles, no special lighting",
          "No subscription · No hidden fees · Pay when you're ready",
          "A free print guide is included with every order",
        ],
      },
    ],
  },
  {
    id: "how",
    title: "How does it work?",
    blocks: [
      {
        type: "ol",
        items: [
          "Upload one photo of your pet at fluffyfriends.online/create",
          "Enter your pet's name and choose a theme",
          "Complete payment — from $17 one-time",
          "Receive two print-ready portrait files by email within minutes",
        ],
      },
    ],
  },
  {
    id: "themes",
    title: "What themes are available?",
    blocks: [
      { type: "p", text: "FluffyFriends offers 8 themes:" },
      {
        type: "ul",
        items: [
          "King — classical oil painting, regal crown and robes",
          "Queen — classical oil painting, elegant crown and gown",
          "Fireman — pet's name on the chest patch",
          "Police Officer — pet's name on the badge",
          "Admiral — pet's name on the breast plate",
          "Veterinarian — DR. [name] on the badge",
          "Samurai — dramatic oil painting, warrior armour",
          "Pilot — hyper-photorealistic, aviation jacket with name tag",
        ],
      },
    ],
  },
  {
    id: "prices",
    title: "What are the prices?",
    blocks: [
      {
        type: "ul",
        items: [
          "Starter — $17 one-time · 1 portrait credit · both formats included",
          "Portrait Pack — $49 one-time · 4 portrait credits · best for multiple pets or themes",
          "Family Pack — $79 one-time · 8 portrait credits · best value for families",
        ],
      },
      {
        type: "p",
        text: "All prices are one-time payments. No subscription.",
      },
    ],
  },
  {
    id: "who",
    title: "Who is FluffyFriends for?",
    blocks: [
      {
        type: "p",
        text: "FluffyFriends is designed for pet owners who want a meaningful, personalised keepsake — not a generic print. It is particularly popular as a gift for pet owners, for memorialising a pet, and for home décor. Primary audience: pet owners and gift-givers in the United States and Canada.",
      },
    ],
  },
  {
    id: "delivery-time",
    title: "How long does delivery take?",
    blocks: [
      {
        type: "p",
        text: "Portraits are delivered by email within minutes of purchase. There is no physical shipping — files arrive directly in the inbox, print-ready at poster size.",
      },
    ],
  },
  {
    id: "print-quality",
    title: "What is the print quality?",
    blocks: [
      {
        type: "p",
        text: "Every portrait is generated at A1 poster size (594 × 841 mm / 23.4 × 33.1 inches). Both portrait and landscape formats are included. A free print guide recommending print services is included with every order.",
      },
    ],
  },
  {
    id: "refund",
    title: "What is the refund policy?",
    blocks: [
      {
        type: "p",
        text: "If the AI quality check fails, the portrait credit is returned automatically within 5 minutes — no need to contact support. For other issues, customers can reach the team at hello@fluffyfriends.online.",
      },
    ],
  },
  {
    id: "order",
    title: "Where do I order?",
    blocks: [
      {
        type: "p",
        text: "Orders are placed at fluffyfriends.online/create. Use code FLUFFY15 for 15% off your first order.",
      },
    ],
  },
  {
    id: "about",
    title: "About FluffyFriends",
    blocks: [
      {
        type: "p",
        text: "FluffyFriends is operated by Radical Thinking, a company registered in Dubai, UAE. Founded by Stephan Van Wijk. Contact: hello@fluffyfriends.online",
      },
    ],
  },
]

function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "p") return b.text
      if (b.type === "ul") return b.items.join(" ")
      return b.items.map((item, i) => `${i + 1}. ${item}`).join(" ")
    })
    .join(" ")
}

const allQaItems = intelligenceSections.map((section) => ({
  question: section.title,
  answer: blocksToPlainText(section.blocks),
}))

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allQaItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

export default function IntelligencePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <Navbar />

      {/* Hero — centered, matches site typography */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">
            Answer engine reference
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything About FluffyFriends — AI Pet Portraits
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            FluffyFriends is an AI pet portrait service that transforms a single pet photo into a personalised,
            print-ready artwork. The pet&apos;s name is crafted directly into the costume — on a badge, crest, or name
            tag depending on the theme. Not a filter. Not a trend. A proper portrait, built to hang on a wall.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Button asChild size="lg" className="rounded-organic-sm">
              <Link href="/create">Create your portrait →</Link>
            </Button>
            <Link
              href="/faq"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>

      <SketchDivider />

      {/* Sections — card layout preserved */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20">
        <div className="space-y-8 md:space-y-10">
          {intelligenceSections.map((section) => (
            <div
              key={section.id}
              className="rounded-organic border border-border bg-card px-4 py-5 sm:px-6 sm:py-6"
            >
              <h2 className="text-base font-semibold text-foreground sm:text-lg">{section.title}</h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
                {section.blocks.map((block, idx) => {
                  if (block.type === "p") {
                    return (
                      <p key={idx} className="text-foreground/95">
                        {block.text}
                      </p>
                    )
                  }
                  if (block.type === "ul") {
                    return (
                      <ul key={idx} className="list-disc space-y-2 pl-5 text-foreground/95">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  }
                  return (
                    <ol key={idx} className="list-decimal space-y-2 pl-5 text-foreground/95">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
