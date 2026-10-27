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
    url: "https://vibe.filesafe.space/1790196628861484830/assets/30945ebf-a148-4ad5-a769-9044e5e3bc37.jpg",
    alt: "Tennessee's Natural Bridge formation",
    title: "The Natural Bridge",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/5d66d3b1-c34d-4f33-b0fa-032e1acf1ec5.jpg",
    alt: "The Ice Cave at The Bridges",
    title: "Ice Cave",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg",
    alt: "Historic Water Wheel",
    title: "Water Wheel",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg",
    alt: "The Willows Event Center",
    title: "The Willows",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg",
    alt: "Guest Room 41 Lodging",
    title: "Guest Lodging",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg",
    alt: "Cabins and Grounds",
    title: "Cabins & Grounds",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/0d9abec6-3cfb-413a-b63e-f2110da45dd9.jpg",
    alt: "RV Sites",
    title: "RV Park Sites",
  },
  {
    url: "https://vibe.filesafe.space/1790196628861484830/assets/6eb4c2ea-6cc9-4cd6-8967-f444d1821ae6.jpg",
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
