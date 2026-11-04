import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { listPropertyEventsFn, listSeasonalOffersFn } from "@/lib/booking/seasonal.functions";
import { generateGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar-export";
import {
  Calendar,
  Sparkles,
  Heart,
  Users,
  ArrowRight,
  Phone,
  Clock,
  Compass,
  Ticket,
  CalendarPlus,
  Gift,
  Snowflake,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/christmas")({
  head: () => ({
    meta: [
      { title: "Book Your Christmas at The Bridges | Waynesboro, TN" },
      {
        name: "description",
        content:
          "Stay the night, celebrate together, and make Christmas memories at The Bridges. Winter lodging specials, December holiday events, and private gatherings in Waynesboro, Tennessee.",
      },
      { property: "og:title", content: "Book Your Christmas at The Bridges" },
      {
        property: "og:description",
        content:
          "Winter lodging specials, December holiday events, and private gatherings at The Bridges in Waynesboro, Tennessee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChristmasPage,
});

function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function fmtDateShort(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function ChristmasPage() {
  const listEvents = useServerFn(listPropertyEventsFn);
  const listOffers = useServerFn(listSeasonalOffersFn);
  const { data: events } = useQuery({ queryKey: ["property-events"], queryFn: listEvents });
  const { data: offers } = useQuery({ queryKey: ["seasonal-offers-public"], queryFn: listOffers });

  const confirmedEvents = (events ?? []).filter((e) => e.is_confirmed && !e.is_tentative);
  const winterOffer = (offers ?? [])[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg"
            alt="The Bridges at Christmas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a231c]/80 via-[#1a231c]/55 to-[#1a231c]/75" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#bfd8b8] bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-5">
            <Snowflake className="w-3.5 h-3.5" /> Christmas 2026 at The Bridges
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
            Book Your Christmas
            <br />
            at The Bridges
          </h1>
          <p className="text-white/90 text-base sm:text-lg leading-relaxed font-light max-w-2xl mx-auto mb-8">
            Stay the night, celebrate together, and make Christmas memories with holiday events,
            winter lodging specials, and private gatherings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#christmas-events"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 text-[#2a382c] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              <Calendar className="w-4 h-4" /> Explore Christmas Events
            </a>
            <a
              href="https://thebridgestn.holidayfuture.com/all-listings"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#657B6A] hover:bg-[#596d5e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-lg border border-white/20"
            >
              <Sparkles className="w-4 h-4" /> Book a Holiday Stay
            </a>
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors border border-white/30 backdrop-blur-sm"
            >
              <Heart className="w-4 h-4" /> Plan a Private Holiday Party
            </Link>
          </div>
        </div>
      </section>

      {/* Three Offers */}
      <section className="py-16 lg:py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OfferCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Weeknight Stays"
              text="From $99 per night, Monday–Thursday, plus taxes and fees."
            />
            <OfferCard
              icon={<Gift className="w-6 h-6" />}
              title="Third Night Free"
              text="Book two nights and receive your third night free. Use promo code WINTER26."
            />
            <OfferCard
              icon={<Ticket className="w-6 h-6" />}
              title="Complimentary Event Admissions"
              text="Up to four complimentary Christmas event admissions with a qualifying room stay."
            />
          </div>
        </div>
      </section>

      {/* Winter Room Specials */}
      {winterOffer && (
        <section className="py-16 lg:py-20 bg-white border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              Winter Room Specials · Nov 1 – Jan 31
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              {winterOffer.title}
            </h2>
            <p className="text-stone-600 text-base leading-relaxed max-w-2xl mx-auto mb-8">
              {winterOffer.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://thebridgestn.holidayfuture.com/all-listings"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Book a Holiday Stay
              </a>
              <a
                href="tel:+19317225589"
                className="inline-flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 text-[#2a382c] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                <Phone className="w-4 h-4" /> Call 931-722-5589
              </a>
            </div>
            <p className="text-xs text-stone-400 mt-4">
              Promo code WINTER26 applies the third-night-free offer automatically. Website-only
              rates and codes are not verified on Airbnb.
            </p>
          </div>
        </section>
      )}

      {/* Complimentary Event Admission */}
      <section className="py-16 lg:py-20 bg-[#f4eee6] border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200 p-8 lg:p-10 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Complimentary Event Admission with Rooms
              </h2>
            </div>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-5">
              Stay during a scheduled Christmas event and receive up to four complimentary event
              admissions per room.
            </p>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> For registered
                overnight guests only.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> Maximum four
                admissions per qualifying room.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> If fewer than
                four guests are registered, only those guests receive admission.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> Additional
                guests purchase tickets separately.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> Event admission
                must be reserved in advance.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> Optional
                activities, specialty food, and additional experiences are excluded unless
                specifically listed as included.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" /> Event
                availability and capacity apply.
              </li>
            </ul>
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 mt-6 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              Request Event Admission <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-stone-400 mt-3">
              Admission requests are reviewed by staff to verify your qualifying stay and remaining
              event capacity. You will see “Admission request received,” not “Tickets issued,” until
              verified.
            </p>
          </div>
        </div>
      </section>

      {/* Christmas Events */}
      <section
        id="christmas-events"
        className="py-16 lg:py-20 bg-[#faf8f5] border-b border-stone-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              December 2026
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Christmas Events at The Bridges
            </h2>
            <p className="text-stone-600 text-sm mt-3 max-w-xl mx-auto">
              Additional event details are being finalized. Check back for updates.
            </p>
          </div>
          {confirmedEvents.length === 0 ? (
            <p className="text-center text-stone-500">No confirmed events announced yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {confirmedEvents.map((e) => {
                const calEv = {
                  code: e.id,
                  title: e.title,
                  description: e.description ?? null,
                  eventDate: e.event_date,
                  endDate: e.end_date ?? null,
                  startTime: e.start_time ?? null,
                  endTime: e.end_time ?? null,
                  location: e.location ?? null,
                };
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col"
                  >
                    {e.image_url ? (
                      <div className="relative h-44 sm:h-52 overflow-hidden">
                        <img
                          src={e.image_url}
                          alt={e.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a231c]/85 via-[#1a231c]/30 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1 text-center shadow-md">
                            <span className="text-[10px] font-bold uppercase leading-none text-[#2a382c] block">
                              {fmtDateShort(e.event_date).split(" ")[0]}
                            </span>
                            <span className="text-base font-bold leading-none text-[#2a382c] block">
                              {fmtDateShort(e.event_date).split(" ")[1]}
                            </span>
                          </div>
                        </div>
                        <h3 className="absolute bottom-3 left-4 right-4 font-serif text-lg font-bold text-white leading-tight drop-shadow">
                          {e.title}
                        </h3>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-5 bg-[#2a382c] text-white">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {fmtDateShort(e.event_date).split(" ")[0]}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {fmtDateShort(e.event_date).split(" ")[1]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold leading-tight">{e.title}</h3>
                          <p className="text-xs text-white/70">{fmtDate(e.event_date)}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      {e.description && (
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                          {e.description}
                        </p>
                      )}
                      {(e.start_time || e.end_time) && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Clock className="w-3.5 h-3.5" />
                          {e.start_time}
                          {e.start_time && e.end_time ? "–" : ""}
                          {e.end_time}
                          <span className="text-stone-400">Central Time</span>
                        </div>
                      )}
                      {e.location && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Compass className="w-3.5 h-3.5" /> {e.location}
                        </div>
                      )}
                      <div className="mt-1 pt-3 border-t border-stone-200 flex flex-wrap items-center gap-3">
                        {e.ticket_url ? (
                          <a
                            href={e.ticket_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                          >
                            <Ticket className="w-4 h-4" /> Get Tickets
                          </a>
                        ) : (
                          <Link
                            to="/contact-us"
                            className="inline-flex items-center gap-2 bg-[#657B6A] hover:bg-[#596d5e] text-white font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                          >
                            <Phone className="w-4 h-4" /> Inquire / Reserve
                          </Link>
                        )}
                        <span className="text-xs text-stone-500 flex items-center gap-1.5">
                          <CalendarPlus className="w-3.5 h-3.5" /> Add to:
                        </span>
                        <a
                          href={generateGoogleCalendarUrl(calEv)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#2a382c] hover:underline"
                        >
                          Google
                        </a>
                        <span className="text-stone-300">·</span>
                        <button
                          onClick={() => downloadIcs(calEv)}
                          className="text-xs font-medium text-[#2a382c] hover:underline"
                        >
                          Apple / Outlook
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Large group pricing note */}
          <div className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <p className="text-sm text-stone-600 mb-3">
              Bringing a group of 11 or more? Contact us about group pricing.
            </p>
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              <Users className="w-4 h-4" /> Request Group Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Restaurant & Day-of */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
            Make a Day of It
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
            Come Early for a Meal
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
            Come early for a meal and make a day of your Christmas visit. Contact us for event-day
            restaurant hours and activity details. Food is separately purchased unless the event
            explicitly includes it (such as the Grinchmas Breakfast).
          </p>
          <a
            href="tel:+19317225589"
            className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors"
          >
            <Phone className="w-4 h-4" /> Call 931-722-5589
          </a>
        </div>
      </section>

      {/* Private Holiday Parties */}
      <section className="py-16 lg:py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              Private Holiday Parties
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Plan a Private Holiday Party
            </h2>
            <p className="text-stone-600 text-sm mt-3 max-w-xl mx-auto">
              Company parties, church groups, family gatherings, and private Christmas celebrations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">The Willows</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Monday–Friday: $500 for 5 hours. Saturday–Sunday: $800 for 5 hours. Saturday–Sunday
                with The Bridges catering: $500 for 5 hours, plus catering costs. Tables and chairs
                included. These rates exclude weddings.
              </p>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline pt-2"
              >
                Request a Holiday Party Date <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Private Restaurant Rental
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                $250 for 5 hours. Up to 75 guests. Guests may bring their own food or arrange The
                Bridges catering.
              </p>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline pt-2"
              >
                Request a Holiday Party Date <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function OfferCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#657B6A]/15 text-[#2a382c] flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-bold text-stone-900">{title}</h3>
      <p className="text-xs text-stone-600 leading-relaxed">{text}</p>
    </div>
  );
}
