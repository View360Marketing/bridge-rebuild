import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { listPropertyEventsFn, listSeasonalOffersFn } from "@/lib/booking/seasonal.functions";
import {
  Calendar,
  Sparkles,
  Heart,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Gatherings | The Bridges TN" },
      {
        name: "description",
        content:
          "December 2026 events at The Bridges: Grinchmas Breakfast, Holiday Movie Night, Elf Academy, and Polar Express Movie Night. Plus private gatherings, retreats, and weddings at The Willows in Waynesboro, Tennessee.",
      },
      { property: "og:title", content: "Events & Gatherings | The Bridges TN" },
      {
        property: "og:description",
        content:
          "December 2026 events and private gatherings at The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: EventsPage,
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

function EventsPage() {
  const listEvents = useServerFn(listPropertyEventsFn);
  const listOffers = useServerFn(listSeasonalOffersFn);
  const { data: events } = useQuery({ queryKey: ["property-events"], queryFn: listEvents });
  const { data: offers } = useQuery({ queryKey: ["seasonal-offers-public"], queryFn: listOffers });

  const confirmedEvents = (events ?? []).filter((e) => e.is_confirmed && !e.is_tentative);
  const tentativeEvents = (events ?? []).filter((e) => e.is_tentative);
  const winterOffer = (offers ?? [])[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Hero Header */}
      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
              HAPPENING AT THE BRIDGES
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
              Events &amp; Gatherings
            </h1>
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light">
              From unforgettable weddings and private celebrations at The Willows to company
              retreats, family getaways, and seasonal events, The Bridges is an inspiring setting
              beside Tennessee&apos;s rare natural bridge.
            </p>
          </div>
        </div>
      </section>

      {/* December Events Section */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              DECEMBER 2026 SCHEDULE
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              December Events
            </h2>
          </div>

          {confirmedEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {confirmedEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-[#faf8f5] rounded-3xl border border-stone-200 overflow-hidden flex flex-col"
                >
                  <div className="bg-[#2a382c] text-white p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/70">
                        {fmtDateShort(e.event_date)}
                      </div>
                      <div className="font-serif text-lg font-bold leading-tight">{e.title}</div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {e.subtitle && (
                      <p className="text-sm font-medium text-[#3e5340]">{e.subtitle}</p>
                    )}
                    {e.description && (
                      <p className="text-sm text-stone-600 leading-relaxed">{e.description}</p>
                    )}
                    {(e.start_time || e.end_time) && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        {e.start_time}
                        {e.start_time && e.end_time ? "–" : ""}
                        {e.end_time}
                      </div>
                    )}
                    {e.location && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Compass className="w-3.5 h-3.5" />
                        {e.location}
                      </div>
                    )}
                    {e.includes_overnight_access && (
                      <div className="mt-1 bg-[#2a382c]/5 border border-[#2a382c]/15 rounded-xl px-3 py-2 text-xs text-[#2a382c]">
                        <span className="font-semibold">Stay with us</span> on a December event
                        weekend and enjoy the event included with your room stay for registered
                        overnight guests.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tentative events */}
          {tentativeEvents.length > 0 && (
            <div className="mb-8">
              {tentativeEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-[#faf8f5] border border-stone-300 rounded-3xl p-6 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2a382c] bg-[#2a382c]/10 px-2.5 py-0.5 rounded-full">
                        Possible Character Night — Tentative
                      </span>
                      <span className="text-xs text-stone-500">{fmtDate(e.event_date)}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">{e.title}</h3>
                    <p className="text-sm text-stone-600">
                      {e.description ?? "Details and confirmation to be announced."}
                    </p>
                    <p className="text-xs text-stone-500 font-medium">
                      This date is tentative and not yet confirmed. Tickets are not available for
                      this event.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#faf8f5] rounded-3xl p-6 sm:p-8 border border-stone-200 text-center max-w-3xl mx-auto">
            <p className="text-sm text-stone-600">
              Additional event details are being finalized. Check back for updates. For event
              questions or to plan a private gathering, please{" "}
              <Link to="/contact-us" className="text-[#2a382c] font-semibold underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Winter Lodging Offer */}
      {winterOffer && (
        <section className="py-16 bg-[#f4eee6] border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-stone-200 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block">
                  WINTER LODGING OFFER · {fmtDateShort(winterOffer.effective_from)} –{" "}
                  {fmtDateShort(winterOffer.effective_to)}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {winterOffer.title}
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                  {winterOffer.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/stay"
                    className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <span>Search Stays</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact-us"
                    className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
                  >
                    Ask About a Stay
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="bg-[#2a382c] text-white rounded-2xl p-6 text-center">
                  <div className="text-3xl font-serif font-bold">
                    ${(winterOffer.weekday_rate_cents / 100).toFixed(0)}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white/70 mt-1">
                    {winterOffer.weekday_label}
                  </div>
                  <div className="text-[10px] text-white/50 mt-1">
                    per night, plus taxes &amp; fees
                  </div>
                </div>
                <div className="bg-[#3e5340] text-white rounded-2xl p-6 text-center">
                  <div className="text-3xl font-serif font-bold">
                    ${(winterOffer.weekend_rate_cents / 100).toFixed(0)}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white/70 mt-1">
                    {winterOffer.weekend_label}
                  </div>
                  <div className="text-[10px] text-white/50 mt-1">
                    per night, plus taxes &amp; fees
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Christmas Murder Mystery Experience */}
      <section className="py-16 bg-[#243327] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#bfd8b8] block">
                SEASONAL PRIVATE EXPERIENCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                A Christmas Murder Mystery Party
              </h2>
              <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-light">
                Plan a Christmas celebration with a little mystery. We&apos;re developing a private
                Christmas Murder Mystery experience with setup and catering handled by our
                team—ideal for company parties, church groups and gatherings with friends.
              </p>
              <p className="text-stone-300 text-xs leading-relaxed">
                Details are being finalized. Contact us to express interest and discuss your group.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 bg-[#ece7df] hover:bg-white text-[#202c23] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <span>Ask About a Christmas Murder Mystery Party</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-white/15 h-72 bg-[#2a382c] flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white/25" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Private Gatherings Overview */}
      <section className="py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              PRIVATE GATHERINGS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Host your event at The Willows
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Weddings</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Celebrate your day beside a rare natural bridge with on-site lodging for your
                guests.
              </p>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline pt-2"
              >
                <span>Contact us for wedding pricing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Retreats &amp; Groups</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Company retreats, church gatherings, and team building with lodging and meeting
                space.
              </p>
              <Link
                to="/weddings-events"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline pt-2"
              >
                <span>View Venue Pricing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Restaurant Space</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Private rental of the restaurant space for gatherings up to 75 people.
              </p>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline pt-2"
              >
                <span>Inquire About Restaurant Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photo Banner */}
      <section className="py-20 bg-[#243327] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#bfd8b8]">
                BOOK YOUR 2027 DATE
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Now Booking 2027 Weddings &amp; Retreats
              </h2>
              <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-light">
                Dates fill quickly for peak spring, summer, and autumn weekends. Contact our events
                coordinator today to schedule a site tour or reserve your date early.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/contact-us"
                  className="bg-[#ece7df] hover:bg-white text-[#202c23] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Start Planning
                </Link>
                <a
                  href="tel:+19317225589"
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 931-722-5589</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 h-96">
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

      <Footer />
    </div>
  );
}
