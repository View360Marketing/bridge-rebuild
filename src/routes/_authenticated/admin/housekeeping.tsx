import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, CalendarDays, ClipboardList, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/housekeeping")({
  head: () => ({
    meta: [
      { title: "Housekeeping | The Bridges Admin" },
      { name: "description", content: "Room readiness, turnover tasks, and maintenance blocks." },
    ],
  }),
  component: HousekeepingPage,
});

function HousekeepingPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Housekeeping</h1>
          <p className="text-sm text-stone-500 mt-1">Room readiness &amp; turnover</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-2xl mx-auto">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2a382c]/10">
          <Sparkles className="h-8 w-8 text-[#2a382c]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Housekeeping is on the way</h2>
        <p className="text-sm text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
          Room readiness tracking, turnover task assignment, inspection workflows, and
          maintenance-block management are being finalized. Existing housekeeping records and
          reservation relationships are preserved and will appear here once the workflow is
          released.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Link
            to="/admin/calendar"
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <CalendarDays className="w-4 h-4" /> View Calendar
          </Link>
          <Link
            to="/admin/reservations"
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ClipboardList className="w-4 h-4" /> Reservations
          </Link>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-[#2a382c] hover:underline"
        >
          Back to overview <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
