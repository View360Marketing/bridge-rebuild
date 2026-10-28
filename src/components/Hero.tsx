import React from "react";
import { Link } from "@tanstack/react-router";
import { Phone, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[calc(85vh+10rem)] flex items-center justify-center overflow-hidden bg-stone-900 text-white -mt-40 xl:-mt-44 pt-32 xl:pt-44">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        src="https://assets.cdn.filesafe.space/Crq24gOD3w7117fkPynT/media/6a0cbe2bf18a99d948504460.mp4"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-stone-900/60" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Explore Tennessee&apos;s Natural Bridge
            </h1>
            <p className="text-stone-200 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
              The Bridges continues to welcome overnight guests and host private gatherings and
              scheduled experiences. Regular public park and restaurant hours are paused for the
              season, but our rooms, cabins, and event spaces remain available for your next stay or
              celebration.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/contact-us"
                className="inline-flex items-center gap-2 bg-[#faf8f5] hover:bg-white text-stone-900 font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick liquid glass action pills matching live site */}
            <div className="pt-6 flex flex-wrap gap-2.5">
              <a
                href="tel:+19317225589"
                className="bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href="tel:+19319811281"
                className="bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Book Massage · 931-981-1281</span>
              </a>
              <Link
                to="/contact-us"
                className="bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all"
              >
                Plan a Tour
              </Link>
              <Link
                to="/contact-us"
                className="bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all"
              >
                Plan Your Event
              </Link>
              <a
                href="https://www.airbnb.com/users/show/244417704"
                target="_blank"
                rel="noreferrer"
                className="bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all"
              >
                Book a Stay
              </a>
            </div>
          </div>

          {/* Right Floating Card: The Willows */}
          <div className="lg:col-span-5">
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-4 sm:p-5 shadow-2xl text-white space-y-4 hover:bg-white/20 transition-all group">
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-inner">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg"
                  alt="The Willows Event Space"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2 px-1 pb-1">
                <h2 className="font-serif text-2xl font-bold text-white">The Willows</h2>
                <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed">
                  Host your gathering at The Willows, our on-site event center with peaceful views
                  and space to celebrate well.
                </p>
                <div className="pt-2">
                  <Link
                    to="/weddings-events"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200 hover:text-white transition-colors"
                  >
                    <span>Explore The Willows</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
