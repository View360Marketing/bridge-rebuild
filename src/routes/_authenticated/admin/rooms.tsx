import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  listPropertiesFn,
  listRoomTypesFn,
  listUnitsFn,
  upsertUnitFn,
  archiveUnitFn,
  validateCsvImportFn,
  confirmCsvImportFn,
} from "@/lib/booking/rooms.functions";
import { CSV_COLUMNS } from "@/lib/booking/rooms.server";
import { Plus, Archive, Upload, FileDown, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Properties | The Bridges Admin" },
      { name: "description", content: "Manage rooms, units, and properties at The Bridges." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const qc = useQueryClient();
  const listProperties = useServerFn(listPropertiesFn);
  const listRoomTypes = useServerFn(listRoomTypesFn);
  const listUnits = useServerFn(listUnitsFn);
  const createUnit = useServerFn(upsertUnitFn);
  const archive = useServerFn(archiveUnitFn);
  const validateCsv = useServerFn(validateCsvImportFn);
  const confirmCsv = useServerFn(confirmCsvImportFn);

  const properties = useQuery({ queryKey: ["admin-properties"], queryFn: listProperties });
  const roomTypes = useQuery({ queryKey: ["admin-room-types"], queryFn: listRoomTypes });
  const units = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-units"] });
  }

  async function handleCreate(input: Record<string, unknown>) {
    setSaving(true);
    try {
      await createUnit({ data: input as never });
      toast.success("Unit created");
      setShowForm(false);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setSaving(false);
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this unit? It will be unpublished but reservation history is kept."))
      return;
    try {
      await archive({ data: { id } });
      toast.success("Unit archived");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AdminShell active="rooms">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Rooms & Properties</h1>
          <p className="text-sm text-stone-500 mt-1">{units.data?.length ?? 0} units configured</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium px-4 py-2.5 rounded-xl text-sm"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </button>
        </div>
      </div>

      {units.isLoading && <p className="text-sm text-stone-500">Loading units…</p>}
      {units.isError && (
        <p className="text-sm text-red-600">Error: {(units.error as Error).message}</p>
      )}

      {units.data && units.data.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="text-stone-500 text-sm">
            No units yet. Add one or import a CSV to get started.
          </p>
        </div>
      )}

      {units.data && units.data.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Kind</th>
                <th className="text-left px-4 py-3">Guests</th>
                <th className="text-left px-4 py-3">Rate</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {units.data.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs">{u.unit_code}</td>
                  <td className="px-4 py-3">{u.public_name || "—"}</td>
                  <td className="px-4 py-3 capitalize">{u.unit_kind}</td>
                  <td className="px-4 py-3">{u.max_guests}</td>
                  <td className="px-4 py-3">${(u.base_rate_cents / 100).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    {u.is_archived ? (
                      <span className="text-xs text-stone-400">Archived</span>
                    ) : u.is_closed ? (
                      <span className="text-xs text-amber-600">Closed</span>
                    ) : u.is_published ? (
                      <span className="text-xs text-emerald-600">Published</span>
                    ) : (
                      <span className="text-xs text-stone-500">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.is_archived && (
                      <button
                        onClick={() => handleArchive(u.id)}
                        className="text-stone-400 hover:text-red-600"
                        aria-label="Archive unit"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <UnitForm
          properties={properties.data ?? []}
          roomTypes={roomTypes.data ?? []}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          saving={saving}
        />
      )}

      {showImport && (
        <CsvImport
          onClose={() => setShowImport(false)}
          onValidate={validateCsv}
          onConfirm={async (csv) => {
            const res = await confirmCsv({ data: { csv } });
            toast.success(`Imported ${res.inserted} units (${res.skipped} skipped)`);
            if (res.errors.length) toast.error(res.errors.join("\n"));
            await refresh();
            setShowImport(false);
          }}
        />
      )}
    </AdminShell>
  );
}

function UnitForm({
  properties,
  roomTypes,
  onClose,
  onSubmit,
  saving,
}: {
  properties: { id: string; name: string }[];
  roomTypes: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
  saving: boolean;
}) {
  type UnitFormState = {
    unit_code: string;
    public_name: string;
    property_id: string;
    room_type_id: string;
    unit_kind: string;
    max_guests: string;
    max_adults: string;
    max_children: string;
    bedrooms: string;
    beds: string;
    bathrooms: string;
    pet_policy: string;
    base_rate_cents: string;
    cleaning_fee_cents: string;
    description: string;
    is_published: string;
  };
  const [form, setForm] = useState<UnitFormState>({
    unit_code: "",
    public_name: "",
    property_id: "",
    room_type_id: "",
    unit_kind: "room",
    max_guests: "2",
    max_adults: "2",
    max_children: "0",
    bedrooms: "1",
    beds: "1",
    bathrooms: "1",
    pet_policy: "no_pets",
    base_rate_cents: "0",
    cleaning_fee_cents: "0",
    description: "",
    is_published: "false",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      unit_code: form.unit_code,
      public_name: form.public_name || undefined,
      property_id: form.property_id || undefined,
      room_type_id: form.room_type_id || undefined,
      unit_kind: form.unit_kind,
      description: form.description || undefined,
      max_guests: Number(form.max_guests),
      max_adults: Number(form.max_adults),
      max_children: Number(form.max_children),
      bedrooms: Number(form.bedrooms),
      beds: Number(form.beds),
      bathrooms: Number(form.bathrooms),
      pet_policy: form.pet_policy,
      base_rate_cents: Number(form.base_rate_cents),
      cleaning_fee_cents: Number(form.cleaning_fee_cents),
      is_published: form.is_published === "true",
    });
  }

  return (
    <Modal onClose={onClose} title="Add Unit">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit Code *">
            <input
              required
              value={form.unit_code}
              onChange={(e) => setForm({ ...form, unit_code: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Public Name">
            <input
              value={form.public_name}
              onChange={(e) => setForm({ ...form, public_name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Property">
            <select
              value={form.property_id}
              onChange={(e) => setForm({ ...form, property_id: e.target.value })}
              className={inputCls}
            >
              <option value="">—</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Room Type">
            <select
              value={form.room_type_id}
              onChange={(e) => setForm({ ...form, room_type_id: e.target.value })}
              className={inputCls}
            >
              <option value="">—</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select
              value={form.unit_kind}
              onChange={(e) => setForm({ ...form, unit_kind: e.target.value })}
              className={inputCls}
            >
              <option value="room">Room</option>
              <option value="cabin">Cabin</option>
              <option value="rv_site">RV Site</option>
              <option value="suite">Suite</option>
            </select>
          </Field>
          <Field label="Pet Policy">
            <select
              value={form.pet_policy}
              onChange={(e) => setForm({ ...form, pet_policy: e.target.value })}
              className={inputCls}
            >
              <option value="no_pets">No Pets</option>
              <option value="pets_allowed">Pets Allowed</option>
              <option value="pets_negotiable">Pets Negotiable</option>
            </select>
          </Field>
          <Field label="Max Guests">
            <input
              type="number"
              value={form.max_guests}
              onChange={(e) => setForm({ ...form, max_guests: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Max Adults">
            <input
              type="number"
              value={form.max_adults}
              onChange={(e) => setForm({ ...form, max_adults: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Max Children">
            <input
              type="number"
              value={form.max_children}
              onChange={(e) => setForm({ ...form, max_children: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Bedrooms">
            <input
              type="number"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Beds">
            <input
              type="number"
              value={form.beds}
              onChange={(e) => setForm({ ...form, beds: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Bathrooms">
            <input
              type="number"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Base Rate (cents)">
            <input
              type="number"
              value={form.base_rate_cents}
              onChange={(e) => setForm({ ...form, base_rate_cents: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Cleaning Fee (cents)">
            <input
              type="number"
              value={form.cleaning_fee_cents}
              onChange={(e) => setForm({ ...form, cleaning_fee_cents: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Publish immediately?">
          <select
            value={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.value })}
            className={inputCls}
          >
            <option value="false">No (draft)</option>
            <option value="true">Yes</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create Unit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CsvImport({
  onClose,
  onValidate,
  onConfirm,
}: {
  onClose: () => void;
  onValidate: (input: { data: { csv: string } }) => Promise<{
    total: number;
    valid: number;
    invalid: number;
    rows: { valid: boolean; errors: string[]; row: Record<string, string> }[];
  }>;
  onConfirm: (csv: string) => Promise<void>;
}) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof onValidate>> | null>(null);
  const [checking, setChecking] = useState(false);

  const template = CSV_COLUMNS.join(",");

  async function dryRun() {
    setChecking(true);
    try {
      const res = await onValidate({ data: { csv } });
      setResult(res);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setChecking(false);
  }

  return (
    <Modal onClose={onClose} title="Import Units (CSV)">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">Columns: {template}</p>
          <button
            onClick={() => {
              const blob = new Blob([template + "\n"], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "bridges-units-template.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#2a382c] font-semibold"
          >
            <FileDown className="w-3.5 h-3.5" /> Download template
          </button>
        </div>
        <textarea
          rows={8}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={`${template}\nCABIN-01,The Cedar Cabin,,,cabin,...`}
          className={inputCls + " font-mono text-xs"}
        />
        <div className="flex gap-2">
          <button
            onClick={dryRun}
            disabled={checking || !csv}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm disabled:opacity-60"
          >
            {checking ? "Validating…" : "Dry run (validate)"}
          </button>
          <button
            onClick={() => onConfirm(csv)}
            disabled={!result || result.invalid > 0 || result.valid === 0}
            className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm disabled:opacity-60"
          >
            Confirm import
          </button>
        </div>
        {result && (
          <div className="text-xs space-y-2">
            <p className="text-stone-600">
              {result.valid} valid, {result.invalid} invalid of {result.total} rows.
            </p>
            {result.rows
              .filter((r) => !r.valid)
              .map((r, i) => (
                <p key={i} className="text-red-600">
                  {r.errors.join(" ")}
                </p>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

const inputCls =
  "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a382c]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-600 mb-1">{label}</span>
      {children}
    </label>
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
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
