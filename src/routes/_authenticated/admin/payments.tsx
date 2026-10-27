import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listManualPaymentsFn,
  recordManualPaymentFn,
  reverseManualPaymentFn,
} from "@/lib/booking/operations.functions";
import { listReservationsFn } from "@/lib/booking/reservations.functions";
import { DollarSign, Plus, X, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments | The Bridges Admin" },
      { name: "description", content: "Reservation balances, manual payments, and reversals." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const qc = useQueryClient();
  const listRes = useServerFn(listReservationsFn);
  const listPayments = useServerFn(listManualPaymentsFn);
  const record = useServerFn(recordManualPaymentFn);
  const reverse = useServerFn(reverseManualPaymentFn);
  const {
    data: reservations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-reservations-payments"],
    queryFn: () => listRes({ data: { limit: 100 } }),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  const sel = (reservations ?? []).find((r) => r.id === selected);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Payments</h1>
        <p className="text-sm text-stone-500 mt-1">
          Reservation balances, manual payments, and reversals.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 mb-6">
        <p className="font-medium">Stripe status</p>
        <p className="mt-1 text-amber-800">
          Stripe is connected in test mode. No live charges are processed. Manual entries below
          record funds collected outside this website (cash/check/external terminal) — they do not
          trigger a Stripe charge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-stone-600">{reservations?.length ?? 0} reservation(s)</p>
          </div>
          {reservations && reservations.length > 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Reference</th>
                    <th className="text-left px-4 py-3">Guest</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Balance</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.map((r) => {
                    const g = (r as { guests?: { name?: string } | null }).guests;
                    const total = r.total_cents ?? 0;
                    const paid = r.paid_cents ?? 0;
                    const balance = total - paid;
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-stone-50 cursor-pointer ${selected === r.id ? "bg-[#2a382c]/5" : ""}`}
                        onClick={() => setSelected(r.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs">{r.booking_reference}</td>
                        <td className="px-4 py-3">{g?.name ?? "—"}</td>
                        <td className="px-4 py-3">${(total / 100).toFixed(2)}</td>
                        <td
                          className={`px-4 py-3 font-medium ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          ${(balance / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {balance > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(r.id);
                                setShowForm(true);
                              }}
                              className="text-xs text-[#2a382c] font-medium"
                            >
                              Record payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No reservations"
              body="Reservations with balances will appear here."
            />
          )}
        </div>

        <div>
          {sel ? (
            <PaymentDetail
              reservationId={sel.id}
              reference={sel.booking_reference}
              totalCents={sel.total_cents ?? 0}
              paidCents={sel.paid_cents ?? 0}
              listPayments={listPayments}
              reverse={reverse}
              onRecord={() => setShowForm(true)}
              onRefresh={async () => {
                await qc.invalidateQueries({ queryKey: ["admin-reservations-payments"] });
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <DollarSign className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm text-stone-500 mt-2">Select a reservation to view payments.</p>
            </div>
          )}
        </div>
      </div>

      {showForm && sel && (
        <PaymentForm
          reservationId={sel.id}
          reference={sel.booking_reference}
          balanceCents={(sel.total_cents ?? 0) - (sel.paid_cents ?? 0)}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await record({ data: input });
              toast.success("Payment recorded");
              await qc.invalidateQueries({ queryKey: ["admin-reservations-payments"] });
              setShowForm(false);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      )}
    </>
  );
}

function PaymentDetail({
  reservationId,
  reference,
  totalCents,
  paidCents,
  listPayments,
  reverse,
  onRecord,
  onRefresh,
}: {
  reservationId: string;
  reference: string;
  totalCents: number;
  paidCents: number;
  listPayments: ReturnType<typeof useServerFn<typeof listManualPaymentsFn>>;
  reverse: ReturnType<typeof useServerFn<typeof reverseManualPaymentFn>>;
  onRecord: () => void;
  onRefresh: () => Promise<void>;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-manual-payments", reservationId],
    queryFn: () => listPayments({ data: { reservation_id: reservationId } }),
  });
  const balance = totalCents - paidCents;
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <h3 className="font-serif text-lg font-bold text-stone-900">{reference}</h3>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <p className="text-xs text-stone-500 uppercase">Total</p>
          <p className="font-medium">${(totalCents / 100).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase">Paid</p>
          <p className="font-medium text-emerald-600">${(paidCents / 100).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase">Balance</p>
          <p className={`font-medium ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            ${(balance / 100).toFixed(2)}
          </p>
        </div>
      </div>
      {balance > 0 && (
        <button
          onClick={onRecord}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      )}
      <div className="mt-5">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
          Payment History
        </p>
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-stone-400">No manual payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm border border-stone-100 rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-medium">
                    ${((p.amount_cents ?? 0) / 100).toFixed(2)} ·{" "}
                    <span className="capitalize">{p.method}</span>
                  </p>
                  <p className="text-xs text-stone-500">{p.collected_at ?? ""}</p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("Reverse this payment? Creates an audited adjustment.")) return;
                    try {
                      await reverse({ data: { payment_id: p.id } });
                      toast.success("Payment reversed");
                      await onRefresh();
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                  className="text-xs text-rose-600 font-medium"
                >
                  Reverse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentForm({
  reservationId,
  reference,
  balanceCents,
  onClose,
  onSubmit,
}: {
  reservationId: string;
  reference: string;
  balanceCents: number;
  onClose: () => void;
  onSubmit: (input: {
    reservation_id: string;
    amount_cents: number;
    method: string;
    collected_at?: string;
    notes?: string;
  }) => void;
}) {
  const [amount, setAmount] = useState(String(Math.max(balanceCents, 0)));
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  return (
    <Modal title={`Record Payment · ${reference}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const payload: {
            reservation_id: string;
            amount_cents: number;
            method: string;
            collected_at?: string;
            notes?: string;
          } = {
            reservation_id: reservationId,
            amount_cents: Number(amount),
            method,
          };
          if (notes) payload.notes = notes;
          onSubmit(payload);
        }}
        className="space-y-3"
      >
        <Field label="Amount (cents)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Method">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="external_card">External card terminal</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Notes">
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls}
            placeholder="Optional"
          />
        </Field>
        <FormActions onClose={onClose} label="Record" />
      </form>
    </Modal>
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

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function FormActions({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
      >
        Cancel
      </button>
      <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm">
        {label}
      </button>
    </div>
  );
}

const inputCls =
  "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a382c]";
