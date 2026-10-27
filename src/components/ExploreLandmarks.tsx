import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export function ExploreLandmarks() {
  const [activeExploreTab, setActiveExploreTab] = useState<"ice-cave" | "bridges" | "water-wheel">(
    "bridges",
  );

  return (
    <section id="explore" className="py-20 bg-[#faf8f5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block mb-2">
              EXPLORE THE BRIDGES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 max-w-2xl">
              Discover scenic stops, historic views, and peaceful moments throughout The Bridges.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: 3 interactive cards matching the original website design */}
          <div className="lg:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => setActiveExploreTab("ice-cave")}
              className={`w-full text-left p-6 rounded-2xl transition-all border ${
                activeExploreTab === "ice-cave"
                  ? "bg-white shadow-md border-stone-300 ring-2 ring-[#2a382c]/20"
                  : "bg-transparent hover:bg-stone-100 border-transparent text-stone-700"
              }`}
            >
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">Ice Cave</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Explore the Ice Cave, where cool stone, shade, and natural wonder shape the stop.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab("bridges")}
              className={`w-full text-left p-6 rounded-2xl transition-all border ${
                activeExploreTab === "bridges"
                  ? "bg-white shadow-md border-stone-300 ring-2 ring-[#2a382c]/20"
                  : "bg-transparent hover:bg-stone-100 border-transparent text-stone-700"
              }`}
            >
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">The Bridges</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Walk the rare natural bridges, take in the view, and slow down beside the water.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab("water-wheel")}
              className={`w-full text-left p-6 rounded-2xl transition-all border ${
                activeExploreTab === "water-wheel"
                  ? "bg-white shadow-md border-stone-300 ring-2 ring-[#2a382c]/20"
                  : "bg-transparent hover:bg-stone-100 border-transparent text-stone-700"
              }`}
            >
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-1">Water Wheel</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Visit the water wheel, listen to it turn, and enjoy a quiet piece of the property.
              </p>
            </button>
          </div>

          {/* Right Column: Dynamic Photo with rounded corners */}
          <div className="lg:col-span-7 h-[420px] sm:h-[480px] rounded-3xl overflow-hidden relative shadow-lg border border-stone-200">
            {activeExploreTab === "ice-cave" && (
              <img
                src="https://vibe.filesafe.space/1790196628861484830/assets/5d66d3b1-c34d-4f33-b0fa-032e1acf1ec5.jpg"
                alt="Ice Cave"
                className="w-full h-full object-cover animate-in fade-in duration-300"
              />
            )}
            {activeExploreTab === "bridges" && (
              <img
                src="https://vibe.filesafe.space/1790196628861484830/assets/fab01de6-ea36-4c90-936b-29f93a1c006b.jpg"
                alt="The Natural Bridges"
                className="w-full h-full object-cover animate-in fade-in duration-300"
              />
            )}
            {activeExploreTab === "water-wheel" && (
              <img
                src="https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg"
                alt="Water Wheel"
                className="w-full h-full object-cover animate-in fade-in duration-300"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
