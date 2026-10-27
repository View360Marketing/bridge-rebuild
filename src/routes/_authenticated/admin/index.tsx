import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardStats, getCurrentStaff } from "@/lib/booking/admin.functions";
import { Building2, BedDouble, CheckCircle2, AlertTriangle, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview | The Bridges" },
      { name: "description", content: "Property management overview for The Bridges." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getDashboardStats);
  const fetchStaff = useServerFn(getCurrentStaff);
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
  const staff = useQuery({ queryKey: ["admin-staff"], queryFn: fetchStaff });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Overview</h1>
          <p className="text-sm text-stone-500 mt-1">
            {staff.data?.email ?? "Staff"} · {staff.data?.roles.join(", ") || "no role"}
          </p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg px-3 py-2"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Setup status banner */}
      <SetupBanner stats={stats.data} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Properties"
          value={stats.data?.properties ?? 0}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Room Types"
          value={stats.data?.roomTypes ?? 0}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Units Configured"
          value={stats.data?.unitsConfigured ?? 0}
          icon={<BedDouble className="w-5 h-5" />}
        />
        <StatCard
          label="Units Published"
          value={stats.data?.unitsPublished ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <StatCard
          label="Expected Rooms"
          value={stats.data?.expectedRoomCount ?? 33}
          icon={<Settings className="w-5 h-5" />}
        />
        <StatCard
          label="Temporarily Closed"
          value={stats.data?.unitsClosed ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Inventory Authority
            </p>
            <p className="text-lg font-bold text-stone-900 mt-1 capitalize">
              {(stats.data?.inventoryAuthority ?? "UNRESOLVED").replace("_", " ")}
            </p>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Instant booking: {stats.data?.instantBookingEnabled ? "ON" : "OFF"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/admin/rooms"
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
        >
          Manage Rooms & Properties
        </Link>
      </div>

      {stats.isError && (
        <p className="text-sm text-red-600 mt-4">
          Unable to load stats: {(stats.error as Error).message}
        </p>
      )}
    </>
  );
}

function SetupBanner({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getDashboardStats>> | undefined;
}) {
  if (!stats) return null;
  const configured = stats.unitsConfigured ?? 0;
  const expected = stats.expectedRoomCount ?? 33;
  const authority = stats.inventoryAuthority ?? "UNRESOLVED";
  const needsSetup = authority === "UNRESOLVED" || configured < expected;

  if (!needsSetup) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-sm">
        ✅ {configured} of {expected} expected rooms configured. Inventory authority:{" "}
        {authority.replace("_", " ")}.
      </div>
    );
  }
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-sm space-y-1">
      <p className="font-semibold">Setup in progress</p>
      <p>
        {configured} of {expected} expected rooms configured.
      </p>
      {authority === "UNRESOLVED" && (
        <p>
          Inventory authority is unresolved — instant booking stays OFF until confirmed (Stage 5).
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
        <span className="text-[#2a382c]">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-stone-900 mt-2">{value}</p>
    </div>
  );
}
