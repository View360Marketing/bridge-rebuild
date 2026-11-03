import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPropertyEventsFn, listSeasonalOffersFn } from "@/lib/booking/seasonal.functions";
import { generateGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar-export";
import {
  Calendar,
  Sparkles,
  Heart,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
  Phone,
  Clock,
  AlertCircle,
  Ticket,
  CalendarPlus,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/events/")({
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
    <>
      {/* Hero Header */}
      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
                HAPPENING AT THE BRIDGES
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
                Events &amp; Gatherings
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                From unforgettable weddings and private celebrations at The Willows to company
                retreats, family getaways, and seasonal events, The Bridges is an inspiring setting
                beside Tennessee&apos;s rare natural bridge.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#december-events"
                  className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>View December Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="tel:+19317225589"
                  className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 931-722-5589</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-80 sm:h-96 relative group">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg"
                  alt="The Willows Event Space at The Bridges"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-semibold text-stone-900 tracking-wide shadow-md">
                    The Willows · Event Center
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* December Events Section */}
      <section id="december-events" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-center">
            <div className="lg:col-span-7 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
                DECEMBER 2026 SCHEDULE
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
                December Events
              </h2>
            </div>
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl overflow-hidden h-24 sm:h-28 border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/fab01de6-ea36-4c90-936b-29f93a1c006b.jpg"
                  alt="The Natural Bridge"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-24 sm:h-28 border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg"
                  alt="Resort cabins at The Bridges"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-24 sm:h-28 border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg"
                  alt="The Bridges property"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {confirmedEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {confirmedEvents.map((e) => {
                const calEv = {
                  code: e.code,
                  title: e.title,
                  description: e.description,
                  eventDate: e.event_date,
                  endDate: e.end_date,
                  startTime: e.start_time,
                  endTime: e.end_time,
                  location: e.location,
                };
                return (
                  <div
                    key={e.id}
                    className="bg-[#faf8f5] rounded-3xl border border-stone-200 overflow-hidden flex flex-col"
                  >
                    {e.image_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={e.image_url}
                          alt={e.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2a382c]/85 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <div className="text-xs uppercase tracking-wider text-white/80">
                            {fmtDateShort(e.event_date)}
                          </div>
                          <div className="font-serif text-lg font-bold leading-tight">
                            {e.title}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#2a382c] text-white p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-white/70">
                            {fmtDateShort(e.event_date)}
                          </div>
                          <div className="font-serif text-lg font-bold leading-tight">
                            {e.title}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      {!e.image_url && e.subtitle && (
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
                          <span className="text-stone-400">Central Time</span>
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
                      {e.ticket_url && (
                        <a
                          href={e.ticket_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors mt-1 self-start"
                        >
                          <Ticket className="w-4 h-4" /> Get Tickets
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        to="/events/$code"
                        params={{ code: e.code }}
                        className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:border-[#657B6A] text-[#2a382c] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors mt-1 self-start"
                      >
                        <Calendar className="w-4 h-4" /> Event Details
                      </Link>
                      <div className="flex items-center gap-2 mt-1 pt-3 border-t border-stone-200">
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
              Advance purchase or reservation is required. No unreserved ticket sales at the door.
              To reserve with cash payment, call{" "}
              <a href="tel:+19317225589" className="font-semibold text-[#2a382c] hover:underline">
                931-722-5589
              </a>
              . Groups of 11 or more tickets: call us about group pricing. Additional event details
              are being finalized — check back for updates. For event questions or to plan a private
              gathering, please{" "}
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
                  <a
                    href="tel:+19317225589"
                    className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call to Book a Stay</span>
                  </a>
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
              <div className="rounded-3xl overflow-hidden border border-white/15 h-72 sm:h-80 relative group">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg"
                  alt="Private gathering space at The Willows"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#243327]/80 via-[#243327]/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#bfd8b8] shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                    Private group experiences
                  </span>
                </div>
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
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 931-722-5589</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 h-96">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg"
                  alt="The Willows Event Space"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Email Notification */}
      <EventEmailSignup />
    </>
  );
}

function EventEmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    try {
      const payload = {
        type: "external_form_submission" as const,
        timestamp: Date.now(),
        formId: "events-notification-signup",
        formData: { "contact.email": trimmed } as Record<string, unknown>,
        formLabels: { "contact.email": "Email Address" } as Record<string, string>,
        url: window.location.href,
        title: document.title,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        trackingId: "tk_f5207799ac094e8aa5ff24029a8b469d",
        locationId: "Crq24gOD3w7117fkPynT",
        projectId: "1790196628861484830",
        sessionId: (() => {
          try {
            const sid = document.cookie.match(/(?:^|;\s*)__vibe_sid=([0-9a-f-]{36})(?:;|$)/)?.[1];
            return sid || crypto.randomUUID();
          } catch {
            return crypto.randomUUID();
          }
        })(),
        properties: {
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
          source: "ai_studio",
          projectId: "1790196628861484830",
          formName: "Events Notification Signup",
        },
      };
      const body = new FormData();
      body.append("event", JSON.stringify(payload));
      fetch("https://backend.leadconnectorhq.com/external-tracking/events", {
        method: "POST",
        headers: { version: "2021-07-28" },
        body,
      }).catch(() => {});
      setSubmitted(true);
      setEmail("");
    } catch {
      /* fire-and-forget — never block UX */
    }
  }

  return (
    <section className="py-16 bg-[#f4eee6] border-t border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
          STAY IN THE LOOP
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Get Notified About Upcoming Events
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl mx-auto">
          New events are being added throughout the season. Share your email and we&apos;ll let you
          know as dates and details are confirmed.
        </p>
        {submitted ? (
          <div className="bg-white border border-stone-200 rounded-2xl px-6 py-5 inline-flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#3e5340]" />
            <span className="text-sm text-stone-800 font-medium">
              Thanks! We&apos;ll send event updates to your inbox.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 px-4 py-3 rounded-full border border-stone-300 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#657B6A] focus:border-[#657B6A]"
            />
            <button
              type="submit"
              className="bg-[#2a382c] hover:bg-[#1f2b21] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        )}
        <p className="text-xs text-stone-400 mt-4">We respect your privacy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
