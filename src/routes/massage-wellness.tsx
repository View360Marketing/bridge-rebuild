import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Sparkles, Waves, ExternalLink, Phone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/massage-wellness")({
  head: () => ({
    meta: [
      { title: "Massage & Wellness | The Bridges TN" },
      {
        name: "description",
        content:
          "Therapeutic massage, sauna, hot tub, and indoor heated pool wellness experiences at The Bridges in Waynesboro, Tennessee.",
      },
      { property: "og:title", content: "Massage & Wellness | The Bridges TN" },
      {
        property: "og:description",
        content:
          "Therapeutic massage, sauna, hot tub, and indoor heated pool wellness experiences at The Bridges in Waynesboro, Tennessee.",
      },
    ],
  }),
  component: WellnessPage,
});

function WellnessPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-[#faf8f5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2f4032] block">
                WELLNESS &amp; SPA SERVICES
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1a231c] tracking-tight leading-[1.1]">
                Unwind mind and body beside the bridges.
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Experience restorative therapeutic bodywork, soak in our heated indoor pool and hot
                tub, or decompress in the dry sauna.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="http://connoisseurtherapeuticbodywork.clinicsense.com/book/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1f2b21] text-white font-medium px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Book Massage Online</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="tel:+19317225589"
                  className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-medium px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call (931) 722-5589</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-[420px]">
                <img
                  src="https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Natural-Bridge_Wayne-County-66-1024x683.jpg"
                  alt="Peaceful natural setting at The Bridges"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Therapeutic Bodywork</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Provided by Connoisseur Therapeutic Bodywork. Licensed therapists offer Swedish,
                deep tissue, myofascial, and relaxation massages customized to your needs.
              </p>
              <div className="pt-2">
                <a
                  href="http://connoisseurtherapeuticbodywork.clinicsense.com/book/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-wider text-[#2a382c] hover:underline inline-flex items-center gap-1"
                >
                  <span>Schedule Appointment</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Indoor Heated Pool &amp; Hot Tub
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Enjoy year-round swimming in our indoor heated pool, soothe tired muscles in the hot
                tub, or book private pool party sessions for groups and celebrations.
              </p>
            </div>

            <div className="bg-[#faf8f5] p-8 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Sauna &amp; Sun Deck</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Detoxify in our traditional dry sauna, then step out onto the sun deck to enjoy the
                fresh Tennessee woodland breeze and calm mountain air.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
