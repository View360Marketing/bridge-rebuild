import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOccupancyReportFn,
  getFinancialReportFn,
  getSourceReportFn,
  getArrivalsDeparturesReportFn,
} from "@/lib/booking/operations.functions";
import { todayPropertyLocal, addDays } from "@/lib/booking/dates";
import { BarChart3, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports | The Bridges Admin" },
      { name: "description", content: "Occupancy, revenue, and financial reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [tab, setTab] = useState<"occupancy" | "financial" | "source" | "arrivals">("occupancy");
  const [from, setFrom] = useState(addDays(todayPropertyLocal(), -30));
  const [to, setTo] = useState(todayPropertyLocal());

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Reports</h1>
        <p className="text-sm text-stone-500 mt-1">
          Occupancy, revenue, and arrivals by date range.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-stone-200">
        <TabBtn
          active={tab === "occupancy"}
          label="Occupancy"
          onSelect={() => setTab("occupancy")}
        />
        <TabBtn
          active={tab === "financial"}
          label="Financial"
          onSelect={() => setTab("financial")}
        />
        <TabBtn
          active={tab === "source"}
          label="Booking Source"
          onSelect={() => setTab("source")}
        />
        <TabBtn
          active={tab === "arrivals"}
          label="Arrivals/Departures"
          onSelect={() => setTab("arrivals")}
        />
      </div>

      {tab === "occupancy" && <OccupancyReport from={from} to={to} />}
      {tab === "financial" && <FinancialReport from={from} to={to} />}
      {tab === "source" && <SourceReport from={from} to={to} />}
      {tab === "arrivals" && <ArrivalsReport from={from} to={to} />}
    </>
  );
}

function OccupancyReport({ from, to }: { from: string; to: string }) {
  const fn = useServerFn(getOccupancyReportFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report-occupancy", from, to],
    queryFn: () => fn({ data: { from, to } }),
    enabled: !!from && !!to,
  });
  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;
  if (!data) return null;
  const rows = data ?? [];
  const occupied = rows.reduce((s, d) => s + d.occupiedNights, 0);
  const eligible = rows.reduce((s, d) => s + d.eligibleNights, 0);
  const pct = eligible > 0 ? ((occupied / eligible) * 100).toFixed(1) : "0.0";
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
        <p className="font-medium">How occupancy is calculated</p>
        <p className="mt-1 text-amber-800">
          Occupied room-nights ÷ eligible sellable room-nights. Maintenance and owner blocks reduce
          the denominator; holds are not sold nights.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Occupied room-nights" value={occupied} />
        <Stat label="Eligible room-nights" value={eligible} />
        <Stat label="Occupancy %" value={`${pct}%`} />
      </div>
    </div>
  );
}

function FinancialReport({ from, to }: { from: string; to: string }) {
  const fn = useServerFn(getFinancialReportFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report-financial", from, to],
    queryFn: () => fn({ data: { from, to } }),
    enabled: !!from && !!to,
  });
  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
        <p className="font-medium">Revenue basis</p>
        <p className="mt-1 text-amber-800">
          ADR = room revenue ÷ sold nights (excludes taxes & non-room fees). RevPAR = room revenue ÷
          eligible room-nights. A deposit and its balance are one reservation, not two sales.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Room revenue" value={`$${((data.roomRevenueCents ?? 0) / 100).toFixed(2)}`} />
        <Stat label="Sold nights" value={data.occupiedNights ?? 0} />
        <Stat label="ADR" value={`$${((data.adrCents ?? 0) / 100).toFixed(2)}`} />
        <Stat label="RevPAR" value={`$${((data.revparCents ?? 0) / 100).toFixed(2)}`} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Payments collected"
          value={`$${((data.paymentsCollectedCents ?? 0) / 100).toFixed(2)}`}
        />
        <Stat label="Refunds" value={`$${((data.refundsCents ?? 0) / 100).toFixed(2)}`} />
        <Stat
          label="Outstanding"
          value={`$${((data.outstandingBalanceCents ?? 0) / 100).toFixed(2)}`}
        />
        <Stat
          label="Tax collected"
          value={`$${((data.taxesCollectedCents ?? 0) / 100).toFixed(2)}`}
        />
      </div>
    </div>
  );
}

function SourceReport({ from, to }: { from: string; to: string }) {
  const fn = useServerFn(getSourceReportFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report-source", from, to],
    queryFn: () => fn({ data: { from, to } }),
    enabled: !!from && !!to,
  });
  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;
  if (!data || (Array.isArray(data) && data.length === 0))
    return (
      <EmptyState title="No bookings in range" body="No reservations fall in this date range." />
    );
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Source</th>
            <th className="text-left px-4 py-3">Bookings</th>
            <th className="text-left px-4 py-3">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {(Array.isArray(data) ? data : []).map((r: Record<string, unknown>, i: number) => (
            <tr key={i}>
              <td className="px-4 py-3 capitalize">{String(r["source"] ?? "—")}</td>
              <td className="px-4 py-3">{Number(r["count"] ?? 0)}</td>
              <td className="px-4 py-3">${(Number(r["revenue_cents"] ?? 0) / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArrivalsReport({ from, to }: { from: string; to: string }) {
  const fn = useServerFn(getArrivalsDeparturesReportFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["report-arrivals", from, to],
    queryFn: () => fn({ data: { from, to } }),
    enabled: !!from && !!to,
  });
  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Arrivals" value={data.arrivals ?? 0} />
      <Stat label="Departures" value={data.departures ?? 0} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-stone-900 mt-2">{value}</p>
    </div>
  );
}

function TabBtn({
  active,
  label,
  onSelect,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-[#2a382c] text-[#2a382c]"
          : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
      <p className="font-medium text-stone-800">{title}</p>
      <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">{body}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm">
      <p className="font-medium">Unable to load</p>
      <p className="mt-1 text-rose-700">{message}</p>
    </div>
  );
}

const inputCls =
  "border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a382c]";
