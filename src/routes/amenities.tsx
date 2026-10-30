import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  CheckCircle2,
  Waves,
  Trees,
  Sparkles,
  Building,
  BedDouble,
  Phone,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/amenities")({
  head: () => ({
    meta: [
      { title: "Amenities & Property Highlights | The Bridges TN" },
      {
        name: "description",
        content:
          "Explore lodging, indoor heated pool, sauna, hot tub, RV sites with full hookups, Wi-Fi, natural bridge, ice cave, trails, and event facilities at The Bridges in Waynesboro, TN.",
      },
      { property: "og:title", content: "Amenities & Highlights | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Lodging, indoor heated pool, hot tub, sauna, full-hookup RV sites, nature trails, ice cave, and event facilities in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: AmenitiesPage,
});

function AmenitiesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
                Amenities &amp; Property Highlights
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
                More than a place to stay.
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                The Bridges welcomes overnight guests and hosts private gatherings, retreats, and
                scheduled experiences. Explore our lodging and event spaces, and contact our team to
                learn which property amenities are available with your booking.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#stay-your-way"
                  className="bg-[#2a382c] hover:bg-[#1f2b21] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  View Amenities
                </a>
                <a
                  href="tel:+19319811281"
                  className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call to Schedule</span>
                </a>
                <Link
                  to="/contact-us"
                  className="bg-[#3e5340] hover:bg-[#2e3e30] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Pool Rental
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 relative group h-[420px]">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg"
                  alt="Property highlights at The Bridges"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-semibold text-stone-900 tracking-wide shadow-md">
                    Stay, swim, play, unwind.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Your Way & RV Section */}
      <section id="stay-your-way" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden h-72 shadow-md border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/0d9abec6-3cfb-413a-b63e-f2110da45dd9.jpg"
                  alt="RV Park at The Bridges"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-72 shadow-md border border-stone-200">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg"
                  alt="Guest Room 41"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
                Stay Your Way
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
                Lodging, RV sites, and the comforts guests ask for.
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                Whether guests are booking a room, cabin, RV stay, event weekend, or retreat, The
                Bridges gives them a practical home base with internet access, laundry, parking, and
                access to resort-style amenities.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.airbnb.com/users/show/244417704"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Book Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200">
                <div className="bg-[#faf8f5] p-5 rounded-2xl border border-stone-200 text-center">
                  <div className="font-serif text-3xl font-bold text-[#2a382c]">33</div>
                  <div className="text-xs text-stone-600 font-medium uppercase tracking-wider mt-1">
                    Places to stay
                  </div>
                </div>
                <div className="bg-[#faf8f5] p-5 rounded-2xl border border-stone-200 text-center">
                  <div className="font-serif text-xl font-bold text-[#2a382c]">Wi-Fi</div>
                  <div className="text-xs text-stone-600 mt-1">Free internet access for guests</div>
                </div>
                <div className="bg-[#faf8f5] p-5 rounded-2xl border border-stone-200 text-center">
                  <div className="font-serif text-xl font-bold text-[#2a382c]">Pets</div>
                  <div className="text-xs text-stone-600 mt-1">Select pet-friendly options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-20 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
              VENUE FEATURES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Everything guests need to stay, relax, play, and gather.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              From overnight stays to group weekends and event getaways, The Bridges offers the
              spaces, services, and amenities guests need to feel comfortable and connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-2xl shadow-xs border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Stay</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Comfortable lodging options for overnight visits, family trips, retreats, and group
                weekends.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 font-light pt-2">
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
                  <span>Free Wi-Fi / internet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Coin laundry access</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-xs border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Wellness</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Relaxing water amenities and wellness services designed to help guests unwind.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 font-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Indoor heated pool</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Hot tub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Sauna</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Massage / spa services</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-xs border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Play</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fun amenities for guests, groups, retreats, and families looking to enjoy time
                together.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 font-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Basketball Goal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Ice Cave</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Charcoal Grills</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Ping Pong</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-xs border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Gather</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Spaces for groups, events, celebrations, and relaxing evenings on the property.
              </p>
              <ul className="space-y-2 text-xs text-stone-700 font-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Dining hall</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Rec room</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>Pool Parties</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" />
                  <span>The Willows Event Center</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RV Details */}
      <section className="py-20 bg-[#243327] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#bfd8b8]">
                RV PARK STAYS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Bring your RV and stay close to everything at The Bridges.
              </h2>
              <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-light">
                Whether you are passing through for a quiet weekend, planning a longer visit, or
                need a comfortable base near Natural Bridge Park, our RV spots give guests a simple
                way to stay on the property with easy access to the amenities that make The Bridges
                special.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
                  <h4 className="font-semibold text-white text-sm mb-1">Short-Term Stays</h4>
                  <p className="text-xs text-stone-300">
                    Great for weekend trips, retreats, and guests enjoying the park.
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
                  <h4 className="font-semibold text-white text-sm mb-1">Long-Term Stays</h4>
                  <p className="text-xs text-stone-300">
                    Flexible options for extended visits and seasonal travelers.
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
                  <h4 className="font-semibold text-white text-sm mb-1">Full Hookups</h4>
                  <p className="text-xs text-stone-300">
                    RV sites include water, sewer, and electric access.
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
                  <h4 className="font-semibold text-white text-sm mb-1">4 RV Spots Available</h4>
                  <p className="text-xs text-stone-300">
                    Designed as a calm, practical stay option on the property.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to="/contact-us"
                  className="bg-[#ece7df] hover:bg-white text-[#202c23] font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Ask About RV Availability
                </Link>
                <a
                  href="tel:+19317225589"
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
                >
                  Call (931) 722-5589
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 h-96">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/6eb4c2ea-6cc9-4cd6-8967-f444d1821ae6.jpg"
                  alt="Evening campfire by RV at The Bridges"
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
