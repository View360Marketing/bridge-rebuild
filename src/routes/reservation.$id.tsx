import React, { useEffect, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getReservationStatusFn, guestCancelReservationFn } from "@/lib/booking/payments.functions";
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  BedDouble,
  Users,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type ResSearch = { token: string };

export const Route = createFileRoute("/reservation/$id")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  validateSearch: (search: Record<string, unknown>): ResSearch => ({
    token: (search["token"] as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Your Reservation | The Bridges" },
      { name: "description", content: "View and manage your reservation at The Bridges." },
    ],
  }),
  component: ReservationPage,
});

function ReservationPage() {
  const { id } = Route.useParams();
  const { token } = Route.useSearch();
  const getStatus = useServerFn(getReservationStatusFn);
  const cancelReservation = useServerFn(guestCancelReservationFn);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getStatus>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function refresh() {
    if (!id || !token) {
      setError("This reservation link is incomplete. Use the link from your confirmation email.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getStatus({ data: { reservation_id: id, access_token: token } });
      setStatus(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => {
      if (status?.payment_processing) void refresh();
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, status?.payment_processing]);

  async function handleCancel() {
    if (!id || !token) return;
    if (
      !confirm(
        "Cancel this reservation? Inventory will be released. Refunds follow the cancellation policy.",
      )
    )
      return;
    setCancelling(true);
    try {
      await cancelReservation({ data: { reservation_id: id, access_token: token } });
      toast.success("Reservation cancelled. Any applicable refund will be processed separately.");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message || "Could not cancel the reservation.");
    } finally {
      setCancelling(false);
    }
  }

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />
      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
            <ShieldCheck className="w-4 h-4" /> Secure reservation access
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Your reservation</h1>
          <p className="text-sm text-stone-500 mb-8 font-mono">
            {status?.booking_reference ?? "—"}
          </p>

          {loading && !status && (
            <div className="flex items-center gap-3 text-stone-600">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading your reservation…
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">We couldn't load this reservation.</p>
                <p className="mt-1">{error}</p>
                <p className="mt-2">
                  Make sure you're using the full link from your confirmation email.
                </p>
              </div>
            </div>
          )}

          {status && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <StatusBadge status={status.status} processing={status.payment_processing} />
                {status.payment_processing && (
                  <div className="mt-4 flex items-center gap-3 text-stone-600 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Payment is processing. This page will update automatically.</span>
                  </div>
                )}
                {status.status === "confirmed" && !status.payment_processing && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>Your reservation is confirmed. We look forward to hosting you.</span>
                  </div>
                )}
                {(status.status === "held" || status.status === "pending_payment") && (
                  <p className="mt-4 text-sm text-stone-600">
                    Your dates are held. Complete payment to confirm.
                  </p>
                )}
                {status.status === "cancelled" && (
                  <p className="mt-4 text-sm text-stone-600">
                    This reservation has been cancelled.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">Stay details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-stone-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Dates
                    </dt>
                    <dd className="font-semibold text-stone-900">
                      {status.checkin_date} → {status.checkout_date}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Guests
                    </dt>
                    <dd className="font-semibold text-stone-900">
                      {status.adults} adults, {status.children} children
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500 flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4" /> Rooms
                    </dt>
                    <dd className="font-semibold text-stone-900">
                      {status.units.map((u) => u.public_name ?? u.unit_code).join(", ")}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">Payment</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Total</span>
                    <span>{fmt(status.total_cents)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Paid</span>
                    <span>{fmt(status.paid_cents)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Balance due</span>
                    <span>{fmt(status.amount_due_cents)}</span>
                  </div>
                </div>
                {status.amount_due_cents > 0 &&
                  status.stripe_configured &&
                  status.status !== "confirmed" &&
                  status.status !== "cancelled" && (
                    <Link
                      to="/booking/status"
                      search={{ reservation: id, session_id: "", canceled: "", token }}
                      className="mt-4 block text-center w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-colors"
                    >
                      Complete payment
                    </Link>
                  )}
                {!status.stripe_configured && status.amount_due_cents > 0 && (
                  <p className="mt-4 text-xs text-stone-500">
                    Online payment is not yet enabled. Our team will send a secure payment link.
                  </p>
                )}
              </div>

              {status.status !== "cancelled" && status.status !== "checked_out" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full text-sm text-red-700 hover:text-red-900 font-semibold py-2 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Request cancellation"}
                </button>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/stay" className="text-sm text-stone-600 hover:text-[#2a382c] underline">
              ← Back to stays
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function StatusBadge({ status, processing }: { status: string; processing: boolean }) {
  let label = status;
  let color = "bg-stone-100 text-stone-700";
  if (processing) {
    label = "Processing payment";
    color = "bg-blue-100 text-blue-800";
  } else if (status === "confirmed") {
    color = "bg-green-100 text-green-800";
  } else if (status === "held" || status === "pending_payment") {
    color = "bg-amber-100 text-amber-800";
  } else if (status === "cancelled" || status === "expired") {
    color = "bg-red-100 text-red-800";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color}`}
    >
      {processing ? <Clock className="w-3.5 h-3.5" /> : null}
      {label.replace(/_/g, " ")}
    </span>
  );
}
