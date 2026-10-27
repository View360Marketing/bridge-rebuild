import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listHousekeepingTasksFn,
  listUnitCleanlinessFn,
  updateTaskStatusFn,
  setUnitCleanlinessFn,
  createMaintenanceBlockFn,
  listMaintenanceBlocksFn,
  releaseMaintenanceBlockFn,
} from "@/lib/booking/operations.functions";
import { listUnitsFn } from "@/lib/booking/rooms.functions";
import { todayPropertyLocal } from "@/lib/booking/dates";
import { Sparkles, Wrench, Plus, X, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/housekeeping")({
  head: () => ({
    meta: [
      { title: "Housekeeping | The Bridges Admin" },
      { name: "description", content: "Room readiness, turnover tasks, and maintenance blocks." },
    ],
  }),
  component: HousekeepingPage,
});

function HousekeepingPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"tasks" | "readiness" | "maintenance">("tasks");

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Housekeeping & Maintenance</h1>
        <p className="text-sm text-stone-500 mt-1">
          Room readiness, turnover tasks, and maintenance closures.
        </p>
      </div>
      <div className="flex flex-wrap gap-1 mb-6 border-b border-stone-200">
        <TabBtn
          active={tab === "tasks"}
          label="Turnover Tasks"
          icon={<Clock className="w-4 h-4" />}
          onSelect={() => setTab("tasks")}
        />
        <TabBtn
          active={tab === "readiness"}
          label="Room Readiness"
          icon={<Sparkles className="w-4 h-4" />}
          onSelect={() => setTab("readiness")}
        />
        <TabBtn
          active={tab === "maintenance"}
          label="Maintenance Blocks"
          icon={<Wrench className="w-4 h-4" />}
          onSelect={() => setTab("maintenance")}
        />
      </div>
      {tab === "tasks" && <TasksTab />}
      {tab === "readiness" && <ReadinessTab />}
      {tab === "maintenance" && <MaintenanceTab />}
    </>
  );
}

function TasksTab() {
  const qc = useQueryClient();
  const list = useServerFn(listHousekeepingTasksFn);
  const update = useServerFn(updateTaskStatusFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-housekeeping-tasks", todayPropertyLocal()],
    queryFn: () => list({ data: { date: todayPropertyLocal() } }),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-housekeeping-tasks"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading tasks…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{data?.length ?? 0} turnover task(s) for today</p>
      </div>
      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.unit_code ?? t.unit_id}</td>
                  <td className="px-4 py-3 text-xs">{t.task_date}</td>
                  <td className="px-4 py-3">
                    {t.is_turnover ? (
                      <span className="text-xs text-amber-600">Turnover</span>
                    ) : (
                      <span className="text-xs text-stone-500">Cleaning</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize">{t.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === "pending" && (
                      <button
                        onClick={async () => {
                          try {
                            await update({ data: { task_id: t.id, status: "in_progress" } });
                            toast.success("Marked in progress");
                            await refresh();
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                        className="text-xs text-[#2a382c] font-medium"
                      >
                        Start
                      </button>
                    )}
                    {t.status === "in_progress" && (
                      <button
                        onClick={async () => {
                          try {
                            await update({ data: { task_id: t.id, status: "complete" } });
                            toast.success("Marked complete");
                            await refresh();
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                        className="text-xs text-emerald-600 font-medium"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No turnover tasks today"
          body="Turnover tasks are created automatically when a reservation checks out. None are scheduled for today."
        />
      )}
    </>
  );
}

function ReadinessTab() {
  const qc = useQueryClient();
  const list = useServerFn(listUnitCleanlinessFn);
  const setClean = useServerFn(setUnitCleanlinessFn);
  const listUnits = useServerFn(listUnitsFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-cleanliness"], queryFn: list });
  const { data: units } = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-cleanliness"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading readiness…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  const rows = (units ?? []).filter((u) => !u.is_archived);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{rows.length} rooms</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No rooms configured"
          body="Add physical rooms before tracking readiness."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">State</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((u) => {
                const c = (data ?? []).find((x) => x.id === u.id);
                const state = c?.cleanliness_state ?? "clean";
                return (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-xs">{u.unit_code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATE_BADGE[state] ?? "bg-stone-100 text-stone-600"}`}
                      >
                        {state.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={state}
                        onChange={async (e) => {
                          try {
                            await setClean({
                              data: { unit_id: u.id, state: e.target.value as never },
                            });
                            toast.success("Readiness updated");
                            await refresh();
                          } catch (err) {
                            toast.error((err as Error).message);
                          }
                        }}
                        className="text-xs border border-stone-300 rounded-lg px-2 py-1"
                      >
                        <option value="clean">Clean</option>
                        <option value="dirty">Dirty</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="inspected">Inspected</option>
                        <option value="out_of_service">Out of service</option>
                      </select>
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

function MaintenanceTab() {
  const qc = useQueryClient();
  const list = useServerFn(listMaintenanceBlocksFn);
  const create = useServerFn(createMaintenanceBlockFn);
  const release = useServerFn(releaseMaintenanceBlockFn);
  const listUnits = useServerFn(listUnitsFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-maintenance-blocks"],
    queryFn: list,
  });
  const { data: units } = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-maintenance-blocks"] });
    await qc.invalidateQueries({ queryKey: ["admin-calendar"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading maintenance blocks…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">{data?.length ?? 0} active block(s)</p>
        <button
          onClick={() => setShowForm(true)}
          disabled={(units ?? []).length === 0}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Maintenance Block
        </button>
      </div>
      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Dates</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.unit_code ?? b.unit_id}</td>
                  <td className="px-4 py-3 text-xs">
                    {b.checkin_date} → {b.checkout_date}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{b.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={async () => {
                        if (!confirm("Release this maintenance block and free its inventory?"))
                          return;
                        try {
                          await release({ data: { block_id: b.id } });
                          toast.success("Block released");
                          await refresh();
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      className="text-xs text-rose-600 font-medium"
                    >
                      Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (units ?? []).length > 0 ? (
        <EmptyState
          title="No maintenance blocks"
          body="Block rooms for repairs or maintenance. The inventory engine prevents new bookings during the block."
          actionLabel="Add Maintenance Block"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <EmptyState
          title="No maintenance blocks"
          body="Block rooms for repairs or maintenance. The inventory engine prevents new bookings during the block."
        />
      )}
      {showForm && (
        <MaintenanceForm
          units={(units ?? []).map((u) => ({ id: u.id, label: u.unit_code }))}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await create({ data: input });
              toast.success("Maintenance block created");
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

function MaintenanceForm({
  units,
  onClose,
  onSubmit,
}: {
  units: { id: string; label: string }[];
  onClose: () => void;
  onSubmit: (input: {
    unit_id: string;
    checkin_date: string;
    checkout_date: string;
    reason: string;
  }) => void;
}) {
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [checkin, setCheckin] = useState(todayPropertyLocal());
  const [checkout, setCheckout] = useState(todayPropertyLocal());
  const [reason, setReason] = useState("");
  return (
    <Modal title="Add Maintenance Block" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ unit_id: unitId, checkin_date: checkin, checkout_date: checkout, reason });
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Reason *">
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputCls}
            placeholder="Plumbing repair"
          />
        </Field>
        <FormActions onClose={onClose} label="Create Block" />
      </form>
    </Modal>
  );
}

const STATE_BADGE: Record<string, string> = {
  clean: "bg-emerald-100 text-emerald-700",
  dirty: "bg-amber-100 text-amber-700",
  cleaning: "bg-sky-100 text-sky-700",
  inspected: "bg-emerald-200 text-emerald-800",
  out_of_service: "bg-rose-100 text-rose-700",
};

function TabBtn({
  active,
  label,
  icon,
  onSelect,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-[#2a382c] text-[#2a382c]"
          : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {icon} {label}
    </button>
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
