import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { searchAvailabilityFn } from "@/lib/booking/reservations.functions";
import { listPublishedUnitsFn, getInventoryAuthorityFn } from "@/lib/booking/rooms.functions";
import { todayPropertyLocal, addDays, nightCount } from "@/lib/booking/dates";
import { BedDouble, Users, Bath, Search, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/stay/")({
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
  component: StayIndexPage,
});

function StayIndexPage() {
  const listPublishedUnits = useServerFn(listPublishedUnitsFn);
  const searchAvail = useServerFn(searchAvailabilityFn);
  const getAuthority = useServerFn(getInventoryAuthorityFn);

  const today = todayPropertyLocal();
  const [checkin, setCheckin] = useState(addDays(today, 1));
  const [checkout, setCheckout] = useState(addDays(today, 3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [searched, setSearched] = useState(false);

  const { data: allUnits } = useQuery({
    queryKey: ["stay-units"],
    queryFn: listPublishedUnits,
  });

  const { data: authority } = useQuery({
    queryKey: ["inventory-authority"],
    queryFn: getAuthority,
  });

  const { data: avail, isFetching: searching } = useQuery({
    queryKey: ["stay-avail", checkin, checkout, adults, children, rooms],
    enabled: searched,
    queryFn: () =>
      searchAvail({
        data: { checkin_date: checkin, checkout_date: checkout, adults, children, rooms },
      }),
  });

  const nights = nightCount(checkin, checkout);
  const instantBooking = authority?.instantBooking ?? false;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (checkin >= checkout) return;
    setSearched(true);
  }

  const units = searched ? (avail?.available ?? []) : (allUnits ?? []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      {/* Search hero */}
      <section className="bg-[#2a382c] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Stay at The Bridges</h1>
          <p className="text-white/80 text-sm max-w-2xl">
            Search real availability across our cabins, guest rooms, and RV sites near Tennessee's
            Natural Bridge.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 bg-white rounded-2xl p-4 sm:p-5 shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            <Field label="Check-in">
              <input
                type="date"
                min={today}
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="stay-input"
              />
            </Field>
            <Field label="Check-out">
              <input
                type="date"
                min={addDays(checkin, 1)}
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="stay-input"
              />
            </Field>
            <Field label="Adults">
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                className="stay-input"
              />
            </Field>
            <Field label="Children">
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                className="stay-input"
              />
            </Field>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-5 py-2.5 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {searched ? "Available accommodation" : "Our accommodation"}
            </h2>
            <div className="text-sm text-stone-500">
              {searched
                ? `${units.length} room(s) · ${nights} night(s)`
                : `${allUnits?.length ?? 0} published room(s)`}
            </div>
          </div>

          {!instantBooking && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                Instant booking is not yet enabled. You can reserve dates and we'll send a secure
                payment link to confirm your stay.
              </span>
            </div>
          )}

          {searching && <p className="text-stone-500 text-sm">Searching availability…</p>}

          {!searching && units.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
              <p className="font-serif text-xl text-stone-900 mb-2">No rooms available</p>
              <p className="text-sm text-stone-500">
                {searched
                  ? "Try different dates or fewer guests. You can also call us at 931-722-5589."
                  : "Rooms will appear here once published."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                id={unit.id}
                unit_code={unit.unit_code}
                public_name={unit.public_name}
                unit_kind={unit.unit_kind}
                max_guests={unit.max_guests}
                beds={unit.beds ?? 1}
                bathrooms={unit.bathrooms ?? 1}
                pet_policy={unit.pet_policy}
                base_rate_cents={unit.base_rate_cents}
                description={unit.description}
                checkin={checkin}
                checkout={checkout}
                adults={adults}
                children={children}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

type UnitCardProps = {
  id: string;
  unit_code: string;
  public_name: string | null;
  unit_kind: string;
  max_guests: number;
  beds: number;
  bathrooms: number;
  pet_policy: string;
  base_rate_cents: number;
  description: string | null;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
};

function UnitCard(props: UnitCardProps) {
  const petFriendly = props.pet_policy === "pets_allowed" || props.pet_policy === "pets_negotiable";
  return (
    <Link
      to="/stay/$unitId"
      params={{ unitId: props.id }}
      search={{
        checkin: props.checkin,
        checkout: props.checkout,
        adults: props.adults,
        children: props.children,
      }}
      className="group bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-[#2a382c] to-[#3e5340] flex items-center justify-center">
        <BedDouble className="w-14 h-14 text-white/30" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#3e5340]">
          {props.unit_kind}
        </span>
        <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
          {props.public_name ?? props.unit_kind}
        </h3>
        <div className="font-mono text-xs text-stone-400 mt-0.5">{props.unit_code}</div>
        {props.description && (
          <p className="text-sm text-stone-600 mt-2 line-clamp-2">{props.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-stone-600">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {props.max_guests}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> {props.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" /> {props.bathrooms}
          </span>
          {petFriendly && <span className="text-[#3e5340] font-semibold">Pet-friendly</span>}
        </div>
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          {props.base_rate_cents > 0 ? (
            <span className="text-sm">
              <span className="font-bold text-stone-900">
                ${(props.base_rate_cents / 100).toFixed(0)}
              </span>
              <span className="text-stone-500"> / night</span>
            </span>
          ) : (
            <span className="text-sm text-stone-500">Call for rates</span>
          )}
          <span className="text-[#2a382c] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            View <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
