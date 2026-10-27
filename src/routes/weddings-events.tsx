import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { listVenueRateCardsFn } from "@/lib/booking/seasonal.functions";
import {
  Building,
  CheckCircle2,
  Users,
  Compass,
  Phone,
  ArrowRight,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/weddings-events")({
  head: () => ({
    meta: [
      { title: "The Willows Event Center | Weddings & Retreats | The Bridges TN" },
      {
        name: "description",
        content:
          "Host your wedding, reception, corporate retreat, or special gathering at The Willows, the premiere on-site event venue at The Bridges in Waynesboro, TN. Venue rental pricing and restaurant space rental available.",
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

function fmtMoney(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function WillowsPage() {
  const listCards = useServerFn(listVenueRateCardsFn);
  const { data: cards } = useQuery({ queryKey: ["venue-rate-cards"], queryFn: listCards });

  const willows = (cards ?? []).find((c) => c.code === "willows-rental");
  const restaurant = (cards ?? []).find((c) => c.code === "restaurant-space-rental");

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
                  Inquire About The Willows
                </Link>
                <a
                  href="tel:+19317225589"
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 931-722-5589</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-80 sm:h-96">
                <img
                  src="https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_The-Willows-Event-Space_Wayne-County-39-1024x683.jpg"
                  alt="The Willows Event Space"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Willows Venue Pricing */}
      {willows && (
        <section className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
                VENUE RENTAL PRICING
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
                {willows.label}
              </h2>
              {willows.description && (
                <p className="text-sm text-stone-600 mt-2 max-w-2xl">{willows.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#faf8f5] rounded-3xl border border-stone-200 p-8 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-[#3e5340] mb-3">
                  {willows.weekday_label}
                </div>
                <div className="font-serif text-4xl font-bold text-stone-900">
                  {fmtMoney(willows.weekday_rate_cents)}
                </div>
                <div className="text-sm text-stone-500 mt-1">
                  for {willows.duration_hours} hours
                </div>
              </div>
              <div className="bg-[#2a382c] text-white rounded-3xl p-8 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-[#bfd8b8] mb-3">
                  {willows.weekend_label}
                </div>
                <div className="font-serif text-4xl font-bold text-white">
                  {fmtMoney(willows.weekend_rate_cents)}
                </div>
                <div className="text-sm text-white/60 mt-1">for {willows.duration_hours} hours</div>
              </div>
            </div>

            {/* Includes */}
            {willows.includes && willows.includes.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {willows.includes.map((inc) => (
                  <span
                    key={inc}
                    className="inline-flex items-center gap-1.5 bg-[#2a382c]/5 text-[#2a382c] text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {inc}
                  </span>
                ))}
              </div>
            )}

            {/* Catering Offer */}
            {willows.catering_offer_note && (
              <div className="bg-[#f4eee6] border border-[#3e5340]/20 rounded-3xl p-6 sm:p-8 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#3e5340]/15 text-[#3e5340] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Catering Offer for Weekend Gatherings
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {willows.catering_offer_note}
                    </p>
                    <p className="text-xs text-stone-500">
                      The catering offer reduces the weekend venue rental from{" "}
                      {fmtMoney(willows.weekend_rate_cents)} to{" "}
                      {fmtMoney(willows.catering_weekday_rate_cents ?? willows.weekday_rate_cents)}.
                      Catering is an additional charge and is not included free.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wedding exclusion */}
            {willows.excludes_weddings && (
              <div className="bg-[#faf8f5] border border-stone-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Compass className="w-5 h-5 text-[#2a382c] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700">
                  <span className="font-semibold text-stone-900">Wedding exclusion:</span> These
                  published venue rental rates do not apply to weddings.{" "}
                  <Link to="/contact-us" className="font-semibold text-[#2a382c] underline">
                    Contact us for wedding pricing
                  </Link>
                  .
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Inquire About The Willows</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Restaurant Space Rental */}
      {restaurant && (
        <section className="py-16 bg-[#faf8f5] border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block">
                  SEPARATE RENTAL OPTION
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {restaurant.label}
                </h2>
                {restaurant.description && (
                  <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
                    {restaurant.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="bg-white rounded-2xl border border-stone-200 px-6 py-4 text-center">
                    <div className="font-serif text-2xl font-bold text-stone-900">
                      {fmtMoney(restaurant.weekday_rate_cents)}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      for {restaurant.duration_hours} hours
                    </div>
                  </div>
                  {restaurant.max_guests && (
                    <div className="bg-white rounded-2xl border border-stone-200 px-6 py-4 text-center">
                      <div className="font-serif text-2xl font-bold text-stone-900">
                        Up to {restaurant.max_guests}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">people</div>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Link
                    to="/contact-us"
                    className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <span>Inquire About Restaurant Space</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-3xl overflow-hidden border border-stone-200 h-64 sm:h-72 relative group">
                  <img
                    src="https://thebridgestn.com/wp-content/uploads/2026/05/facilities27-min.jpg"
                    alt="Restaurant space available for private rental at The Bridges"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-5">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-stone-900 tracking-wide shadow-md">
                      Up to 75 people
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Amenities */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              VENUE FEATURES
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Everything you need to gather well
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
