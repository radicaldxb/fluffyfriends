 "use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

const faqs = [
  {
    id: "about-1",
    category: "About FluffyFriends",
    question: "What is FluffyFriends?",
    answer: [
      "FluffyFriends is an AI-powered pet portrait service. You upload a photo of your pet, choose a theme, and we generate a unique, hand-painted-style portrait — delivered to your inbox in under 5 minutes.",
    ],
  },
  {
    id: "about-2",
    category: "About FluffyFriends",
    question: "What kinds of pets can I use?",
    answer: [
      "Any pet with a clear, visible face. Dogs and cats work best. We've also had great results with rabbits and other animals with distinctive facial features. The key is a clear, well-lit photo where your pet's face is fully visible.",
    ],
  },
  {
    id: "about-3",
    category: "About FluffyFriends",
    question: "Is this a real painting or a digital image?",
    answer: [
      "FluffyFriends portraits are AI-generated digital artworks — not hand-painted. They are designed to look like high-quality paintings or illustrations. You receive a high-resolution digital file ready for printing or sharing.",
    ],
  },
  {
    id: "portrait-1",
    category: "The Portrait",
    question: "What themes are available?",
    answer: [
      "At launch we offer six themes: King, Fireman, Police Officer, Sailor, Veterinarian, and Pilot. New themes are added regularly — sign up to our newsletter to be the first to know when new themes drop.",
    ],
  },
  {
    id: "portrait-2",
    category: "The Portrait",
    question: "How long does it take to receive my portrait?",
    answer: [
      "Most portraits are delivered in under 5 minutes. Occasionally during high demand it may take a little longer, but you'll always receive an email as soon as your portrait is ready.",
    ],
  },
  {
    id: "portrait-3",
    category: "The Portrait",
    question: "What resolution is the portrait?",
    answer: [
      "Portraits are delivered at high resolution — suitable for large-format printing up to A2 size. You receive both a landscape and a portrait crop so you can choose the orientation that works best for you.",
    ],
  },
  {
    id: "portrait-4",
    category: "The Portrait",
    question: "Will my portrait look exactly like my pet?",
    answer: [
      "The AI uses your pet's photo as the primary reference and works hard to capture their likeness — their colouring, eye shape, ear structure, and character. That said, AI-generated art is an interpretation, not a photograph. Results are artistic by nature and may vary. If your portrait doesn't meet an acceptable standard, we'll regenerate it for free.",
    ],
  },
  {
    id: "portrait-5",
    category: "The Portrait",
    question: "Can I include my pet's name in the portrait?",
    answer: [
      "Yes — for supported themes, your pet's name is incorporated directly into the artwork. For example, the Fireman theme includes a personalised name badge, and the Police theme features your pet's name on their badge.",
    ],
  },
  {
    id: "portrait-6",
    category: "The Portrait",
    question: "Can I order portraits for multiple pets?",
    answer: [
      "Yes. Our bundle packages let you order multiple portraits in one purchase — ideal for households with more than one pet, or as gifts. Each portrait is generated separately with its own theme.",
    ],
  },
  {
    id: "photo-1",
    category: "Photo Requirements",
    question: "What makes a good photo for the portrait?",
    answer: [
      "The best results come from photos that are: clear and in focus, well-lit (natural light works great), showing your pet's full face from the front or a slight angle, with no obstructions covering the face. Avoid very dark photos, blurry images, or shots where your pet is looking away.",
    ],
  },
  {
    id: "photo-2",
    category: "Photo Requirements",
    question: "Can I use a photo taken on my phone?",
    answer: [
      "Absolutely. Most smartphone cameras produce photos that work perfectly. As long as the image is clear and your pet's face is visible, it will work well.",
    ],
  },
  {
    id: "photo-3",
    category: "Photo Requirements",
    question: "What file formats are accepted?",
    answer: [
      "We accept JPG and PNG files. The maximum file size is 10MB.",
    ],
  },
  {
    id: "photo-4",
    category: "Photo Requirements",
    question: "Can I use a group photo with multiple pets?",
    answer: [
      "Each portrait is designed for one pet at a time. For best results, use a photo where your pet is the main subject. Use our bundle package for multiple pets and upload a separate photo for each.",
    ],
  },
  {
    id: "pricing-1",
    category: "Pricing and Payment",
    question: "How much does a portrait cost?",
    answer: [
      "We offer a single portrait option as well as bundle packages for multiple pets. Prices are displayed at checkout. We occasionally offer promotional discounts — sign up to our newsletter for the latest offers.",
    ],
  },
  {
    id: "pricing-2",
    category: "Pricing and Payment",
    question: "What payment methods do you accept?",
    answer: [
      "We accept all major credit and debit cards, processed securely by Stripe. We do not store your card details.",
    ],
  },
  {
    id: "pricing-3",
    category: "Pricing and Payment",
    question: "Is my payment secure?",
    answer: [
      "Yes. All payments are processed by Stripe. Your card details never pass through our servers. All transactions are encrypted.",
    ],
  },
  {
    id: "pricing-4",
    category: "Pricing and Payment",
    question: "Do you offer refunds?",
    answer: [
      "Due to the bespoke nature of AI-generated art, we don't offer refunds once generation has started. However, if your portrait doesn't meet an acceptable quality standard, we will regenerate it at no extra cost. See our full Refund Policy in the Terms of Service for details.",
    ],
  },
  {
    id: "pricing-5",
    category: "Pricing and Payment",
    question: "What happens if I use a promo code?",
    answer: [
      "Enter your promo code at checkout before completing payment. Discounts are applied automatically. Promo codes cannot be applied after an order is placed.",
    ],
  },
  {
    id: "delivery-1",
    category: "Delivery",
    question: "How do I receive my portrait?",
    answer: [
      "Your portrait is delivered by email to the address you provide at checkout. You'll receive a high-resolution image file ready to download, print, or share.",
    ],
  },
  {
    id: "delivery-2",
    category: "Delivery",
    question: "I haven't received my portrait — what should I do?",
    answer: [
      "First, check your spam or junk folder. If your portrait hasn't arrived within 15 minutes, contact us at hello@fluffyfriends.online with your order details.",
    ],
  },
  {
    id: "delivery-3",
    category: "Delivery",
    question: "Can I download my portrait again after I've received it?",
    answer: [
      "Yes. Your portrait is stored securely and can be re-sent on request. Contact us at hello@fluffyfriends.online with your order reference.",
    ],
  },
  {
    id: "quality-1",
    category: "Quality and Remakes",
    question: "What if I'm not happy with my portrait?",
    answer: [
      "Contact us at hello@fluffyfriends.online within 14 days of receiving it. We'll regenerate it for free.",
    ],
  },
  {
    id: "quality-2",
    category: "Quality and Remakes",
    question: "How many remakes am I entitled to?",
    answer: [
      "One free regeneration per portrait. If after regeneration we still can't deliver a satisfactory result, we'll issue a credit or refund at our discretion.",
    ],
  },
  {
    id: "quality-3",
    category: "Quality and Remakes",
    question: "The AI didn't capture my pet's likeness well. Can I get a refund?",
    answer: [
      "Request a remake first — regenerations often produce a noticeably better result. If we genuinely can't achieve a satisfactory likeness after a remake, we'll work with you on a resolution.",
    ],
  },
  {
    id: "privacy-1",
    category: "Privacy and Your Photos",
    question: "What happens to my pet's photo after I upload it?",
    answer: [
      "Your photo is stored securely and used only to generate your portrait. We retain it for 90 days to support remake requests. We never use your photos to train AI models, and we never share them with third parties.",
    ],
  },
  {
    id: "privacy-2",
    category: "Privacy and Your Photos",
    question: "Will my portrait appear publicly on your website?",
    answer: [
      "Only if you choose to give consent during checkout. Showcase consent is entirely optional. You can withdraw consent at any time by contacting us at hello@fluffyfriends.online.",
    ],
  },
  {
    id: "privacy-3",
    category: "Privacy and Your Photos",
    question: "Who can see my order details?",
    answer: [
      "Only our team. We never sell or share your personal data with third parties for marketing purposes.",
    ],
  },
  {
    id: "usage-1",
    category: "Using Your Portrait",
    question: "Can I print my portrait?",
    answer: [
      "Absolutely. Portraits are delivered at high resolution and suitable for large-format printing. Canvas and framed prints look especially great.",
    ],
  },
  {
    id: "usage-2",
    category: "Using Your Portrait",
    question: "Can I use my portrait commercially?",
    answer: [
      "Personal use is included with every portrait. Commercial use requires prior written permission. Contact us at hello@fluffyfriends.online to discuss.",
    ],
  },
  {
    id: "usage-3",
    category: "Using Your Portrait",
    question: "Can I share my portrait on social media?",
    answer: [
      "Of course — we love seeing FluffyFriends portraits in the wild. Tag us when you share!",
    ],
  },
  {
    id: "contact-1",
    category: "Contact and Support",
    question: "How do I contact FluffyFriends?",
    answer: [
      "Email us at hello@fluffyfriends.online. We aim to respond within 1 business day.",
    ],
  },
  {
    id: "contact-2",
    category: "Contact and Support",
    question: "Where is FluffyFriends based?",
    answer: [
      "We're based in Dubai, UAE, and serve customers worldwide.",
    ],
  },
]

const sections = [
  "About FluffyFriends",
  "The Portrait",
  "Photo Requirements",
  "Pricing and Payment",
  "Delivery",
  "Quality and Remakes",
  "Privacy and Your Photos",
  "Using Your Portrait",
  "Contact and Support",
] as const

export default function FaqPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Help & Support
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Everything you need to know about how FluffyFriends works — from photos and themes
            to delivery, remakes, and privacy.
          </p>
        </header>

        {sections.map((section) => {
          const items = faqs.filter((f) => f.category === section)
          return (
            <div
              key={section}
              className="mb-8 rounded-organic border border-border bg-card px-4 py-3 sm:px-6 sm:py-4"
            >
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                {section}
              </h2>
              <Accordion
                type="single"
                collapsible
                className="mt-2 divide-y divide-border"
              >
                {items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-sm font-medium text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.answer.map((paragraph, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                          {paragraph}
                        </p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )
        })}
      </section>
      <Footer />
    </main>
  )
}

