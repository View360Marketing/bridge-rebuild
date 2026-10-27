import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/booking/admin.functions";
import {
  Settings,
  Building2,
  BedDouble,
  DollarSign,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings | The Bridges Admin" },
      { name: "description", content: "Property configuration and booking readiness." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;

  const steps = [
    {
      label: "Property details",
      done: (stats?.properties ?? 0) > 0,
      to: "/admin/rooms",
      icon: Building2,
    },
    { label: "Room types", done: (stats?.roomTypes ?? 0) > 0, to: "/admin/rooms", icon: BedDouble },
    {
      label: "Physical rooms & photos",
      done: (stats?.unitsConfigured ?? 0) > 0,
      to: "/admin/rooms",
      icon: BedDouble,
    },
    { label: "Rates & restrictions", done: false, to: "/admin/rates", icon: DollarSign },
    { label: "Approved policies", done: false, to: "/admin/rates", icon: ShieldCheck },
    {
      label: "Existing reservations & blocks",
      done: false,
      to: "/admin/calendar",
      icon: CalendarDays,
    },
  ];

  const configured = stats?.unitsConfigured ?? 0;
  const expected = stats?.expectedRoomCount ?? 33;
  const authority = stats?.inventoryAuthority ?? "UNRESOLVED";

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Settings & Setup</h1>
        <p className="text-sm text-stone-500 mt-1">
          Property configuration, booking rules, and launch readiness.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Owner Setup Workflow</h2>
        <p className="text-sm text-stone-600 mb-4">
          Configure the property in order. Each step links to its screen. You do not need to write
          SQL.
        </p>
        <div className="space-y-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={i}
                to={s.to}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 hover:border-[#2a382c]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <Icon className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-800">{s.label}</span>
                </div>
                {s.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-amber-600">Pending</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            Property Timezone
          </p>
          <p className="text-lg font-bold text-stone-900 mt-1">America/Chicago</p>
          <p className="text-xs text-stone-500 mt-2">Currency: USD</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            Inventory Authority
          </p>
          <p className="text-lg font-bold text-stone-900 mt-1 capitalize">
            {authority.replace(/_/g, " ")}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Instant booking: {stats?.instantBookingEnabled ? "ON" : "OFF"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Room Count</p>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {configured} / {expected} configured
          </p>
          <p className="text-xs text-stone-500 mt-2">{stats?.unitsPublished ?? 0} published</p>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-medium text-amber-900">Launch Readiness</h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-800">
          <li className="flex items-center gap-2">
            {configured >= expected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-amber-400" />
            )}
            {configured} of {expected} expected rooms configured
          </li>
          <li className="flex items-center gap-2">
            {authority !== "UNRESOLVED" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-amber-400" />
            )}
            Inventory authority resolved
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-amber-400" />
            Stripe payment configured (test mode)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-amber-400" />
            Email/notifications configured
          </li>
        </ul>
        <p className="text-xs text-amber-700 mt-3">
          Public instant booking stays OFF until authority is resolved and payments are verified.
          External channel credentials remain pending where not supplied.
        </p>
      </div>
    </>
  );
}
