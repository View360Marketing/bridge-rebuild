import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { searchAvailabilityFn, computeQuoteFn, getStripeConfigStatusFn } from "@/lib/booking/payments.functions";
import { listUnitsFn } from "@/lib/booking/rooms.functions";
import { todayPropertyLocal, addDays, nightCount } from "@/lib/booking/dates";
import { ArrowRight, Search, BedDouble, Users, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/stay")({
  head: () => ({
    meta: [
      { title: "Stay at The Bridges | Waynesboro, TN Lodging" },
      {
        name: "description",
        content:
          "Search real availability and book your stay at The Bridges. Cabins, guest rooms, and RV sites near Tennessee's Natural Bridge.",
      },
    ],
  }),
  component: StayPage,
});

function StayPage() {
  const searchAvail = useServerFn(searchAvailabilityFn);
  const listUnits = useServerFn(listUnitsFn);
  const getStripeStatus = useServerFn(getStripeConfigStatusFn);

  const today = todayPropertyLocal();
  const [checkin, setCheckin] = useState(addDays(today, 1));
  const [checkout, setCheckout] = useState(addDays(today, 3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [searched, setSearched] = useState(false);

  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-config"],
    queryFn: getStripeStatus,
  });

  const { data: allUnits } = useQuery({
    queryKey: ["stay-units"],
    queryFn: listUnits,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ["stay-search", checkin, checkout, adults, children, rooms],
    enabled: searched,
    queryFn: () =>
      searchAvail({
        data: { checkin_date: checkin, checkout_date: checkout, adults, children, rooms },
      }),
  });

  const nights = nightCount(checkin, checkout);
  const publishedUnits = (allUnits ?? []).filter((u) => u.is_published && !u.is_archived);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-16 bg-[#2a382c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cadbbf]">STAY AT THE BRIDGES</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mt-2">Find Your Perfect Stay</h1>
          <p className="text-stone-200 text-sm sm:text-base mt-3 max-w-2xl font-light">
            Search real availability across our cabins, guest rooms, and RV sites — all near Tennessee's Natural Bridge.
          </p>
        </div>
      </section>

      <section className="py-10 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Check-out</label>
                <input
                  type="date"
                  min={addDays(checkin, 1)}
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Nights</label>
                <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700">
                  {nights}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Adults</label>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Children</label>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Rooms</label>
                <input
                  type="number"
                  min={1}
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={() => setSearched(true)}
                  disabled={isLoading}
                  className="w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Search className="w-4 h-4" />
                  {isLoading ? "Searching…" : "Search Availability"}
                </button>
              </div>
            </div>

            {!stripeStatus?.configured && (
              <div className="mt-5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Online payment is not yet enabled. You can browse availability and request a stay; our team will
                  confirm and send a secure payment link.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searched && isLoading && (
            <p className="text-sm text-stone-500">Searching availability…</p>
          )}

          {searched && !isLoading && results && results.available.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-stone-900">No availability for these dates</h3>
              <p className="text-sm text-stone-600 mt-2">
                Try different dates or{" "}
                <Link to="/contact-us" className="text-[#2a382c] font-semibold underline">
                  contact us
                </Link>{" "}
                for help planning a group stay.
              </p>
            </div>
          )}

          {searched && !isLoading && results && results.available.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.available.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  checkin={checkin}
                  checkout={checkout}
                  adults={adults}
                  children={children}
                />
              ))}
            </div>
          )}

          {!searched && publishedUnits.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Available Accommodation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    checkin={checkin}
                    checkout={checkout}
                    adults={adults}
                    children={children}
                  />
                ))}
              </div>
            </div>
          )}

          {!searched && publishedUnits.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
              <BedDouble className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-stone-900">Rooms coming soon</h3>
              <p className="text-sm text-stone-600 mt-2">
                We're preparing our online availability. In the meantime,{" "}
                <Link to="/contact-us" className="text-[#2a382c] font-semibold underline">
                  contact us
                </Link>{" "}
                to book your stay.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function UnitCard({
  unit,
  checkin,
  checkout,
  adults,
  children,
}: {
  unit: {
    id: string;
    unit_code: string;
    public_name: string | null;
    unit_kind: string;
    max_guests: number;
    max_adults: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    pet_policy: string;
    base_rate_cents: number;
    description: string | null;
  };
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
}) {
  const computeQuote = useServerFn(computeQuoteFn);
  const { data: quote } = useQuery({
    queryKey: ["unit-quote", unit.id, checkin, checkout, adults, children],
    queryFn: () =>
      computeQuote({
        data: {
          units: [
            {
              unit_id: unit.id,
              unit_code: unit.unit_code,
              base_rate_cents: unit.base_rate_cents,
              max_adults: unit.max_adults,
              max_children: unit.max_guests - unit.max_adults,
            },
          ],
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
        },
      }),
  });

  return (
    <Link
      to="/stay/$unitId"
      params={{ unitId: unit.id }}
      search={{ checkin, checkout, adults, children }}
      className="group bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-[#2a382c] to-[#3e5340] relative">
        <div className="absolute inset-0 flex items-center justify-center text-white/30">
          <BedDouble className="w-12 h-12" />
        </div>
        <span className="absolute top-3 left-3 bg-white/90 text-[#2a382c] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {unit.unit_kind}
        </span>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <div className="font-mono text-[11px] text-stone-500">{unit.unit_code}</div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            {unit.public_name ?? unit.unit_kind}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-stone-600">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {unit.max_guests} guests
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {unit.beds} beds
          </span>
          {unit.pet_policy === "allowed" && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2a382c]" /> Pet-friendly
            </span>
          )}
        </div>
        {quote && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <div className="text-xs text-stone-500">From</div>
              <div className="font-serif text-xl font-bold text-[#2a382c]">
                ${(quote.total_cents / 100).toFixed(0)}
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#2a382c] group-hover:gap-2 transition-all">
              View details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}