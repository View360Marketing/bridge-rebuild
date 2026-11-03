import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPropertyEventByCodeFn } from "@/lib/booking/seasonal.functions";
import { generateGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar-export";
import {
  Calendar,
  Clock,
  Compass,
  MapPin,
  Ticket,
  Phone,
  ArrowLeft,
  CalendarPlus,
  ExternalLink,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/events/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.code} | The Bridges TN` },
      {
        name: "description",
        content: "Christmas event details at The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  loader: async ({ params }) => {
    // Prefetch the event server function so the route is ready
    return { code: params.code };
  },
  component: EventDetailPage,
});

function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime(t: string | null): string {
  if (!t) return "Time to be announced";
  const [h, m] = t.split(":").map(Number);
  const hh = h ?? 0;
  const mm = m ?? 0;
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return mm === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}

function EventDetailPage() {
  const { code } = Route.useParams();
  const getEvent = useServerFn(getPropertyEventByCodeFn);
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property-event", code],
    queryFn: () => getEvent({ data: { code } }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <p className="text-stone-500">Loading event details…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-3">Event not found</h1>
        <p className="text-stone-600 mb-6">
          We couldn&apos;t find that event. It may have been removed or is no longer available.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Christmas Events
        </Link>
      </div>
    );
  }

  const calEv = {
    code: event.code,
    title: event.title,
    description: event.description,
    eventDate: event.event_date,
    endDate: event.end_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
  };

  const timeLabel =
    event.start_time && event.end_time
      ? `${fmtTime(event.start_time)} – ${fmtTime(event.end_time)} Central Time`
      : event.start_time
        ? `${fmtTime(event.start_time)} Central Time`
        : "Time to be announced";

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {event.image_url ? (
          <>
            <div className="absolute inset-0">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a231c]/80 via-[#1a231c]/60 to-[#1a231c]/80" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1a231c]" />
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#bfd8b8] mb-4">
            <Calendar className="w-3.5 h-3.5" /> {fmtDate(event.event_date)}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/85 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {timeLabel}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> {event.location}
              </span>
            )}
          </div>
          {event.ticket_url && (
            <div className="mt-7">
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 text-[#2a382c] font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                <Ticket className="w-4 h-4" /> Get Tickets <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="py-16 lg:py-20 bg-[#faf8f5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2a382c] hover:underline mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Christmas Events
          </Link>

          {event.subtitle && (
            <p className="text-lg text-[#3e5340] font-medium leading-relaxed mb-6">
              {event.subtitle}
            </p>
          )}

          {event.description && (
            <div className="prose prose-stone max-w-none">
              <p className="text-stone-700 text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Details card */}
          <div className="mt-10 bg-white rounded-3xl border border-stone-200 p-6 lg:p-8 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">Event details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400">Date</div>
                  <div className="text-stone-800 font-medium">{fmtDate(event.event_date)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400">Time</div>
                  <div className="text-stone-800 font-medium">{timeLabel}</div>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-stone-400">Venue</div>
                    <div className="text-stone-800 font-medium">{event.location}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#3e5340] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400">Address</div>
                  <div className="text-stone-800 font-medium">
                    299 Natural Bridge Park Rd, Waynesboro, TN 38485
                  </div>
                </div>
              </div>
            </div>

            {event.includes_overnight_access && (
              <div className="bg-[#2a382c]/5 border border-[#2a382c]/15 rounded-xl px-4 py-3 text-sm text-[#2a382c]">
                <span className="font-semibold">Overnight guests:</span> Ask about qualifying room
                stays that include up to four complimentary event admissions per room for registered
                overnight guests. Advance reservations required.
              </div>
            )}

            {/* Add to calendar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <CalendarPlus className="w-3.5 h-3.5" /> Add to calendar:
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

          {/* Group pricing note */}
          <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-5 text-sm text-stone-600">
            <p className="mb-2">
              Advance purchase or reservation is required. No unreserved ticket sales at the door.
              To reserve with cash payment, call{" "}
              <a href="tel:+19317225589" className="font-semibold text-[#2a382c] hover:underline">
                931-722-5589
              </a>
              . Groups of 11 or more tickets: call us about group pricing.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <Ticket className="w-4 h-4" /> Get Tickets <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href="tel:+19317225589"
              className="inline-flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 text-[#2a382c] font-semibold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              <Phone className="w-4 h-4" /> Call 931-722-5589
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
