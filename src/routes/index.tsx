import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { ExploreLandmarks } from "../components/ExploreLandmarks";
import { ContactSection } from "../components/ContactSection";
import {
  Star,
  CheckCircle2,
  Trees,
  Building,
  BedDouble,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bridges | Tennessee's Natural Bridge Resort & Event Center" },
      {
        name: "description",
        content:
          "Experience Tennessee's Natural Bridge in Waynesboro, TN. Book 2027 weddings at The Willows, private retreats, guest rooms, cabins, and RV park stays.",
      },
      { property: "og:title", content: "The Bridges | Tennessee's Natural Bridge" },
      {
        property: "og:description",
        content:
          "Experience Tennessee's Natural Bridge in Waynesboro, TN. Book 2027 weddings at The Willows, retreats, and lodging.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans selection:bg-stone-200 selection:text-stone-900">
      <Header />
      <Hero />

      {/* CHRISTMAS PROMO */}
      <section className="py-16 bg-[#1a231c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#bfd8b8] mb-4">
            Christmas 2026
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Christmas at The Bridges — Reserve your tickets today
          </h2>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed font-light max-w-2xl mx-auto mb-7">
            Stay the night, celebrate together, and make Christmas memories with holiday events,
            winter lodging specials, and private gatherings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/christmas"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-100 text-[#2a382c] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              See Christmas Events
            </Link>
            <a
              href="https://thebridgestn.holidayfuture.com/all-listings"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#657B6A] hover:bg-[#596d5e] text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-lg border border-white/20"
            >
              Book a Holiday Stay
            </a>
          </div>
        </div>
      </section>

      {/* STAY SECTION */}
      <section id="stay" className="py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block mb-2">
                STAY AT THE BRIDGES
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1a231c]">
                Find Your Perfect Stay
              </h2>
            </div>
            <div className="max-w-md text-stone-600 text-sm space-y-3">
              <p>
                Stay close to the natural bridge, event spaces, and peaceful views that make The
                Bridges a one-of-a-kind destination. Browse available lodging below or contact us
                for help planning a larger group stay.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/contact-us"
                  className="bg-[#2a382c] hover:bg-[#1f2b21] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Need Help Booking?
                </Link>
                <a
                  href="https://thebridgestn.holidayfuture.com/all-listings"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#3e5340] hover:bg-[#314233] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Stays</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#f3eee8] text-stone-900 rounded-3xl p-8 lg:p-12 border border-stone-200/80 shadow-xs relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
                STAY AT THE BRIDGES
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                Book Your Stay Through Airbnb
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Explore our cabins and guest rooms, check current availability and pricing, and
                reserve your stay securely through Airbnb.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.airbnb.com/users/show/244417704"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  <span>View Stays on Airbnb</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 z-10">
              <div className="rounded-2xl overflow-hidden h-36 sm:h-44 shadow-xs border border-stone-300/60">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg"
                  alt="Guest Room 41"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-36 sm:h-44 shadow-xs border border-stone-300/60">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg"
                  alt="Resort Cabins"
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS & HAPPENINGS SECTION */}
      <section id="events" className="py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2a382c] text-white rounded-3xl p-8 sm:p-12 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#cadbbf]">
                HAPPENING AT THE BRIDGES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Current Events &amp; Weekly Happenings
              </h2>
              <p className="text-stone-200 text-sm sm:text-base max-w-xl font-light leading-relaxed">
                From private gatherings at The Willows to peaceful overnight stays, there are still
                many ways to experience The Bridges. Check back for seasonal updates or contact us
                to host your event.
              </p>
            </div>
            <div className="lg:col-span-5 bg-white text-stone-900 p-7 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Plan Around What&apos;s Happening
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Check back for seasonal events, family-friendly days, retreats, and weddings across
                The Bridges.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/events"
                  className="bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
                >
                  View Events
                </Link>
                <Link
                  to="/contact-us"
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT RESORT SECTION */}
      <section id="about" className="py-20 bg-[#faf8f5] text-stone-900 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-md border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/fab01de6-ea36-4c90-936b-29f93a1c006b.jpg"
                  alt="Natural Bridge Rock Formation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white border border-stone-200 p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-[#2a382c]">33</div>
                <div className="text-xs text-stone-600 font-medium uppercase tracking-wider mt-1">
                  Places to Stay at The Bridges
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#3e5340] text-xs font-bold uppercase tracking-widest">
                ABOUT US
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
                A Peaceful Resort Built Around A Natural Landmark
              </h2>
              <p className="text-stone-600 text-base leading-relaxed font-light">
                In Waynesboro, TN, The Bridges gives groups a rare natural setting for weddings,
                retreats, team building, and overnight stays.
              </p>

              <div className="pt-2">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>Plan Your Visit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY BOOK THE BRIDGES */}
      <section className="py-20 bg-[#243327] text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#bfd8b8] text-xs font-bold uppercase tracking-widest">
              WHY BOOK THE BRIDGES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Host a wedding, retreat, or team getaway beside a rare natural bridge, with lodging
              and room to connect.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-4 hover:bg-white/15 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Event Venue</h3>
              <p className="text-xs text-stone-200 leading-relaxed font-light">
                Celebrate with natural views, warm spaces, peaceful surroundings.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-4 hover:bg-white/15 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Team Building</h3>
              <p className="text-xs text-stone-200 leading-relaxed font-light">
                Bring your group together with fresh air, shared time, and space.
              </p>
            </div>

            <div className="bg-white/10 p-8 rounded-3xl border border-white/15 space-y-4 hover:bg-white/15 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Overnight Rentals</h3>
              <p className="text-xs text-stone-200 leading-relaxed font-light">
                Keep everyone close with comfortable rooms after the day winds down.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://www.airbnb.com/users/show/244417704"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#ece7df] hover:bg-white text-[#202c23] font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Book a Stay Here</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* EXPLORE STOPS */}
      <ExploreLandmarks />

      {/* AMENITIES / VENUE FEATURES GRID - Light warm linen background */}
      <section id="amenities" className="py-20 bg-[#f4eee6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
              VENUE FEATURES &amp; AMENITIES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Start simple. Shape the details together.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Whether you are planning a wedding or another event, the first step is getting the
              right date, space, and flow in place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Stay</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Cabin / room lodging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>RV sites with full hookups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Water, sewer, and electric</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Free Wi-Fi / internet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Coin laundry access</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Pool + Wellness</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Indoor heated pool</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Hot tub &amp; Sauna</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Sun deck</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Massage / spa services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Pool parties &amp; wellness add-ons</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Recreation</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Fully equipped gym</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Basketball &amp; Pickleball court</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Racquetball &amp; Ping pong</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Rec room</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Outdoors</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Hiking / nature trails</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Fire pits &amp; Charcoal grills</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Natural bridge &amp; Ice Cave</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Water wheel</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Food + Essentials</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Dining hall &amp; General Store</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Event meals &amp; group support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Stay essentials</span>
                </li>
              </ul>
            </div>

            <div
              className="bg-[#fbf9f6] p-7 rounded-2xl shadow-xs border border-stone-200/90 space-y-4"
              id="the-willows"
            >
              <h3 className="font-serif text-2xl font-bold text-stone-900">Events</h3>
              <ul className="space-y-2 text-xs text-stone-700 font-light">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>The Willows Event Center</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Weddings &amp; Retreats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Pool parties &amp; Group stays</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Verified authentic non-Alpine customer reviews */}
      <section className="py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
                TESTIMONIALS
              </span>
              <p className="text-stone-600 text-sm leading-relaxed">
                Our guests love the peaceful setting, beautiful rooms, and thoughtful service that
                make every stay feel relaxed and memorable.
              </p>
            </div>
            <div className="lg:col-span-7">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
                Feedback From Our Customers
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                &ldquo;Will never stay anywhere else when I’m in western TN. Great room, amenities,
                food, swimming, such a beautiful place to be.&rdquo;
              </p>
              <div className="pt-2">
                <h4 className="font-bold text-stone-900 text-sm">Jason Higgins</h4>
                <p className="text-xs text-stone-500">Verified Guest – Google</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                &ldquo;Great place to take the kids! Family atmosphere! Great experience and the
                Christmas lights were beautiful! The kids gave it a 10!&rdquo;
              </p>
              <div className="pt-2">
                <h4 className="font-bold text-stone-900 text-sm">Andrea Kemper</h4>
                <p className="text-xs text-stone-500">Verified Guest – Google</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                &ldquo;This is a great hidden gem! Wonderful people with an amazing place to
                explore! A peaceful setting and wonderful stay.&rdquo;
              </p>
              <div className="pt-2">
                <h4 className="font-bold text-stone-900 text-sm">Scott Lynch</h4>
                <p className="text-xs text-stone-500">Verified Guest – Google</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}
