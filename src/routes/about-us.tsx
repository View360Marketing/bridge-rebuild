import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArrowRight, BedDouble, Trees, Building, Phone } from "lucide-react";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us | The Bridges TN" },
      {
        name: "description",
        content:
          "Learn about The Bridges in Waynesboro, Tennessee: a peaceful resort built around a rare natural bridge, featuring lodging, event spaces, and natural wonder.",
      },
      { property: "og:title", content: "About Us | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Learn about The Bridges in Waynesboro, TN: peaceful resort built around Tennessee's natural bridge.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
                ABOUT US
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
                A peaceful resort built around a natural landmark.
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                In Waynesboro, The Bridges gives groups a rare natural setting for weddings,
                retreats, team building, and overnight stays.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/contact-us"
                  className="bg-[#2a382c] hover:bg-[#1b251e] text-white font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Plan Your Visit
                </Link>
                <a
                  href="https://www.airbnb.com/users/show/244417704"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Book Lodging
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-[420px]">
                <img
                  src="https://vibe.filesafe.space/1790196628861484830/assets/fab01de6-ea36-4c90-936b-29f93a1c006b.jpg"
                  alt="Tennessee Natural Bridge at The Bridges"
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
