import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
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
} from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Gatherings | The Bridges TN" },
      {
        name: "description",
        content:
          "Private gatherings, retreats, weddings, and special events at The Bridges in Waynesboro, Tennessee.",
      },
      { property: "og:title", content: "Events & Gatherings | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Private gatherings, retreats, weddings, and special events at The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
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
              retreats and family getaways, The Bridges is an inspiring setting beside
              Tennessee&apos;s rare natural bridge.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section with required prompt empty state message */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340] block mb-2">
              SCHEDULE &amp; CALENDAR
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Upcoming Events
            </h2>
          </div>

          {/* Prompt specified exact notice */}
          <div className="bg-[#faf8f5] rounded-3xl p-10 sm:p-14 border border-stone-200 text-center max-w-3xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              There are no upcoming public events announced at this time.
            </h3>
            <p className="text-stone-600 text-sm max-w-lg mx-auto">
              Please check back for updates. We are currently booking 2027 weddings, corporate
              retreats, and private gatherings.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact-us"
                className="bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Plan a Private Event
              </Link>
              <a
                href="https://www.facebook.com/thebridgestn"
                target="_blank"
                rel="noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                Follow on Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Private Gatherings Overview */}
      <section className="py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Weddings</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Say &ldquo;I do&rdquo; surrounded by towering cliffs, lush woodland, and peaceful
                  water. The Willows provides a breathtaking indoor and outdoor space for your
                  wedding and reception.
                </p>
              </div>
              <Link
                to="/weddings-events"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2a382c] hover:underline pt-4"
              >
                <span>Learn about The Willows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Group Retreats</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Bring your company, church group, or team together for focused workshops, team
                  building, outdoor hikes, and quiet evenings around the fire.
                </p>
              </div>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2a382c] hover:underline pt-4"
              >
                <span>Inquire About Retreats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2a382c]/10 text-[#2a382c] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Special Celebrations
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Family reunions, milestone birthdays, anniversaries, and private pool parties.
                  Keep everyone together on the property with on-site lodging.
                </p>
              </div>
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2a382c] hover:underline pt-4"
              >
                <span>Book a Gathering</span>
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
