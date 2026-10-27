import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listRatePlansFn,
  upsertRatePlanFn,
  listDateOverridesFn,
  addDateOverrideFn,
  listRestrictionsFn,
  addRestrictionFn,
  listFeesFn,
  listTaxesFn,
  listPromotionsFn,
  listPoliciesFn,
} from "@/lib/booking/operations.functions";
import { listUnitsFn, listRoomTypesFn } from "@/lib/booking/rooms.functions";
import { todayPropertyLocal, addDays } from "@/lib/booking/dates";
import { Plus, X, DollarSign, CalendarDays, Ban, Percent, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/rates")({
  head: () => ({
    meta: [
      { title: "Rates & Rules | The Bridges Admin" },
      { name: "description", content: "Manage nightly rates, date overrides, restrictions, fees, taxes, and policies." },
    ],
  }),
  component: RatesPage,
});

function RatesPage() {
  const [tab, setTab] = useState<"plans" | "overrides" | "restrictions" | "fees" | "taxes" | "promos" | "policies">(
    "plans",
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Rates & Rules</h1>
        <p className="text-sm text-stone-500 mt-1">
          Nightly rates, date overrides, restrictions, fees, taxes, promotions, and policies.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-stone-200">
        <TabButton active={tab === "plans"} value="plans" label="Rate Plans" icon={<DollarSign className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "overrides"} value="overrides" label="Date Overrides" icon={<CalendarDays className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "restrictions"} value="restrictions" label="Restrictions" icon={<Ban className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "fees"} value="fees" label="Fees" icon={<DollarSign className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "taxes"} value="taxes" label="Taxes" icon={<Percent className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "promos"} value="promos" label="Promotions" icon={<Percent className="w-4 h-4" />} onSelect={setTab} />
        <TabButton active={tab === "policies"} value="policies" label="Policies" icon={<FileText className="w-4 h-4" />} onSelect={setTab} />
      </div>

      {tab === "plans" && <RatePlansTab />}
      {tab === "overrides" && <DateOverridesTab />}
      {tab === "restrictions" && <RestrictionsTab />}
      {tab === "fees" && <SimpleListTab queryFn={listFeesFn} queryKey="admin-fees" title="Fees" />}
      {tab === "taxes" && <SimpleListTab queryFn={listTaxesFn} queryKey="admin-taxes" title="Taxes" />}
      {tab === "promos" && <SimpleListTab queryFn={listPromotionsFn} queryKey="admin-promos" title="Promotions" />}
      {tab === "policies" && <SimpleListTab queryFn={listPoliciesFn} queryKey="admin-policies" title="Cancellation Policies" />}
    </>
  );
}

type TabValue = "plans" | "overrides" | "restrictions" | "fees" | "taxes" | "promos" | "policies";

function TabButton({
  active,
  value,
  label,
  icon,
  onSelect,
}: {
  active: boolean;
  value: TabValue;
  label: string;
  icon: React.ReactNode;
  onSelect: (v: TabValue) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-[#2a382c] text-[#2a382c]" : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function RatePlansTab() {
  const qc = useQueryClient();
  const list = useServerFn(listRatePlansFn);
  const upsert = useServerFn(upsertRatePlanFn);
  const listRoomTypes = useServerFn(listRoomTypesFn);
  const listUnits = useServerFn(listUnitsFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-rate-plans"], queryFn: list });
  useQuery({ queryKey: ["admin-room-types"], queryFn: listRoomTypes });
  useQuery({ queryKey: ["admin-units"], queryFn: listUnits });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-rate-plans"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading rate plans…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{data?.length ?? 0} rate plan(s)</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> Add Rate Plan
        </button>
      </div>

      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Base / night</th>
                <th className="text-left px-4 py-3">Weekend</th>
                <th className="text-left px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">${((r.base_nightly_cents ?? 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {r.weekend_nightly_cents ? `$${(r.weekend_nightly_cents / 100).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_active ? (
                      <span className="text-xs text-emerald-600">Active</span>
                    ) : (
                      <span className="text-xs text-stone-400">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No rate plans configured"
          body="Rate plans define nightly pricing. Create one before publishing rooms for booking."
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
    </>
  );
}

function RatePlanForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: Record<string, unknown>) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [base, setBase] = useState("15000");
  const [weekend, setWeekend] = useState("20000");
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
            is_active: true,
          });
        }}
        className="space-y-3"
      >
        <Field label="Code *">
          <input required value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Name *">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base nightly (cents)">
            <input type="number" value={base} onChange={(e) => setBase(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Weekend nightly (cents)">
            <input type="number" value={weekend} onChange={(e) => setWeekend(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <FormActions onClose={onClose} label="Create Rate Plan" />
      </form>
    </Modal>
  );
}

function DateOverridesTab() {
  const qc = useQueryClient();
  const list = useServerFn(listDateOverridesFn);
  const add = useServerFn(addDateOverrideFn);
  const listUnits = useServerFn(listUnitsFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-date-overrides"], queryFn: list });
  const { data: units } = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-date-overrides"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{data?.length ?? 0} date override(s)</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> Add Override
        </button>
      </div>
      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Nightly</th>
                <th className="text-left px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">{o.stay_date}</td>
                  <td className="px-4 py-3">${((o.nightly_cents ?? 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-500">{o.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No date overrides"
          body="Override nightly rates for specific dates (holidays, events, seasonal pricing)."
          actionLabel="Add Override"
          onAction={() => setShowForm(true)}
        />
      )}
      {showForm && (
        <DateOverrideForm
          units={(units ?? []).map((u) => ({ id: u.id, label: u.unit_code }))}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await add({ data: input });
              toast.success("Override added");
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

function DateOverrideForm({
  units,
  onClose,
  onSubmit,
}: {
  units: { id: string; label: string }[];
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
}) {
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [date, setDate] = useState(todayPropertyLocal());
  const [cents, setCents] = useState("25000");
  return (
    <Modal title="Add Date Override" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ unit_id: unitId, stay_date: date, nightly_cents: Number(cents) });
        }}
        className="space-y-3"
      >
        <Field label="Unit">
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inputCls}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Nightly (cents)">
          <input type="number" value={cents} onChange={(e) => setCents(e.target.value)} className={inputCls} />
        </Field>
        <FormActions onClose={onClose} label="Add Override" />
      </form>
    </Modal>
  );
}

function RestrictionsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listRestrictionsFn);
  const add = useServerFn(addRestrictionFn);
  const listUnits = useServerFn(listUnitsFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-restrictions"], queryFn: list });
  const { data: units } = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-restrictions"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{data?.length ?? 0} restriction(s)</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> Add Restriction
        </button>
      </div>
      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Min stay</th>
                <th className="text-left px-4 py-3">Max stay</th>
                <th className="text-left px-4 py-3">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">{r.stay_date}</td>
                  <td className="px-4 py-3">{r.min_stay ?? "—"}</td>
                  <td className="px-4 py-3">{r.max_stay ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.is_closed ? (
                      <span className="text-xs text-rose-600">Closed</span>
                    ) : r.closed_to_arrival ? (
                      <span className="text-xs text-amber-600">CTA</span>
                    ) : (
                      <span className="text-xs text-stone-400">Open</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No restrictions configured"
          body="Add minimum/maximum stay, closed-to-arrival/departure, or full closures for specific dates."
          actionLabel="Add Restriction"
          onAction={() => setShowForm(true)}
        />
      )}
      {showForm && (
        <RestrictionForm
          units={(units ?? []).map((u) => ({ id: u.id, label: u.unit_code }))}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await add({ data: input });
              toast.success("Restriction added");
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

function RestrictionForm({
  units,
  onClose,
  onSubmit,
}: {
  units: { id: string; label: string }[];
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
}) {
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [date, setDate] = useState(todayPropertyLocal());
  const [minStay, setMinStay] = useState("1");
  const [isClosed, setIsClosed] = useState(false);
  return (
    <Modal title="Add Restriction" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            unit_id: unitId,
            stay_date: date,
            min_stay: Number(minStay),
            is_closed: isClosed,
          });
        }}
        className="space-y-3"
      >
        <Field label="Unit">
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inputCls}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min stay (nights)">
            <input type="number" value={minStay} onChange={(e) => setMinStay(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Closed?">
            <select value={String(isClosed)} onChange={(e) => setIsClosed(e.target.value === "true")} className={inputCls}>
              <option value="false">No</option>
              <option value="true">Yes — close unit</option>
            </select>
          </Field>
        </div>
        <FormActions onClose={onClose} label="Add Restriction" />
      </form>
    </Modal>
  );
}

type SimpleRow = { id: string; code?: string; name?: string; [k: string]: unknown };

function SimpleListTab({
  queryFn,
  queryKey,
  title,
}: {
  queryFn: Parameters<typeof useServerFn>[0];
  queryKey: string;
  title: string;
}) {
  const fn = useServerFn(queryFn) as () => Promise<SimpleRow[]>;
  const { data, isLoading, error } = useQuery<SimpleRow[], Error>({
    queryKey: [queryKey],
    queryFn: fn,
  });
  if (isLoading) return <p className="text-sm text-stone-500">Loading {title.toLowerCase()}…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;
  if (!data || data.length === 0)
    return (
      <EmptyState
        title={`No ${title.toLowerCase()} configured`}
        body={`${title} are configured by an owner/manager. None have been added yet.`}
      />
    );
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Code</th>
            <th className="text-left px-4 py-3">Name</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-mono text-xs">{r.code ?? r.id.slice(0, 8)}</td>
              <td className="px-4 py-3">{r.name ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
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
      <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm">
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