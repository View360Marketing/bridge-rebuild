import React, { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listRatePlansFn,
  upsertRatePlanFn,
  updateRatePlanFn,
} from "@/lib/booking/operations.functions";
import { listUnitsFn, listRoomTypesFn } from "@/lib/booking/rooms.functions";
import type { UnitRow } from "@/lib/booking/rooms.server";
import { Plus, X, Search, ArrowUpDown, Pencil } from "lucide-react";

type RatePlanRow = {
  id: string;
  code: string;
  name: string;
  room_type_id: string | null;
  unit_id: string | null;
  base_nightly_cents: number;
  weekend_nightly_cents: number | null;
  additional_adult_cents: number;
  additional_child_cents: number;
  weekend_days: number[];
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
};

type SortKey = "room_asc" | "room_desc" | "name_asc" | "name_desc";
type TypeFilter = "all" | "room" | "cabin" | "rv_site";

const inputCls =
  "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a382c]";

/** Extract the verified physical room number from a unit's public_name.
 * Matches patterns like "… — Room 11" or "Room 64". Returns null for
 * cabins, RV packages, and accommodations without a verified number. */
function roomNumber(unit: UnitRow | undefined): number | null {
  if (!unit) return null;
  const name = unit.public_name ?? "";
  const m = name.match(/Room\s+(\d+)/i);
  if (m) return Number(m[1]);
  return null;
}

export function RatePlansTab() {
  const qc = useQueryClient();
  const list = useServerFn(listRatePlansFn);
  const upsert = useServerFn(upsertRatePlanFn);
  const update = useServerFn(updateRatePlanFn);
  const listUnits = useServerFn(listUnitsFn);
  const listRoomTypes = useServerFn(listRoomTypesFn);

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-rate-plans"],
    queryFn: list,
  });
  const { data: units } = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });
  const { data: roomTypes } = useQuery({ queryKey: ["admin-room-types"], queryFn: listRoomTypes });

  const [sort, setSort] = useState<SortKey>("room_asc");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RatePlanRow | null>(null);

  const unitMap = useMemo(() => {
    const m = new Map<string, UnitRow>();
    for (const u of (units ?? []) as UnitRow[]) m.set(u.id, u);
    return m;
  }, [units]);

  const roomTypeName = (id: string | null) =>
    id
      ? (((roomTypes ?? []).find((r) => r.id === id) as { name?: string } | undefined)?.name ?? "—")
      : "—";

  // Build display rows: join unit info, classify, then sort/filter/search.
  const rows = useMemo(() => {
    const base = (plans ?? []).map((p) => {
      const unit = p.unit_id ? unitMap.get(p.unit_id) : undefined;
      const rn = roomNumber(unit);
      const kind = unit?.unit_kind ?? "general";
      const displayLabel = unit
        ? (unit.public_name ?? unit.unit_code)
        : p.room_type_id
          ? `${roomTypeName(p.room_type_id)} (room type)`
          : "General (all units)";
      return { plan: p, unit, roomNumber: rn, kind, displayLabel };
    });

    const filtered = base.filter((r) => {
      if (typeFilter !== "all") {
        if (typeFilter === "room" && r.kind !== "room") return false;
        if (typeFilter === "cabin" && r.kind !== "cabin") return false;
        if (typeFilter === "rv_site" && r.kind !== "rv_site") return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay =
          `${r.displayLabel} ${r.plan.code} ${r.plan.name} Room ${r.roomNumber ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      // Numbered rooms always sort before unnumbered.
      const aNum = a.roomNumber;
      const bNum = b.roomNumber;
      if (aNum != null && bNum != null) {
        if (sort === "room_asc") return aNum - bNum;
        if (sort === "room_desc") return bNum - aNum;
      }
      if (aNum != null && bNum == null) return sort === "room_desc" ? 1 : -1;
      if (aNum == null && bNum != null) return sort === "room_desc" ? -1 : 1;
      // Both unnumbered: sort by name
      const an = a.displayLabel.toLowerCase();
      const bn = b.displayLabel.toLowerCase();
      if (sort === "name_asc") return an.localeCompare(bn);
      if (sort === "name_desc") return bn.localeCompare(an);
      return an.localeCompare(bn);
    });

    return sorted;
  }, [plans, unitMap, roomTypes, sort, typeFilter, search]);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-rate-plans"] });
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setSort("room_asc");
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading rate plans…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room number or name…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`${inputCls} max-w-[220px]`}
          >
            <option value="room_asc">Room number: low to high</option>
            <option value="room_desc">Room number: high to low</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="name_desc">Name: Z–A</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className={`${inputCls} max-w-[160px]`}
          >
            <option value="all">All types</option>
            <option value="room">Rooms</option>
            <option value="cabin">Cabins</option>
            <option value="rv_site">RV packages</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm text-stone-600 hover:bg-stone-50"
          >
            Clear
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> Add Rate Plan
          </button>
        </div>
        <p className="text-sm text-stone-600">
          {rows.length} matching plan{rows.length === 1 ? "" : "s"}
          {rows.length !== (plans?.length ?? 0) && ` of ${plans?.length ?? 0} total`}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Room / Accommodation</th>
                <th className="text-left px-4 py-3">Rate Plan</th>
                <th className="text-left px-4 py-3">Base / night</th>
                <th className="text-left px-4 py-3">Weekend</th>
                <th className="text-left px-4 py-3">Dates</th>
                <th className="text-left px-4 py-3">Active</th>
                <th className="text-right px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(({ plan, unit, roomNumber: rn, displayLabel }) => (
                <tr key={plan.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">
                      {rn != null ? `Room ${rn}` : displayLabel}
                    </div>
                    {rn != null && <div className="text-xs text-stone-500">{displayLabel}</div>}
                    {!unit && plan.room_type_id && (
                      <div className="text-xs text-stone-400">
                        Room type: {roomTypeName(plan.room_type_id)}
                      </div>
                    )}
                    {!unit && !plan.room_type_id && (
                      <div className="text-xs text-stone-400">General — all units</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">{plan.code}</div>
                    <div className="text-xs text-stone-500">{plan.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    ${((plan.base_nightly_cents ?? 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {plan.weekend_nightly_cents
                      ? `$${(plan.weekend_nightly_cents / 100).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {plan.effective_from || plan.effective_to
                      ? `${plan.effective_from ?? "…"} → ${plan.effective_to ?? "…"}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {plan.is_active ? (
                      <span className="text-xs text-emerald-600">Active</span>
                    ) : (
                      <span className="text-xs text-stone-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(plan)}
                      className="inline-flex items-center gap-1 text-xs text-[#2a382c] hover:underline"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No rate plans match"
          body={
            (plans?.length ?? 0) === 0
              ? "Rate plans define nightly pricing. Create one before publishing rooms for booking."
              : "No plans match the current search and filters. Try clearing filters."
          }
          actionLabel="Add Rate Plan"
          onAction={() => setShowForm(true)}
        />
      )}

      {showForm && (
        <RatePlanForm
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await upsert({ data: input });
              toast.success("Rate plan created");
              await refresh();
              setShowForm(false);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      )}

      {editing && (
        <RatePlanEditForm
          plan={editing}
          unitLabel={unitMap.get(editing.unit_id ?? "")?.public_name ?? null}
          onClose={() => setEditing(null)}
          onSubmit={async (patch) => {
            try {
              await update({ data: { id: editing.id, patch } });
              toast.success("Rate plan updated");
              await refresh();
              setEditing(null);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      )}
    </>
  );
}

function RatePlanForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [base, setBase] = useState("9900");
  const [weekend, setWeekend] = useState("13400");
  const [effFrom, setEffFrom] = useState("2026-11-01");
  const [effTo, setEffTo] = useState("2027-01-31");
  return (
    <Modal title="Add Rate Plan" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            code,
            name,
            base_nightly_cents: Number(base),
            weekend_nightly_cents: Number(weekend),
            weekend_days: [5, 6, 0],
            is_active: true,
            effective_from: effFrom || undefined,
            effective_to: effTo || undefined,
          });
        }}
        className="space-y-3"
      >
        <Field label="Code *">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Name *">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base nightly (cents)">
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Weekend nightly (cents)">
            <input
              type="number"
              value={weekend}
              onChange={(e) => setWeekend(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Effective from">
            <input
              type="date"
              value={effFrom}
              onChange={(e) => setEffFrom(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Effective to">
            <input
              type="date"
              value={effTo}
              onChange={(e) => setEffTo(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <FormActions onClose={onClose} label="Create Rate Plan" />
      </form>
    </Modal>
  );
}

function RatePlanEditForm({
  plan,
  unitLabel,
  onClose,
  onSubmit,
}: {
  plan: RatePlanRow;
  unitLabel: string | null;
  onClose: () => void;
  onSubmit: (patch: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [base, setBase] = useState(String(plan.base_nightly_cents));
  const [weekend, setWeekend] = useState(
    plan.weekend_nightly_cents != null ? String(plan.weekend_nightly_cents) : "",
  );
  const [effFrom, setEffFrom] = useState(plan.effective_from ?? "");
  const [effTo, setEffTo] = useState(plan.effective_to ?? "");
  const [isActive, setIsActive] = useState(plan.is_active);
  return (
    <Modal title="Edit Rate Plan" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name,
            base_nightly_cents: Number(base),
            weekend_nightly_cents: weekend ? Number(weekend) : null,
            effective_from: effFrom || null,
            effective_to: effTo || null,
            is_active: isActive,
          });
        }}
        className="space-y-3"
      >
        <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600">
          <div>
            <span className="font-mono">{plan.code}</span>
          </div>
          {unitLabel && (
            <div className="mt-1">
              Linked to: <span className="font-medium">{unitLabel}</span>
            </div>
          )}
        </div>
        <Field label="Name *">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base nightly (cents)">
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Weekend nightly (cents)">
            <input
              type="number"
              value={weekend}
              onChange={(e) => setWeekend(e.target.value)}
              placeholder="—"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Effective from">
            <input
              type="date"
              value={effFrom}
              onChange={(e) => setEffFrom(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Effective to">
            <input
              type="date"
              value={effTo}
              onChange={(e) => setEffTo(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Status">
          <select
            value={String(isActive)}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className={inputCls}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>
        <FormActions onClose={onClose} label="Save Changes" />
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
