import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  Building,
  CheckCircle2,
  Users,
  Compass,
  Phone,
  ArrowRight,
  ExternalLink,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/weddings-events")({
  head: () => ({
    meta: [
      { title: "The Willows Event Center | Weddings & Retreats | The Bridges TN" },
      {
        name: "description",
        content:
          "Host your wedding, reception, corporate retreat, or special gathering at The Willows, the premiere on-site event venue at The Bridges in Waynesboro, TN.",
      },
      { property: "og:title", content: "The Willows Event Center | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Premiere venue for weddings, receptions, and group retreats in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: WillowsPage,
});

function WillowsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
                THE WILLOWS EVENT CENTER
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
                Celebrate well in a setting unlike any other.
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                The Willows is our dedicated on-site event venue, offering timber craftsmanship,
                peaceful outdoor views, modern comforts, and seamless access to on-site lodging and
                amenities.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/contact-us"
                  className="bg-[#2a382c] hover:bg-[#1f2b21] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Start Planning
                </Link>
                <a
                  href="tel:+19317225589"
                  className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 931-722-5589</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-[420px]">
                <img
                  src="https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_The-Willows-Event-Space_Wayne-County-39-1024x683.jpg"
                  alt="The Willows Event Venue Exterior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
              WHY CHOOSE THE WILLOWS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              A Complete Venue For Your Big Moments
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Everything in one scenic destination so your family, wedding party, or team can relax
              and stay close.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">Spacious Indoor Hall</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Beautiful exposed timber beams, ambient lighting, climate control, and flexible
                seating layouts for receptions, banquets, and presentations.
              </p>
            </div>
            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">Event Kitchen Support</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Facilities to support caterers, meal prep, buffet staging, and dining service for
                your event attendees.
              </p>
            </div>
            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Overnight Accommodations
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                33 places to stay on the property, from guest rooms to cabins and full-hookup RV
                sites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking 2027 CTA */}
      <section className="py-20 bg-[#243327] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#bfd8b8]">
            NOW BOOKING 2027
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Plan your 2027 wedding or gathering with us.
          </h2>
          <p className="text-stone-200 text-sm sm:text-base max-w-xl mx-auto font-light">
            Contact us today for availability, venue pricing packages, and to book a private tour of
            The Willows and the surrounding grounds.
          </p>
          <div className="pt-2">
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 bg-[#ece7df] hover:bg-white text-[#202c23] font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Contact Events Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
