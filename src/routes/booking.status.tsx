import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getReservationStatusFn } from "@/lib/booking/payments.functions";
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  BedDouble,
  Users,
} from "lucide-react";

type StatusSearch = {
  reservation: string;
  session_id: string;
  canceled: string;
  token: string;
};

export const Route = createFileRoute("/booking/status")({
  validateSearch: (search: Record<string, unknown>): StatusSearch => ({
    reservation: (search["reservation"] as string) ?? "",
    session_id: (search["session_id"] as string) ?? "",
    canceled: (search["canceled"] as string) ?? "",
    token: (search["token"] as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Booking Status | The Bridges" },
      { name: "description", content: "Check the status of your reservation at The Bridges." },
    ],
  }),
  component: BookingStatusPage,
});

function BookingStatusPage() {
  const { reservation, session_id, canceled, token } = Route.useSearch();
  const getStatus = useServerFn(getReservationStatusFn);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getStatus>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!reservation) {
      setError("Missing reservation reference.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getStatus({
        data: { reservation_id: reservation, access_token: token || undefined },
      });
      setStatus(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // Poll while payment is processing.
    const interval = setInterval(() => {
      if (status?.payment_processing) void refresh();
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation, token, status?.payment_processing]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />
      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Booking status</h1>
          <p className="text-sm text-stone-500 mb-8 font-mono">{reservation || "—"}</p>

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
                  If you just completed payment, please wait a moment — confirmation can take a few
                  seconds.
                </p>
              </div>
            </div>
          )}

          {canceled && status && status.status !== "confirmed" && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                You closed the payment window. Your dates are still held — you can complete payment
                below.
              </span>
            </div>
          )}

          {status && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <StatusBadge status={status.status} processing={status.payment_processing} />
                {status.payment_processing ? (
                  <div className="mt-4 flex items-center gap-3 text-stone-600 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      Payment is processing. We're confirming with the payment provider — this page
                      will update automatically.
                    </span>
                  </div>
                ) : status.status === "confirmed" ? (
                  <div className="mt-4 flex items-start gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>
                      Your reservation is confirmed. A confirmation has been queued for your email.
                    </span>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-600">
                    Your dates are held. Complete payment to confirm your stay.
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
                  status.status !== "confirmed" && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        void refresh();
                      }}
                      className="mt-4 block text-center w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-colors"
                    >
                      Complete payment
                    </a>
                  )}
                {!status.stripe_configured && status.amount_due_cents > 0 && (
                  <p className="mt-4 text-xs text-stone-500">
                    Online payment is not yet enabled. Our team will send a secure payment link to
                    your email.
                  </p>
                )}
              </div>

              {token && (
                <Link
                  to="/reservation/$id"
                  params={{ id: reservation }}
                  search={{ token }}
                  className="block text-center text-sm text-[#2a382c] font-semibold underline"
                >
                  View your reservation page →
                </Link>
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
