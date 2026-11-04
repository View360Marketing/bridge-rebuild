import React, { useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { searchAvailabilityFn, computeQuoteFn } from "@/lib/booking/reservations.functions";
import { listPublishedUnitsFn } from "@/lib/booking/rooms.functions";
import {
  createGuestReservationFn,
  createCheckoutFn,
  getStripeConfigStatusFn,
} from "@/lib/booking/payments.functions";
import type { UnitRow } from "@/lib/booking/rooms.server";
import { todayPropertyLocal, addDays, nightCount } from "@/lib/booking/dates";
import { ArrowRight, ArrowLeft, ShieldCheck, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ReviewSearch = {
  unit_id: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  total_cents: number;
};

export const Route = createFileRoute("/booking/review")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  validateSearch: (search: Record<string, unknown>): ReviewSearch => ({
    unit_id: (search["unit_id"] as string) ?? "",
    checkin: (search["checkin"] as string) ?? addDays(todayPropertyLocal(), 1),
    checkout: (search["checkout"] as string) ?? addDays(todayPropertyLocal(), 3),
    adults: Number(search["adults"] ?? 2),
    children: Number(search["children"] ?? 0),
    total_cents: Number(search["total_cents"] ?? 0),
  }),
  head: () => ({
    meta: [
      { title: "Review Your Stay | The Bridges" },
      {
        name: "description",
        content: "Review your booking details and complete your reservation at The Bridges.",
      },
    ],
  }),
  component: BookingReviewPage,
});

function BookingReviewPage() {
  const { unit_id, checkin, checkout, adults, children, total_cents } = Route.useSearch();
  const navigate = useNavigate();

  const listPublishedUnits = useServerFn(listPublishedUnitsFn);
  const searchAvail = useServerFn(searchAvailabilityFn);
  const computeQuote = useServerFn(computeQuoteFn);
  const createReservation = useServerFn(createGuestReservationFn);
  const createCheckout = useServerFn(createCheckoutFn);
  const getStripeStatus = useServerFn(getStripeConfigStatusFn);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservationResult, setReservationResult] = useState<{
    reservation_id: string;
    booking_reference: string;
    access_token: string;
  } | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const { data: allUnits } = useQuery({
    queryKey: ["stay-units"],
    queryFn: listPublishedUnits,
  });
  const unit = (allUnits ?? []).find((u) => u.id === unit_id) as UnitRow | undefined;

  const { data: avail } = useQuery({
    queryKey: ["review-avail", unit_id, checkin, checkout, adults, children],
    enabled: !!unit,
    queryFn: () =>
      searchAvail({
        data: { checkin_date: checkin, checkout_date: checkout, adults, children, rooms: 1 },
      }),
  });

  const { data: quote } = useQuery({
    queryKey: ["review-quote", unit_id, checkin, checkout, adults, children],
    enabled: !!unit,
    queryFn: () =>
      computeQuote({
        data: {
          units: [
            {
              unit_id,
              unit_code: unit?.unit_code ?? "",
              base_rate_cents: unit?.base_rate_cents ?? 0,
              max_adults: unit?.max_adults ?? 2,
              max_children: (unit?.max_guests ?? 2) - (unit?.max_adults ?? 2),
              room_type_id: unit?.room_type_id ?? null,
            },
          ],
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
        },
      }),
  });

  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-config"],
    queryFn: getStripeStatus,
  });

  const nights = nightCount(checkin, checkout);
  const isAvailable = avail?.available.some((u) => u.id === unit_id) ?? false;
  const authoritativeTotal = quote?.total_cents ?? total_cents;

  async function handleReserve() {
    if (!unit) return;
    if (!guestName.trim() || !guestEmail.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    if (!policyAccepted) {
      toast.error("Please accept the booking policies to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const idempotencyKey = `guest-${crypto.randomUUID()}`;
      const result = await createReservation({
        data: {
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || undefined,
          checkin_date: checkin,
          checkout_date: checkout,
          adults,
          children,
          units: [
            {
              unit_id,
              checkin_date: checkin,
              checkout_date: checkout,
              adults,
              children,
            },
          ],
          total_cents: authoritativeTotal,
          policy_version: "v1",
          idempotency_key: idempotencyKey,
        },
      });
      setReservationResult(result);

      // If Stripe is configured, create a checkout session.
      if (stripeStatus?.configured && authoritativeTotal > 0) {
        const checkout = await createCheckout({
          data: {
            reservation_id: result.reservation_id,
            guest_email: guestEmail,
            origin: window.location.origin,
          },
        });
        if (checkout.checkout_url) {
          setCheckoutUrl(checkout.checkout_url);
          window.location.href = checkout.checkout_url;
          return;
        }
      }
      // No payment configured — hold created, redirect to status.
      navigate({
        to: "/booking/status",
        search: {
          reservation: result.reservation_id,
          session_id: "",
          canceled: "",
          token: result.access_token,
        },
      });
    } catch (e) {
      toast.error((e as Error).message || "Could not create your reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Room not found</h1>
          <Link to="/stay" className="text-[#2a382c] font-semibold underline mt-4 inline-block">
            ← Back to all stays
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />

      <section className="py-10 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/stay/$unitId"
            params={{ unitId: unit_id }}
            search={{ checkin, checkout, adults, children }}
            className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-[#2a382c] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to room
          </Link>

          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-6">Review your stay</h1>

          {!isAvailable && (
            <div className="mb-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                This room is no longer available for the selected dates.{" "}
                <Link to="/stay" className="font-semibold underline">
                  Search again
                </Link>
                .
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Stay details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Accommodation</dt>
                    <dd className="font-semibold text-stone-900">
                      {unit.public_name ?? unit.unit_kind}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Check-in</dt>
                    <dd className="font-semibold text-stone-900">{checkin}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Check-out</dt>
                    <dd className="font-semibold text-stone-900">{checkout}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Nights</dt>
                    <dd className="font-semibold text-stone-900">{nights}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Guests</dt>
                    <dd className="font-semibold text-stone-900">
                      {adults} adults, {children} children
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">
                  Your information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Full name *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Special requests (optional)
                    </label>
                    <textarea
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30"
                      placeholder="Requests are not guaranteed — our team will do our best to accommodate."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sticky top-28">
                <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Price summary</h2>
                {quote ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>{nights} night(s) × room</span>
                      <span>${(quote.subtotal_cents / 100).toFixed(2)}</span>
                    </div>
                    {quote.fees_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Fees</span>
                        <span>${(quote.fees_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {quote.taxes_cents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Taxes</span>
                        <span>${(quote.taxes_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {quote.discount_cents > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>−${(quote.discount_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200">
                      <span>Total</span>
                      <span>${(quote.total_cents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-700 pt-1">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" /> Due now
                      </span>
                      <span className="font-semibold">${(quote.total_cents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Calculating price…</p>
                )}

                <label className="flex items-start gap-2 mt-5 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I accept the booking policies, including cancellation terms and house rules. I
                    understand special requests are not guaranteed services.
                  </span>
                </label>
                <label className="flex items-start gap-2 mt-3 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Send me occasional news and offers (optional, separate from booking terms).
                  </span>
                </label>

                <button
                  onClick={handleReserve}
                  disabled={submitting || !isAvailable || !policyAccepted}
                  className="mt-5 w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Reserving…
                    </>
                  ) : stripeStatus?.configured ? (
                    <>
                      Continue to payment <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Request reservation <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!stripeStatus?.configured && (
                  <p className="mt-3 text-xs text-stone-500 text-center">
                    Online payment is not yet enabled. We'll hold your dates and send a secure
                    payment link.
                  </p>
                )}
                {stripeStatus?.configured && (
                  <p className="mt-3 text-xs text-stone-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure payment via Stripe
                    {stripeStatus.environment === "test" ? " (test mode)" : ""}
                  </p>
                )}
                {reservationResult && !checkoutUrl && !stripeStatus?.configured && (
                  <p className="mt-3 text-xs text-green-700 text-center">
                    Reservation {reservationResult.booking_reference} held. Redirecting…
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
