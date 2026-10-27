import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGroupFn,
  listGroupsFn,
  releaseGroupFn,
  listReservationsFn,
} from "@/lib/booking/reservations.functions";
import { Plus, X, Users, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/groups")({
  head: () => ({
    meta: [
      { title: "Groups | The Bridges Admin" },
      { name: "description", content: "Wedding and retreat room allotments with pickup tracking." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listGroupsFn);
  const create = useServerFn(createGroupFn);
  const release = useServerFn(releaseGroupFn);
  const listRes = useServerFn(listReservationsFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-groups"], queryFn: list });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-groups"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading groups…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Groups & Retreats</h1>
          <p className="text-sm text-stone-500 mt-1">{data?.length ?? 0} group(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onRelease={async () => {
                if (
                  !confirm(
                    "Release unpicked rooms in this group? Picked-up reservations stay intact.",
                  )
                )
                  return;
                try {
                  await release({ data: { group_id: g.id } });
                  toast.success("Group released");
                  await refresh();
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No groups yet"
          body="Create a group to allot rooms for weddings, retreats, or private gatherings. Picked-up rooms transfer atomically to guest reservations."
          actionLabel="New Group"
          onAction={() => setShowForm(true)}
        />
      )}

      {showForm && (
        <GroupForm
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await create({ data: input });
              toast.success("Group created");
              await refresh();
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

function GroupCard({
  group,
  onRelease,
}: {
  group: Record<string, unknown> & { id: string };
  onRelease: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            {(group["name"] as string) ?? "Untitled group"}
          </h3>
          <p className="text-sm text-stone-500 mt-0.5">
            {(group["contact_name"] as string) ?? "—"} · {(group["contact_email"] as string) ?? ""}
          </p>
        </div>
        <button onClick={onRelease} className="text-xs text-rose-600 font-medium">
          Release unpicked
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
        <div>
          <p className="text-xs text-stone-500 uppercase">Stay</p>
          <p className="text-stone-800">
            {(group["checkin_date"] as string) ?? "—"} → {(group["checkout_date"] as string) ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase">Release date</p>
          <p className="text-stone-800">{(group["release_date"] as string) ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase">Payment</p>
          <p className="text-stone-800 capitalize">
            {(group["payment_responsibility"] as string) ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase">Code</p>
          <p className="text-stone-800 font-mono text-xs">
            {(group["code"] as string) ?? group.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  );
}

function GroupForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [payment, setPayment] = useState<"organizer" | "guest">("organizer");
  return (
    <Modal title="New Group" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name,
            contact_name: contactName || undefined,
            contact_email: contactEmail || undefined,
            contact_phone: contactPhone || undefined,
            checkin_date: checkin || undefined,
            checkout_date: checkout || undefined,
            release_date: releaseDate || undefined,
            payment_responsibility: payment,
          });
        }}
        className="space-y-3"
      >
        <Field label="Group name *">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact name">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Contact email">
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Contact phone">
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Payment by">
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value as "organizer" | "guest")}
              className={inputCls}
            >
              <option value="organizer">Organizer</option>
              <option value="guest">Individual guests</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Check-in">
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Check-out">
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Release date">
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <FormActions onClose={onClose} label="Create Group" />
      </form>
    </Modal>
  );
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
      <p className="font-medium text-stone-800">{title}</p>
      <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 mt-4 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
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
