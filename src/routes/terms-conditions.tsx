import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | The Bridges TN" },
      {
        name: "description",
        content:
          "Terms & Conditions for The Bridges in Waynesboro, Tennessee — reservations, cancellations, and website use.",
      },
      { property: "og:title", content: "Terms & Conditions | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Terms & Conditions for The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-16 lg:py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block mb-3">
            LEGAL
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1a231c] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-stone-500 text-sm mt-3">Last updated: October 30, 2026</p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm sm:text-base text-stone-700 leading-relaxed">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using this website, you agree to be bound by these Terms &amp;
                Conditions and our Privacy Policy. If you do not agree, please do not use our
                website.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                2. Reservations &amp; Bookings
              </h2>
              <p>
                Reservation requests are subject to availability and confirmation by The Bridges. A
                reservation is not confirmed until you receive written confirmation from us. Pricing,
                availability, and offers are subject to change without notice. Any displayed rates do
                not include all taxes and fees unless expressly stated.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                3. Payments
              </h2>
              <p>
                Payments are processed through our secure third-party payment provider. Approved
                payment methods and any deposit or balance schedule will be communicated at the time
                of booking. We reserve the right to decline or cancel a reservation if a payment is
                declined or suspected to be fraudulent.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                4. Cancellations &amp; Refunds
              </h2>
              <p>
                Cancellation and refund policies vary by reservation type and will be provided at the
                time of booking. Applicable cancellation terms must be agreed to before a reservation
                is confirmed. Please review the specific policy provided for your reservation.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                5. Check-In &amp; Check-Out
              </h2>
              <p>
                Check-in and check-out times will be communicated with your reservation
                confirmation. Guests are responsible for following posted property rules and
                instructions during their stay.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                6. Guest Conduct &amp; Liability
              </h2>
              <p>
                Guests are responsible for their own safety and the safety of others while on the
                property. The Bridges is not liable for personal injury, loss, or damage to personal
                property. Guests may be held responsible for damage to property caused during their
                stay.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                7. Website Content
              </h2>
              <p>
                All content on this website is provided for general informational purposes. We strive
                for accuracy but do not warrant that all information is complete, current, or
                error-free. Images are representative and may not reflect exact accommodations.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                8. Intellectual Property
              </h2>
              <p>
                All website content, including text, images, logos, and design, is the property of
                The Bridges or its licensors and may not be reproduced without permission.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                9. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites, such as booking platforms. We
                are not responsible for the content or practices of those websites.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                10. Changes to Terms
              </h2>
              <p>
                We may update these Terms &amp; Conditions at any time. Continued use of the website
                after changes constitutes acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">11. Contact Us</h2>
              <p>For questions about these Terms &amp; Conditions, please contact us:</p>
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
