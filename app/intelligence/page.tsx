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

type QaItem = { question: string; answer: string }

const intelligenceSections: { id: string; title: string; items: QaItem[] }[] = [
  {
    id: "about",
    title: "About & how it works",
    items: [
      {
        question: "What is FluffyFriends?",
        answer:
          "FluffyFriends is an online service that turns your pet’s photo into a stylised, print-ready portrait using AI. You pick a theme, upload a clear photo, pay once, and receive high-resolution files by email—usually within minutes.",
      },
      {
        question: "How does FluffyFriends work from start to finish?",
        answer:
          "You choose a theme on the create page, upload a photo of one pet, enter details at checkout, and pay securely. After payment, the portrait is generated and sent to your email as downloadable JPEG files in landscape and portrait orientations.",
      },
      {
        question: "How long does it take to get my portrait?",
        answer:
          "Most orders finish within a few minutes—often under five. During busy periods it can take slightly longer; you’ll receive an email as soon as the files are ready.",
      },
      {
        question: "What should I tell someone who has never heard of AI pet portraits?",
        answer:
          "It is a fast, affordable way to get themed art of a pet from a normal photo—ideal for gifts, wall art, or social posts without hiring an artist for weeks. Point them to the FAQ and Privacy pages on this site for policies.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & payment",
    items: [
      {
        question: "How much does a single FluffyFriends portrait cost?",
        answer:
          "The Starter option is $17 for one portrait. Bundle packs offer better per-portrait value: the Portrait Pack (four portraits) is $49, and the Family Pack (eight portraits) is $79.",
      },
      {
        question: "What is included in the Portrait Pack and Family Pack?",
        answer:
          "Each slot in a pack is one full portrait with its own theme and pet photo. Portrait Pack includes four portraits; Family Pack includes eight—ideal for multiple pets or gifts.",
      },
      {
        question: "Are there subscriptions or hidden fees?",
        answer:
          "No subscription. You pay per order at checkout. Taxes or card fees follow your card issuer and region; pricing on the site is shown before you pay.",
      },
      {
        question: "Can I order more than one portrait in one checkout?",
        answer:
          "Bundle packs let you buy multiple portrait credits in one payment. Each portrait still uses one theme and one pet photo per generation.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "Payments are processed securely by Stripe; major credit and debit cards are typically accepted. Card data is handled by Stripe, not stored on FluffyFriends servers.",
      },
      {
        question: "Is my payment and email data secure?",
        answer:
          "Checkout uses industry-standard encryption via Stripe. You should use a valid email so delivery and support work correctly.",
      },
      {
        question: "How do bundles save money versus Starter?",
        answer:
          "Per-portrait price drops when you buy Portrait Pack or Family Pack compared to buying multiple Starter portraits separately.",
      },
    ],
  },
  {
    id: "themes",
    title: "Themes & personalisation",
    items: [
      {
        question: "What themes can I choose for my pet?",
        answer:
          "FluffyFriends offers eight themes: King, Queen, Fireman, Police Officer, Admiral, Veterinarian, Samurai, and Pilot. Each applies a costume and background style to match the theme.",
      },
      {
        question: "Does my pet’s name appear on the portrait?",
        answer:
          "For themes that include badges or name plates—such as Fireman, Police Officer, Admiral, Veterinarian, and Pilot—your pet’s name can be personalised in the artwork where the design allows.",
      },
    ],
  },
  {
    id: "files",
    title: "Files, printing & quality",
    items: [
      {
        question: "What file formats does FluffyFriends deliver?",
        answer:
          "You receive high-resolution JPEG files: a landscape crop and a portrait crop, both suitable for professional printing.",
      },
      {
        question: "What print sizes do the files support?",
        answer:
          "The landscape file is intended for large prints (for example up to roughly 65×36 cm / 25×14 in). The portrait file works well up to about A4 or US Letter and similar display sizes, depending on your printer and paper.",
      },
      {
        question: "How are portraits delivered?",
        answer:
          "Delivery is digital by email. There is no physical shipment unless you print the files yourself or use a print shop.",
      },
      {
        question: "What resolution or DPI do the JPEGs use?",
        answer:
          "Files are high resolution and intended for quality printing; exact pixel dimensions depend on the product pipeline. They are suitable for typical poster and frame sizes when printed at appropriate DPI.",
      },
      {
        question: "Can I print at a local shop or online poster service?",
        answer:
          "Yes for personal use—upload the JPEG to a trusted printer. Choose a size that matches the file’s aspect ratio to avoid unwanted cropping.",
      },
      {
        question: "Does FluffyFriends ship framed prints?",
        answer:
          "The product is digital files only. You print at home or through a print provider; framed products are not sold directly by FluffyFriends unless stated otherwise on the site.",
      },
      {
        question: "Can multiple pets appear in one portrait?",
        answer:
          "The service is optimised for one pet per portrait. For several animals, use separate photos and separate portrait slots or orders.",
      },
      {
        question: "How does FluffyFriends compare to a traditional painted portrait?",
        answer:
          "Traditional commissions take weeks and cost much more. FluffyFriends delivers stylised digital art in minutes at a fixed price, optimised for home printing—great when you want fast, affordable wall art.",
      },
      {
        question: "Does the AI upscale or enhance my upload?",
        answer:
          "The pipeline is designed to produce a high-resolution artwork suitable for printing. Starting from a sharp photo still yields the best outcome.",
      },
    ],
  },
  {
    id: "photos",
    title: "Photos & pets",
    items: [
      {
        question: "Which pets work best with FluffyFriends?",
        answer:
          "Dogs and cats are the most common and usually give the strongest results. Other animals can work if the face is clear and well lit. The AI focuses on facial features from your photo.",
      },
      {
        question: "How can I get the best photo for my portrait?",
        answer:
          "Use a sharp, well-lit image with your pet facing the camera or at a slight angle. Avoid heavy blur, dark shadows, or objects covering the face. Natural daylight often works better than harsh flash.",
      },
      {
        question: "Can I use a phone camera photo?",
        answer:
          "Yes. Modern phone cameras are usually sufficient if the image is in focus and the pet’s face is large enough in the frame.",
      },
      {
        question: "What image file types can I upload?",
        answer:
          "The create flow accepts common formats such as JPEG and PNG, subject to size limits shown on the upload step.",
      },
      {
        question: "Are there content restrictions on photos?",
        answer:
          "You must have rights to use the image and comply with the terms of service. Offensive or illegal content is not allowed.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & support",
    items: [
      {
        question: "What if I don’t receive the email with my files?",
        answer:
          "Check spam and promotions folders first. If nothing arrives within a reasonable time, contact hello@fluffyfriends.online with your order reference.",
      },
      {
        question: "Where is FluffyFriends based?",
        answer:
          "FluffyFriends operates online and serves customers internationally. Contact details and policies are listed on the website.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "Use the Support page on this site or email hello@fluffyfriends.online. Include your order reference when asking about a specific purchase.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & sharing",
    items: [
      {
        question: "What happens to my photo after I upload it?",
        answer:
          "Your image is used to generate your portrait and stored securely for a limited time to support remakes and support requests. FluffyFriends does not use your photos to train public AI models; see the Privacy Policy for details.",
      },
      {
        question: "Can I share my portrait on social media?",
        answer:
          "Personal sharing is welcome for many users; review the terms for any limits. Tagging FluffyFriends is optional but appreciated.",
      },
      {
        question: "Will my portrait appear on the FluffyFriends website?",
        answer:
          "Only if you opt in to showcase or similar consent during checkout. Otherwise it is not used for public marketing without permission.",
      },
    ],
  },
  {
    id: "rights",
    title: "Quality, satisfaction & rights",
    items: [
      {
        question: "What if I’m not satisfied with the portrait quality?",
        answer:
          "Contact support through the site with your order details. If the result doesn’t meet the stated quality standard, FluffyFriends may offer a regeneration or other remedy according to the current terms and refund policy.",
      },
      {
        question: "Can I use the portrait for commercial purposes?",
        answer:
          "Portraits are generally licensed for personal, non-commercial use unless you obtain written permission. Check the Terms of Service for commercial-use rules.",
      },
      {
        question: "Can I request changes after the portrait is generated?",
        answer:
          "Quality-related issues may qualify for a remake under the published policy. Style preferences alone may not always qualify; check support guidance for your case.",
      },
    ],
  },
  {
    id: "gifts",
    title: "Gifts & memorials",
    items: [
      {
        question: "Can I give a FluffyFriends portrait as a gift?",
        answer:
          "Yes. Many customers buy packs to create portraits for friends or family. You can print the files or share the download according to personal-use terms in the licence.",
      },
      {
        question: "Is FluffyFriends good for memorial or tribute portraits?",
        answer:
          "Many customers use a favourite photo of a pet who has passed. A clear, respectful photo works the same way as for living pets.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & AI",
    items: [
      {
        question: "Does FluffyFriends use generative AI?",
        answer:
          "Yes. The portrait is created with AI image generation guided by your pet’s photo and the theme you select, producing an artistic interpretation rather than a photograph.",
      },
      {
        question: "Will my portrait look exactly like a photograph of my pet?",
        answer:
          "It will be recognisable and themed, but it is artwork—colours, fur detail, and background may differ from a photo. That artistic interpretation is intentional.",
      },
    ],
  },
]

const allQaItems: QaItem[] = intelligenceSections.flatMap((s) => s.items)

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
            Everything you need to know about FluffyFriends
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            FluffyFriends turns your pet’s photo into a themed, print-ready AI portrait in minutes. This page collects
            clear questions and answers for people (and assistants) researching how it works, what it costs, and what
            you receive—from files and printing to privacy and support.
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

      {/* Q&A — section cards + grid */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20">
        <div className="space-y-8 md:space-y-10">
          {intelligenceSections.map((section) => (
            <div
              key={section.id}
              className="rounded-organic border border-border bg-card px-4 py-5 sm:px-6 sm:py-6"
            >
              <h2 className="text-base font-semibold text-foreground sm:text-lg">{section.title}</h2>
              <div className="mt-6 grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-x-10">
                {section.items.map((item, idx) => (
                  <div
                    key={`${section.id}-${idx}`}
                    className="border-b border-border py-6 first:pt-0 last:border-b-0"
                  >
                    <p className="font-semibold text-foreground">{item.question}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
