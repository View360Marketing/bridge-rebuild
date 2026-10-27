import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { searchAvailabilityFn, computeQuoteFn } from "@/lib/booking/payments.functions";
import { listUnitsFn } from "@/lib/booking/rooms.functions";
import { todayPropertyLocal, addDays, nightCount } from "@/lib/booking/dates";
import { ArrowRight, BedDouble, Users, CheckCircle2, ArrowLeft, Bath } from "lucide-react";

export const Route = createFileRoute("/stay/$unitId")({
  head: ({ params }) => ({
    meta: [
      { title: `Stay at The Bridges | Room ${params.unitId}` },
      { name: "description", content: "View room details and availability at The Bridges, Waynesboro, TN." },
    ],
  }),
  component: UnitDetailPage,
});

function UnitDetailPage() {
  const { unitId } = Route.useParams();
  const search = Route.useSearch() as { checkin?: string; checkout?: string; adults?: number; children?: number };
  const listUnits = useServerFn(listUnitsFn);
  const searchAvail = useServerFn(searchAvailabilityFn);
  const computeQuote = useServerFn(computeQuoteFn);

  const today = todayPropertyLocal();
  const [checkin, setCheckin] = useState(search.checkin ?? addDays(today, 1));
  const [checkout, setCheckout] = useState(search.checkout ?? addDays(today, 3));
  const [adults, setAdults] = useState(search.adults ?? 2);
  const [children, setChildren] = useState(search.children ?? 0);

  const { data: allUnits } = useQuery({
    queryKey: ["stay-units"],
    queryFn: listUnits,
  });
  const unit = (allUnits ?? []).find((u) => u.id === unitId);

  const { data: avail } = useQuery({
    queryKey: ["unit-avail", unitId, checkin, checkout, adults, children],
    enabled: !!unit,
    queryFn: () =>
      searchAvail({
        data: { checkin_date: checkin, checkout_date: checkout, adults, children, rooms: 1 },
      }),
  });

  const { data: quote } = useQuery({
    queryKey: ["unit-detail-quote", unitId, checkin, checkout, adults, children],
    enabled: !!unit,
    queryFn: () =>
      computeQuote({
        data: {
          units: [
            {
              unit_id: unitId,
              unit_code: unit?.unit_code ?? "",
              base_rate_cents: unit?.base_rate_cents ?? 0,
              max_adults: unit?.max_adults ?? 2,
              max_children: (unit?.max_guests ?? 2) - (unit?.max_adults ?? 2),
            },
          ],
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
        },
      }),
  });

  if (!unit) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Room not found</h1>
          <Link to="/stay" className="text-[#2a382c] font-semibold underline mt-4 inline-block">
            ← Back to all stays
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const nights = nightCount(checkin, checkout);
  const isAvailable = avail?.available.some((u) => u.id === unitId) ?? false;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-10 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/stay" className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-[#2a382c] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to all stays
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#2a382c] to-[#3e5340] rounded-2xl overflow-hidden flex items-center justify-center">
                <BedDouble className="w-20 h-20 text-white/30" />
              </div>
              <div className="mt-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
                  {unit.unit_kind}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
                  {unit.public_name ?? unit.unit_kind}
                </h1>
                <div className="font-mono text-xs text-stone-500 mt-1">{unit.unit_code}</div>
                {unit.description && (
                  <p className="text-stone-600 text-sm leading-relaxed mt-4">{unit.description}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <Feature icon={<Users className="w-4 h-4" />} label={`${unit.max_guests} guests`} />
                  <Feature icon={<BedDouble className="w-4 h-4" />} label={`${unit.beds} beds`} />
                  <Feature icon={<Bath className="w-4 h-4" />} label={`${unit.bathrooms} baths`} />
                  <Feature
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    label={unit.pet_policy === "allowed" ? "Pet-friendly" : "No pets"}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sticky top-28">
                <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Check availability</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Check-in</label>
                    <input
                      type="date"
                      min={today}
                      value={checkin}
                      onChange={(e) => setCheckin(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Check-out</label>
                    <input
                      type="date"
                      min={addDays(checkin, 1)}
                      value={checkout}
                      onChange={(e) => setCheckout(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Adults</label>
                      <input
                        type="number"
                        min={1}
                        value={adults}
                        onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Children</label>
                      <input
                        type="number"
                        min={0}
                        value={children}
                        onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {quote && (
                  <div className="mt-5 bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>{nights} night(s) × room</span>
                      <span>${(quote.subtotal_cents / 100).toFixed(2)}</span>
                    </div>
                    {quote.fees_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Fees</span>
                        <span>${(quote.fees_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {quote.taxes_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Taxes</span>
                        <span>${(quote.taxes_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200">
                      <span>Total</span>
                      <span>${(quote.total_cents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {isAvailable ? (
                  <Link
                    to="/booking/review"
                    search={{
                      unit_id: unitId,
                      checkin,
                      checkout,
                      adults,
                      children,
                      total_cents: quote?.total_cents ?? 0,
                    }}
                    className="mt-5 w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    Reserve <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-center">
                    Not available for these dates. Try different dates.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-stone-700">
      <span className="text-[#2a382c]">{icon}</span>
      {label}
    </div>
  );
}