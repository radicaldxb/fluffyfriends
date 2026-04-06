import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service | FluffyFriends",
  description: "FluffyFriends terms of service.",
}

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please read these Terms of Service carefully before using FluffyFriends.online.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Effective Date: 12 March 2026
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              By accessing or using FluffyFriends.online (the &quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              2. Service Description
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              FluffyFriends is an AI-powered pet portrait service that allows you to upload a photo of your
              pet, choose a theme, and receive an AI-generated digital artwork. The Service is provided
              on a best-effort basis and may evolve over time as we improve our products and workflows.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              3. AI-Generated Content Disclaimer
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              FluffyFriends uses artificial intelligence models and automated systems to generate portraits.
              By using the Service, you acknowledge and agree that:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>AI outputs may vary between generations even when using the same photo and theme.</li>
              <li>Portraits are artistic interpretations, not photographic reproductions.</li>
              <li>We cannot guarantee a perfect likeness of your pet in every case.</li>
              <li>Minor artefacts, style variations, or differences in colour, pose, or expression are expected.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              4. Orders and Payment
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Orders are placed through our website and processed securely by Stripe. Prices, available themes,
              and bundle options are displayed at checkout. By submitting an order, you authorise us and our
              payment processor to charge the payment method you provide for the total amount shown, including
              any applicable taxes or fees.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              5. Remake Policy
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you are not satisfied with the quality of your portrait, you may request a remake within
              14 days of delivery by contacting us at hello@fluffyfriends.online. Each portrait is eligible
              for one free regeneration. After a remake has been delivered, additional regenerations may be
              offered at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              6. Refund Policy
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Due to the bespoke nature of AI-generated artwork, we generally do not offer refunds once
              generation has started. If, after a remake, we are still unable to deliver a portrait that
              meets a reasonable quality standard, we may issue a refund or credit at our discretion. Nothing
              in these Terms affects any mandatory consumer rights that may apply under the law of your
              jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              7. Acceptable Use
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You may not use the Service to upload or generate content that is unlawful, harmful, abusive,
              harassing, defamatory, hateful, or otherwise objectionable. You agree not to upload photos
              that you do not have the right to use, including photos owned by third parties without their
              permission. We reserve the right to refuse or cancel any order that violates these standards.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              8. Showcase Consent
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              During checkout, you may be asked whether you consent to us showcasing your portraits on our
              website, social media, or marketing materials. Granting showcase consent is entirely optional
              and does not affect your ability to use the Service. You can withdraw showcase consent at any
              time by contacting us at hello@fluffyfriends.online; we will then stop using your portraits in
              future materials and remove them from our own channels where reasonably practical.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              9. Intellectual Property
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subject to your compliance with these Terms and payment of all applicable fees, you are granted
              a personal, non-exclusive, non-transferable, non-sublicensable licence to use, download, and
              print the portraits we generate for you for your own personal, non-commercial purposes.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Radical Thinking Web Design L.L.C and its licensors retain all rights, title, and interest in
              and to the Service, including but not limited to prompts, workflows, systems, website designs,
              and underlying infrastructure. We make no claim of ownership over any third-party AI models or
              platforms used to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              10. Limitation of Liability
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To the maximum extent permitted by law, the Service is provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind, whether express or implied. FluffyFriends and Radical Thinking
              Web Design L.L.C shall not be liable for any indirect, incidental, consequential, special, or
              punitive damages arising out of or in connection with your use of the Service, even if advised
              of the possibility of such damages. Our total aggregate liability for any claim arising under
              these Terms shall not exceed the total amount you paid for the specific order giving rise to the
              claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              11. Governing Law
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These Terms are governed by the laws of the United Arab Emirates. Any disputes arising out of
              or in connection with these Terms or the Service shall be subject to the exclusive jurisdiction
              of the courts of Dubai, UAE.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              12. Changes to Terms
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We may update these Terms from time to time to reflect changes in our Service, legal
              requirements, or business practices. When we make material changes, we will update the
              &quot;Effective Date&quot; at the top of this page. Your continued use of the Service after any
              changes become effective constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              13. Contact
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you have any questions about these Terms, please contact us at:
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
        </div>
      </section>
      <Footer />
    </main>
  )
}

