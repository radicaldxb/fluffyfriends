import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy | FluffyFriends",
  description: "FluffyFriends privacy policy and data handling.",
}

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This Privacy Policy explains how we collect, use, and protect your information when you use
            FluffyFriends.online.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Effective Date: 12 March 2026
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              1. Introduction
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              FluffyFriends.online is operated by Radical Thinking Web Design L.L.C
              (&quot;Radical Thinking&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). This Privacy Policy describes how we handle your personal
              data when you use our AI-powered pet portrait Service. By using the Service, you agree to the
              practices described in this Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              2. Data We Collect
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We collect and process the following types of information:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium">Contact information:</span> your email address and, if provided, your name.
              </li>
              <li>
                <span className="font-medium">Pet information:</span> your pet&apos;s name and the theme you select.
              </li>
              <li>
                <span className="font-medium">Pet photographs:</span> the image files you upload in supported formats.
              </li>
              <li>
                <span className="font-medium">Payment information:</span> payment is processed by Stripe; we receive
                payment status and references (such as payment intent IDs) but do not store full card details.
              </li>
              <li>
                <span className="font-medium">Usage information:</span> basic technical data such as IP address,
                device/browser information, and interactions with our website, used for security and service
                improvement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              3. How We Use Your Data
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use your information to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Provide and operate the FluffyFriends Service.</li>
              <li>Generate and deliver your pet portraits.</li>
              <li>Process payments and manage orders.</li>
              <li>Handle remake requests, support queries, and order lookups.</li>
              <li>Improve and protect our website and services.</li>
              <li>Send transactional emails related to your orders and account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              4. Pet Photographs
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your uploaded pet photos are stored in Supabase object storage and delivered via our image
              delivery infrastructure (such as Cloudinary or similar services) to generate and serve your
              portraits. We retain your photos for up to 90 days to support remake requests and customer
              support.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We never use your photos to train AI models, and we do not sell or share your pet photos with
              third parties for marketing or profiling purposes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              5. Generated Portraits
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Generated portraits are stored so that we can deliver them to you, support remakes, and, where
              you have given consent, showcase them on our website or social channels. Storage may be provided
              via services such as Cloudinary or similar image delivery platforms.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Showcase consent is optional and can be withdrawn at any time by contacting us at
              hello@fluffyfriends.online. If you withdraw consent, we will stop using your portraits in future
              materials and remove them from our own channels where reasonably practical.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              6. Third-Party Services
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We rely on trusted third-party providers to operate the Service, including:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium">Stripe:</span> for secure payment processing.
              </li>
              <li>
                <span className="font-medium">Supabase:</span> for database and file storage.
              </li>
              <li>
                <span className="font-medium">Cloudinary (or similar):</span> for image delivery and optimisation.
              </li>
              <li>
                <span className="font-medium">Google Gemini (or similar AI providers):</span> to generate AI-powered
                portraits and related outputs.
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              These providers process data on our behalf in accordance with their own terms and privacy
              policies, and we take reasonable steps to ensure they maintain appropriate security measures.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              7. Data Retention
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We retain your personal data only for as long as necessary to provide the Service, meet legal or
              accounting obligations, resolve disputes, and enforce our agreements. Pet photos are generally
              kept for up to 90 days to support remakes and support queries, unless a longer retention period
              is required by law or explicitly agreed with you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              8. Your Rights
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Depending on your location, you may have rights over your personal data, such as the right to
              access, correct, or delete your information, or to object to or restrict certain processing.
              To exercise these rights, please contact us at hello@fluffyfriends.online. We may need to verify
              your identity before responding to your request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              9. Cookies
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use cookies and similar technologies where necessary to operate the website, maintain security,
              remember preferences, and keep you signed in where applicable. We also allow analytics and measurement
              partners (described in Section 15) to use cookies or similar technologies so we can understand
              traffic, improve the site, and measure advertising performance. You can control cookies through your
              browser settings; blocking some cookies may affect how certain features work.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              10. Children&apos;s Privacy
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The Service is not directed at children under the age of 13, and we do not knowingly collect
              personal data from children under 13. If you believe a child has provided us with personal
              information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              11. Data Security
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We implement reasonable technical and organisational measures to protect your data against
              unauthorised access, loss, misuse, or alteration. However, no method of transmission or storage
              is completely secure, and we cannot guarantee absolute security of your information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              12. Governing Law
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This Privacy Policy and any disputes arising from it are governed by the laws of the United Arab
              Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai,
              UAE.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              13. Changes to This Policy
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time to reflect changes in our Service, legal
              obligations, or data practices. When we make material changes, we will update the &quot;Effective
              Date&quot; at the top of this page. Your continued use of the Service after changes take effect
              constitutes your acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              14. Contact
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy or how we handle your data, please contact
              us at:
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              hello@fluffyfriends.online
              <br />
              Operated by: Radical Thinking Web Design L.L.C
              <br />
              DET Commercial License No. 714580 — Licensed since 2014
              <br />
              www.radical-thinking.net
              <br />
              Dubai, United Arab Emirates
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              15. Analytics and measurement
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use analytics and measurement tools to understand how visitors use FluffyFriends.online and to
              improve our product and marketing. Depending on how you interact with the site, these tools may
              process technical information such as pages viewed, approximate location, device and browser type,
              referring URLs, and events such as purchases or funnel steps. They may use cookies, pixels, or similar
              technologies. Where required by law, advertising or analytics consent may be handled through our
              cookie or consent tooling on the site.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Microsoft Clarity:</span> We partner with Microsoft
              Clarity to capture behavioural metrics, heatmaps, and session replays that help us improve the
              experience. For more information, see the{" "}
              <a
                href="https://www.microsoft.com/privacy/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-foreground"
              >
                Microsoft Privacy Statement
              </a>
              .
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Google Analytics 4 (GA4):</span> We use Google Analytics
              to collect aggregated statistics about how our website is used. Google processes this information in
              accordance with Google&apos;s Privacy Policy. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-foreground"
              >
                Google Privacy Policy
              </a>{" "}
              for details.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Meta Pixel:</span> We use the Meta Pixel (Facebook Pixel)
              to measure visits and conversions from our ads and to improve how we advertise on Meta platforms. Meta
              may process information about your activity on our site in accordance with Meta&apos;s Data Policy.
              See{" "}
              <a
                href="https://www.facebook.com/privacy/policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-foreground"
              >
                Meta Data Policy
              </a>
              .
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We use these tools for analytics, site optimisation, and (where relevant) measuring advertising
              performance. We do not sell your personal information to unrelated third parties for their own
              marketing lists. Third parties operate under their own policies and terms.
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}

