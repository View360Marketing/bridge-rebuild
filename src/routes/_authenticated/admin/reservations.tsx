import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listReservationsFn,
  cancelReservationFn,
  checkInFn,
  checkOutFn,
  markNoShowFn,
} from "@/lib/booking/reservations.functions";
import { Search, Ban, LogIn, LogOut, UserX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations | The Bridges Admin" },
      { name: "description", content: "Manage reservations at The Bridges." },
    ],
  }),
  component: ReservationsPage,
});

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600",
  requested: "bg-sky-100 text-sky-700",
  held: "bg-amber-100 text-amber-700",
  pending_payment: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  checked_in: "bg-emerald-200 text-emerald-800",
  checked_out: "bg-stone-200 text-stone-700",
  cancelled: "bg-rose-100 text-rose-700",
  expired: "bg-stone-100 text-stone-500",
  no_show: "bg-rose-100 text-rose-700",
  exception_needs_review: "bg-red-100 text-red-700",
};

function ReservationsPage() {
  const qc = useQueryClient();
  const listReservations = useServerFn(listReservationsFn);
  const cancel = useServerFn(cancelReservationFn);
  const doCheckIn = useServerFn(checkInFn);
  const doCheckOut = useServerFn(checkOutFn);
  const doNoShow = useServerFn(markNoShowFn);

  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reservations", status, search],
    queryFn: () =>
      listReservations({
        data: {
          status: status || undefined,
          search: search || undefined,
          limit: 100,
        },
      }),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-reservations"] });
    await qc.invalidateQueries({ queryKey: ["admin-calendar"] });
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this reservation and release its inventory?")) return;
    try {
      await cancel({ data: { reservation_id: id } });
      toast.success("Reservation cancelled");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleAction(
    id: string,
    fn: ReturnType<typeof useServerFn<typeof checkInFn>>,
    label: string,
  ) {
    try {
      await fn({ data: { reservation_id: id } });
      toast.success(label);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Reservations</h1>
          <p className="text-sm text-stone-500 mt-1">{data?.length ?? 0} reservations</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref or guest…"
              className="pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm w-56"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="held">Held</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked in</option>
            <option value="checked_out">Checked out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading reservations…</p>}

      {data && data.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="text-stone-500 text-sm">No reservations found.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Guest</th>
                <th className="text-left px-4 py-3">Stay</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((r) => {
                const g = (
                  r as { guests?: { name?: string; email?: string; phone?: string } | null }
                ).guests;
                return (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.booking_reference}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-800">{g?.name ?? "—"}</div>
                      <div className="text-xs text-stone-500">{g?.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {r.checkin_date ?? "—"} → {r.checkout_date ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-xs">{r.source}</td>
                    <td className="px-4 py-3">${(r.total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE[r.status] ?? "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === "confirmed" && (
                          <button
                            onClick={() => handleAction(r.id, doCheckIn, "Checked in")}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
                            aria-label="Check in"
                            title="Check in"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}
                        {r.status === "checked_in" && (
                          <button
                            onClick={() => handleAction(r.id, doCheckOut, "Checked out")}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700"
                            aria-label="Check out"
                            title="Check out"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                        {r.status === "confirmed" && (
                          <button
                            onClick={() => handleAction(r.id, doNoShow, "Marked no-show")}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-700"
                            aria-label="No-show"
                            title="No-show"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        {!["checked_out", "cancelled", "expired"].includes(r.status) && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-700"
                            aria-label="Cancel"
                            title="Cancel"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
