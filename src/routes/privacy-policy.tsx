import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | The Bridges TN" },
      {
        name: "description",
        content:
          "Privacy Policy for The Bridges in Waynesboro, Tennessee — how we collect, use, and protect your information.",
      },
      { property: "og:title", content: "Privacy Policy | The Bridges TN" },
      {
        property: "og:description",
        content: "Privacy Policy for The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-16 lg:py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block mb-3">
            LEGAL
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1a231c] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-stone-500 text-sm mt-3">Last updated: October 30, 2026</p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-stone max-w-none">
          <div className="space-y-8 text-sm sm:text-base text-stone-700 leading-relaxed">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                1. Information We Collect
              </h2>
              <p>
                The Bridges (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects
                information you provide directly to us, such as your name, email address, phone
                number, and inquiry details when you submit a contact or inquiry form, request a
                reservation, or sign up for event notifications. We may also collect limited
                technical information automatically, such as your browser type and pages visited, to
                improve our website.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To respond to your inquiries and booking requests.</li>
                <li>To send you event notifications you have requested.</li>
                <li>To process reservations and communicate about your stay.</li>
                <li>To improve our website, services, and guest experience.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                3. Payment Information
              </h2>
              <p>
                When you make a payment, it is processed through our secure third-party payment
                provider. We do not collect or store your full credit or debit card details on our
                servers. Payment processing is governed by the provider&apos;s applicable terms and
                privacy policy.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                4. Information Sharing
              </h2>
              <p>
                We do not sell or rent your personal information. We may share information with
                trusted service providers who assist us in operating our website and conducting
                business (such as booking and payment processors), only to the extent necessary, and
                subject to appropriate confidentiality obligations. We may disclose information when
                required by law.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                5. Data Retention
              </h2>
              <p>
                We retain personal information only as long as necessary to fulfill the purposes
                described in this policy, comply with legal obligations, resolve disputes, and
                enforce our agreements.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">6. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal information
                by contacting us using the details below. You may also opt out of marketing or event
                notification emails at any time using the unsubscribe link in those messages.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">7. Security</h2>
              <p>
                We take reasonable measures to protect your personal information using appropriate
                technical and organizational safeguards. However, no method of transmission over the
                internet is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                8. Children&apos;s Privacy
              </h2>
              <p>
                Our website is not directed to children under 13, and we do not knowingly collect
                personal information from children under 13.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this
                page with an updated revision date.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">10. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2a382c] shrink-0" />
                  <span>299 Natural Bridge Park Rd, Waynesboro, TN 38485</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#2a382c] shrink-0" />
                  <a href="tel:+19317225589" className="hover:underline">
                    931-722-5589
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#2a382c] shrink-0" />
                  <a href="mailto:info@thebridgestn.com" className="hover:underline">
                    info@thebridgestn.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200">
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
