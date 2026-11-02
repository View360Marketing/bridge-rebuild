import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  getOperationsStatsFn,
  getArrivalsFn,
  getDeparturesFn,
} from "@/lib/booking/operations.functions";
import { listAllPropertyEventsFn } from "@/lib/booking/seasonal.functions";
import { listReservationsFn } from "@/lib/booking/reservations.functions";
import { getEffectivePermissionsFn } from "@/lib/booking/permissions.functions";
import { todayPropertyLocal, addDays, parseDate, formatDate } from "@/lib/booking/dates";
import {
  CalendarDays,
  LogIn,
  LogOut,
  BedDouble,
  DollarSign,
  Sparkles,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  Users,
  Clock,
  MapPin,
  ClipboardList,
} from "lucide-react";

type PropertyEvent = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  event_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  is_active: boolean;
  is_tentative?: boolean | null;
  is_confirmed?: boolean | null;
};

type ReservationRow = {
  id: string;
  booking_reference: string;
  guest_id: string | null;
  source: string;
  status: string;
  currency: string;
  total_cents: number;
  paid_cents: number;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  group_id: string | null;
  version: number;
  created_at: string;
  guests?: { name: string | null; email: string | null; phone: string | null }[];
};

export const Route = createFileRoute("/_authenticated/admin/manager-dashboard")({
  head: () => ({
    meta: [
      { title: "Manager Dashboard | The Bridges Admin" },
      {
        name: "description",
        content: "Daily operations dashboard for The Bridges property managers.",
      },
    ],
  }),
  component: ManagerDashboardPage,
});

function ManagerDashboardPage() {
  const fetchPerms = useServerFn(getEffectivePermissionsFn);
  const fetchStats = useServerFn(getOperationsStatsFn);
  const fetchArrivals = useServerFn(getArrivalsFn);
  const fetchDepartures = useServerFn(getDeparturesFn);
  const fetchEvents = useServerFn(listAllPropertyEventsFn);
  const fetchReservations = useServerFn(listReservationsFn);

  const perms = useQuery({ queryKey: ["effective-perms"], queryFn: fetchPerms });
  const stats = useQuery({
    queryKey: ["ops-stats", "today"],
    queryFn: () => fetchStats({ data: {} }),
  });
  const arrivals = useQuery({
    queryKey: ["arrivals", "today"],
    queryFn: () => fetchArrivals({ data: {} }),
  });
  const departures = useQuery({
    queryKey: ["departures", "today"],
    queryFn: () => fetchDepartures({ data: {} }),
  });
  const events = useQuery({ queryKey: ["admin-events"], queryFn: fetchEvents });
  const reservations = useQuery({
    queryKey: ["reservations", "upcoming"],
    queryFn: () => fetchReservations({ data: { limit: 8 } }),
  });

  const today = todayPropertyLocal();
  const in30 = addDays(today, 30);

  const role = perms.data?.role ?? "guest";
  const isPreview = perms.data?.isPreview ?? false;
  const permissions = perms.data?.permissions;

  // Upcoming active events within 30 days.
  const upcomingEvents = ((events.data as PropertyEvent[] | undefined) ?? [])
    .filter((e) => e.is_active && e.event_date >= today && e.event_date <= in30)
    .sort((a, b) => (a.event_date < b.event_date ? -1 : 1))
    .slice(0, 6);

  // Upcoming confirmed reservations (arriving today or later).
  const upcomingReservations = ((reservations.data as ReservationRow[] | undefined) ?? [])
    .filter(
      (r) =>
        r.checkin_date >= today &&
        ["confirmed", "pending_payment", "held", "checked_in"].includes(r.status),
    )
    .sort((a, b) => (a.checkin_date < b.checkin_date ? -1 : 1))
    .slice(0, 6);

  const money = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          {isPreview ? "Manager Dashboard (preview)" : "Manager Dashboard"}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {formatDate(parseDate(today))} · America/Chicago · The Bridges, Waynesboro TN
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Arrivals"
          value={stats.data?.arrivals ?? 0}
          icon={<LogIn className="w-5 h-5" />}
          accent="text-emerald-700 bg-emerald-50"
        />
        <StatCard
          label="Today's Departures"
          value={stats.data?.departures ?? 0}
          icon={<LogOut className="w-5 h-5" />}
          accent="text-sky-700 bg-sky-50"
        />
        <StatCard
          label="In House"
          value={stats.data?.inHouse ?? 0}
          icon={<BedDouble className="w-5 h-5" />}
          accent="text-[#2a382c] bg-[#2a382c]/10"
        />
        <StatCard
          label="Available Rooms"
          value={stats.data?.availableRooms ?? 0}
          icon={<Sparkles className="w-5 h-5" />}
          accent="text-stone-700 bg-stone-100"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard
          label="Pending Holds"
          value={stats.data?.pendingHolds ?? 0}
          icon={<Clock className="w-5 h-5" />}
          accent="text-amber-700 bg-amber-50"
        />
        <StatCard
          label="Outstanding Balance"
          value={money(stats.data?.outstandingBalanceCents ?? 0)}
          icon={<DollarSign className="w-5 h-5" />}
          accent="text-rose-700 bg-rose-50"
          isText
        />
        <StatCard
          label="Maintenance Blocks"
          value={stats.data?.maintenanceBlocks ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="text-orange-700 bg-orange-50"
        />
        <StatCard
          label="Dirty Rooms"
          value={stats.data?.dirtyRooms ?? 0}
          icon={<Sparkles className="w-5 h-5" />}
          accent="text-stone-700 bg-stone-100"
        />
      </div>

      {/* Quick links to permitted modules */}
      <div className="mt-6 flex flex-wrap gap-2">
        {permissions && permissions.calendar !== "none" && (
          <QuickLink
            to="/admin/calendar"
            label="Lodging Calendar"
            icon={<CalendarDays className="w-4 h-4" />}
          />
        )}
        {permissions && permissions.events !== "none" && (
          <QuickLink
            to="/admin/events"
            label="Manage Events"
            icon={<Megaphone className="w-4 h-4" />}
          />
        )}
        {permissions && permissions.reservations !== "none" && (
          <QuickLink
            to="/admin/reservations"
            label="Reservations"
            icon={<ClipboardList className="w-4 h-4" />}
          />
        )}
        {permissions && permissions.guests !== "none" && (
          <QuickLink to="/admin/guests" label="Guests" icon={<Users className="w-4 h-4" />} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Today's schedule */}
        <Panel title="Today's Schedule" subtitle={formatDate(parseDate(today))}>
          <div className="space-y-4">
            <ScheduleGroup
              label="Arrivals"
              icon={<LogIn className="w-4 h-4 text-emerald-600" />}
              empty="No arrivals scheduled today."
            >
              {(arrivals.data ?? []).map((a) => (
                <ScheduleRow
                  key={a.reservation_id}
                  primary={a.guest_name ?? a.booking_reference}
                  secondary={`${a.unit_code ?? "—"} · ${a.checkin_date} → ${a.checkout_date}`}
                  badge={a.status}
                  balance={a.balance_cents > 0 ? money(a.balance_cents) : undefined}
                />
              ))}
            </ScheduleGroup>
            <ScheduleGroup
              label="Departures"
              icon={<LogOut className="w-4 h-4 text-sky-600" />}
              empty="No departures scheduled today."
            >
              {(departures.data ?? []).map((d) => (
                <ScheduleRow
                  key={d.reservation_id}
                  primary={d.guest_name ?? d.booking_reference}
                  secondary={`${d.unit_code ?? "—"} · departs ${d.checkout_date}`}
                  badge={d.status}
                  balance={d.balance_cents > 0 ? `${money(d.balance_cents)} due` : undefined}
                />
              ))}
            </ScheduleGroup>
          </div>
        </Panel>

        {/* Upcoming events */}
        <Panel title="Upcoming Events" subtitle="Next 30 days">
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-8 h-8" />}
              text="No upcoming events in the next 30 days."
              action={
                permissions && permissions.events !== "none" ? (
                  <Link
                    to="/admin/events"
                    className="text-sm font-medium text-[#2a382c] hover:underline inline-flex items-center gap-1"
                  >
                    Add an event <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-2.5">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-[#2a382c] text-white rounded-lg py-1.5">
                    <span className="text-[10px] uppercase tracking-wider opacity-80">
                      {new Date(e.event_date + "T00:00:00Z").toLocaleDateString("en-US", {
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(e.event_date + "T00:00:00Z").getUTCDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-stone-900 text-sm">{e.title}</h4>
                      {e.is_tentative && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Tentative
                        </span>
                      )}
                      {!e.is_active && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    {e.subtitle && (
                      <p className="text-xs text-[#3e5340] font-medium">{e.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500 flex-wrap">
                      {e.start_time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {e.start_time}
                          {e.end_time ? `–${e.end_time}` : ""}
                        </span>
                      )}
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {permissions && permissions.events !== "none" && (
                <Link
                  to="/admin/events"
                  className="text-sm font-medium text-[#2a382c] hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Manage all events <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* Upcoming reservations */}
      <div className="mt-5">
        <Panel title="Upcoming Reservations" subtitle="Next arrivals">
          {upcomingReservations.length === 0 ? (
            <EmptyState
              icon={<BedDouble className="w-8 h-8" />}
              text="No upcoming reservations."
              action={
                permissions && permissions.reservations !== "none" ? (
                  <Link
                    to="/admin/reservations"
                    className="text-sm font-medium text-[#2a382c] hover:underline inline-flex items-center gap-1"
                  >
                    View reservations <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                    <th className="px-2 py-2 font-medium">Guest</th>
                    <th className="px-2 py-2 font-medium">Ref</th>
                    <th className="px-2 py-2 font-medium">Check-in</th>
                    <th className="px-2 py-2 font-medium">Check-out</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingReservations.map((r) => (
                    <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="px-2 py-2 font-medium text-stone-800">
                        {r.guests?.[0]?.name ?? "—"}
                      </td>
                      <td className="px-2 py-2 font-mono text-xs text-stone-500">
                        {r.booking_reference}
                      </td>
                      <td className="px-2 py-2 text-stone-600">{r.checkin_date}</td>
                      <td className="px-2 py-2 text-stone-600">{r.checkout_date}</td>
                      <td className="px-2 py-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Massage bookings note */}
      <div className="mt-5 bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a382c]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#2a382c]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Massage Bookings</h3>
            <p className="text-sm text-stone-600 mt-1">
              Massage appointments are booked by phone or text with Jessica at{" "}
              <a href="tel:+19319811281" className="text-[#2a382c] font-semibold underline">
                931-981-1281
              </a>
              . There is no online scheduling system connected, so appointments are not shown here.
              Guests are directed to call or text to schedule.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  isText,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
        <span className={`p-1.5 rounded-lg ${accent}`}>{icon}</span>
      </div>
      <p className={`mt-2 font-bold text-stone-900 ${isText ? "text-xl" : "text-3xl"}`}>{value}</p>
    </div>
  );
}

function QuickLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-stone-900">{title}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ScheduleGroup({
  label,
  icon,
  empty,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-stone-700">{label}</h4>
      </div>
      {hasChildren ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <p className="text-sm text-stone-400 pl-6">{empty}</p>
      )}
    </div>
  );
}

function ScheduleRow({
  primary,
  secondary,
  badge,
  balance,
}: {
  primary: string;
  secondary: string;
  badge: string;
  balance: string | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-100">
      <div className="min-w-0">
        <p className="font-medium text-stone-800 text-sm truncate">{primary}</p>
        <p className="text-xs text-stone-500">{secondary}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {balance ? <span className="text-xs font-semibold text-rose-600">{balance}</span> : null}
        <StatusBadge status={badge} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    checked_in: "bg-sky-100 text-sky-700",
    checked_out: "bg-stone-100 text-stone-500",
    held: "bg-amber-100 text-amber-700",
    pending_payment: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
    expired: "bg-stone-100 text-stone-500",
    no_show: "bg-rose-100 text-rose-700",
  };
  const cls = map[status] ?? "bg-stone-100 text-stone-600";
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({
  icon,
  text,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300 mx-auto mb-3">
        {icon}
      </div>
      <p className="text-sm text-stone-500">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
