import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  buildCalendarFn,
  createBlockFn,
  createReservationFn,
  computeQuoteFn,
  staffSearchAvailabilityFn,
} from "@/lib/booking/reservations.functions";
import { listUnitsFn, listRoomTypesFn } from "@/lib/booking/rooms.functions";
import { addDays, formatDate, todayPropertyLocal } from "@/lib/booking/dates";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Ban, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar | The Bridges Admin" },
      { name: "description", content: "Reservation calendar for The Bridges." },
    ],
  }),
  component: CalendarPage,
});

const STATUS_COLORS: Record<string, string> = {
  free: "bg-stone-100",
  reservation: "bg-emerald-400",
  hold: "bg-amber-300",
  block: "bg-rose-400",
  group: "bg-sky-400",
};

function CalendarPage() {
  const qc = useQueryClient();
  const buildCalendar = useServerFn(buildCalendarFn);
  const listUnits = useServerFn(listUnitsFn);
  const listRoomTypes = useServerFn(listRoomTypesFn);

  const [start, setStart] = useState<string>(() => {
    const t = todayPropertyLocal();
    // align to start of week (Sunday)
    const d = new Date(t + "T00:00:00Z");
    const dow = d.getUTCDay();
    return addDays(t, -dow);
  });
  const days = 14;
  const end = addDays(start, days);

  const { data: cells, isLoading } = useQuery({
    queryKey: ["admin-calendar", start],
    queryFn: () => buildCalendar({ data: { start_date: start, end_date: end } }),
  });
  const { data: units } = useQuery({
    queryKey: ["admin-units"],
    queryFn: listUnits,
  });
  const { data: roomTypes } = useQuery({
    queryKey: ["admin-room-types"],
    queryFn: listRoomTypes,
  });

  const [filter, setFilter] = useState<string>("all");
  const [createCell, setCreateCell] = useState<{ unit_id: string; date: string } | null>(null);

  const unitRows = (units ?? []).filter((u) => !u.is_archived);
  const filteredUnits = unitRows.filter((u) => filter === "all" || u.unit_kind === filter);

  const dates: string[] = [];
  for (let i = 0; i < days; i++) dates.push(addDays(start, i));

  function cellFor(unitId: string, date: string) {
    return (cells ?? []).find((c) => c.unit_id === unitId && c.date === date);
  }

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-calendar"] });
  }

  return (
    <AdminShell active="calendar">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Calendar</h1>
          <p className="text-sm text-stone-500 mt-1">
            {formatDate(parseDate(start))} → {formatDate(parseDate(end))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStart(addDays(start, -7))}
            className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStart(todayPropertyLocal())}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-100"
          >
            Today
          </button>
          <button
            onClick={() => setStart(addDays(start, 7))}
            className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-stone-300 rounded-lg px-3 py-2"
        >
          <option value="all">All room kinds</option>
          <option value="room">Rooms</option>
          <option value="cabin">Cabins</option>
          <option value="rv_site">RV Sites</option>
          <option value="suite">Suites</option>
        </select>
        <div className="flex items-center gap-3 text-xs text-stone-600 ml-auto">
          <Legend color="bg-emerald-400" label="Reservation" />
          <Legend color="bg-amber-300" label="Hold" />
          <Legend color="bg-sky-400" label="Group" />
          <Legend color="bg-rose-400" label="Block" />
          <Legend color="bg-stone-100" label="Free" />
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading calendar…</p>}

      {cells && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 text-left px-3 py-2 border-b border-stone-200 min-w-[140px]">
                  Room
                </th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className={`px-1 py-2 border-b border-stone-200 text-center min-w-[44px] ${
                      d === todayPropertyLocal() ? "text-[#2a382c] font-bold" : "text-stone-500"
                    }`}
                  >
                    <div className="font-semibold">{d.slice(8)}</div>
                    <div className="text-[9px] uppercase">
                      {new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
                        weekday: "short",
                        timeZone: "UTC",
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="sticky left-0 bg-white z-10 px-3 py-2 border-b border-stone-100">
                    <div className="font-mono text-[11px] text-stone-700">{u.unit_code}</div>
                    <div className="text-stone-500 text-[10px]">{u.public_name || u.unit_kind}</div>
                  </td>
                  {dates.map((d) => {
                    const cell = cellFor(u.id, d);
                    const status = cell?.status ?? "free";
                    return (
                      <td key={d} className="px-1 py-2 border-b border-stone-100 text-center">
                        {status === "free" ? (
                          <button
                            onClick={() => setCreateCell({ unit_id: u.id, date: d })}
                            className="w-full h-7 rounded bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center"
                            aria-label={`Create booking for ${u.unit_code} on ${d}`}
                          >
                            <Plus className="w-3 h-3 text-stone-400" />
                          </button>
                        ) : (
                          <div
                            className={`w-full h-7 rounded ${STATUS_COLORS[status]} flex items-center justify-center`}
                            title={`${status}${cell?.reference ? ` · ${cell.reference}` : ""}`}
                          >
                            <span className="text-[9px] text-white/90 font-medium uppercase">
                              {status === "reservation" ? "res" : status.slice(0, 3)}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createCell && (
        <CreateBookingModal
          unitId={createCell.unit_id}
          date={createCell.date}
          units={units ?? []}
          roomTypes={roomTypes ?? []}
          onClose={() => setCreateCell(null)}
          onCreated={async () => {
            await refresh();
            setCreateCell(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded ${color}`} /> {label}
    </span>
  );
}

function parseDate(s: string): Date {
  const parts = s.split("-").map(Number);
  return new Date(Date.UTC(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1));
}

function CreateBookingModal({
  unitId,
  date,
  units,
  roomTypes,
  onClose,
  onCreated,
}: {
  unitId: string;
  date: string;
  units: {
    id: string;
    unit_code: string;
    public_name: string | null;
    base_rate_cents: number;
    max_adults: number;
    max_children: number;
  }[];
  roomTypes: { id: string; name: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const createReservation = useServerFn(createReservationFn);
  const computeQuote = useServerFn(computeQuoteFn);
  const searchAvail = useServerFn(staffSearchAvailabilityFn);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkin, setCheckin] = useState(date);
  const [checkout, setCheckout] = useState(addDays(date, 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [source, setSource] = useState("phone");
  const [quote, setQuote] = useState<{ total_cents: number; nights: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unit = units.find((u) => u.id === unitId);

  async function getQuote() {
    setError(null);
    try {
      const q = await computeQuote({
        data: {
          units: [
            {
              unit_id: unitId,
              unit_code: unit?.unit_code ?? "",
              base_rate_cents: unit?.base_rate_cents ?? 0,
              max_adults: unit?.max_adults ?? 2,
              max_children: unit?.max_children ?? 0,
            },
          ],
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
        },
      });
      setQuote({ total_cents: q.total_cents, nights: q.nights });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      // Re-verify availability before creating.
      const avail = await searchAvail({
        data: { checkin_date: checkin, checkout_date: checkout, adults, children, rooms: 1 },
      });
      if (!avail.available.some((u2) => u2.id === unitId)) {
        throw new Error("That room is no longer available for these dates.");
      }
      const q = await computeQuote({
        data: {
          units: [
            {
              unit_id: unitId,
              unit_code: unit?.unit_code ?? "",
              base_rate_cents: unit?.base_rate_cents ?? 0,
              max_adults: unit?.max_adults ?? 2,
              max_children: unit?.max_children ?? 0,
            },
          ],
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
        },
      });
      await createReservation({
        data: {
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          source,
          status: "confirmed",
          total_cents: q.total_cents,
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
          units: [
            { unit_id: unitId, checkin_date: checkin, checkout_date: checkout, adults, children },
          ],
        },
      });
      toast.success("Reservation created");
      onCreated();
    } catch (e) {
      setError((e as Error).message);
      toast.error((e as Error).message);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            New reservation · {unit?.unit_code}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Guest name *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={inputCls}
            />
            <input
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className={inputCls}
            />
            <input
              placeholder="Phone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className={inputCls}
            />
            <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
              <option value="phone">Phone</option>
              <option value="walk_in">Walk-in</option>
              <option value="direct">Direct</option>
            </select>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className={inputCls}
            />
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className={inputCls}
              placeholder="Adults"
            />
            <input
              type="number"
              min={0}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={inputCls}
              placeholder="Children"
            />
          </div>
          <button onClick={getQuote} className="text-sm text-[#2a382c] font-semibold underline">
            Get quote
          </button>
          {quote && (
            <div className="bg-stone-50 rounded-xl p-3 text-sm">
              {quote.nights} night(s) · total ${(quote.total_cents / 100).toFixed(2)}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving || !guestName}
              className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create reservation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30";
