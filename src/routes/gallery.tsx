import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery | The Bridges TN" },
      {
        name: "description",
        content:
          "Browse photographs of The Bridges in Waynesboro, Tennessee: the natural bridge, ice cave, water wheel, lodging, and The Willows event center.",
      },
      { property: "og:title", content: "Photo Gallery | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Browse photographs of The Bridges: natural bridge, ice cave, water wheel, and event venue.",
      },
    ],
  }),
  component: GalleryPage,
});

const PHOTOS = [
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Natural-Bridge_Wayne-County-66-scaled.jpg",
    alt: "Tennessee's Natural Bridge formation",
    title: "The Natural Bridge",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Ice-Cave_Wayne-County-56-scaled.jpg",
    alt: "The Ice Cave at The Bridges",
    title: "Ice Cave",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/05/DSC2575-2-scaled.jpg",
    alt: "Historic Water Wheel",
    title: "Water Wheel",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_The-Willows-Event-Space_Wayne-County-39-1024x683.jpg",
    alt: "The Willows Event Center",
    title: "The Willows",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Room-41_Wayne-County-69-1024x683.jpg",
    alt: "Guest Room 41 Lodging",
    title: "Guest Lodging",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/05/facilities27-min.jpg",
    alt: "Cabins and Grounds",
    title: "Cabins & Grounds",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/08/IMG_7798-768x1024.jpg",
    alt: "RV Sites",
    title: "RV Park Sites",
  },
  {
    url: "https://thebridgestn.com/wp-content/uploads/2026/08/IMG_9626-1-768x1024.jpg",
    alt: "Evening Fire Pit by RV",
    title: "Evening Campfires",
  },
];

function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
              PHOTO GALLERY
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
              Moments at The Bridges
            </h1>
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light">
              Explore our scenic grounds, natural bridge landmark, Ice Cave, The Willows event
              space, and comfortable lodging.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 h-80 bg-stone-100"
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-6">
                  <h3 className="font-serif text-xl font-bold text-white">{photo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
