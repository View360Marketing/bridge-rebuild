import React, { useState } from "react";
import { Modal, Field, inputCls } from "./RoomUI";
import type { UnitRow } from "@/lib/booking/rooms.server";

export function UnitForm({
  properties,
  roomTypes,
  unit,
  onClose,
  onSubmit,
  saving,
}: {
  properties: { id: string; name: string }[];
  roomTypes: { id: string; name: string }[];
  unit?: UnitRow;
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    unit_code: unit?.unit_code ?? "",
    public_name: unit?.public_name ?? "",
    property_id: unit?.property_id ?? "",
    room_type_id: unit?.room_type_id ?? "",
    unit_kind: unit?.unit_kind ?? "room",
    max_guests: String(unit?.max_guests ?? 2),
    max_adults: String(unit?.max_adults ?? 2),
    max_children: String(unit?.max_children ?? 0),
    bedrooms: String(unit?.bedrooms ?? 1),
    beds: String(unit?.beds ?? 1),
    bathrooms: String(unit?.bathrooms ?? 1),
    pet_policy: unit?.pet_policy ?? "no_pets",
    base_rate_cents: String(unit?.base_rate_cents ?? 0),
    cleaning_fee_cents: String(unit?.cleaning_fee_cents ?? 0),
    description: unit?.description ?? "",
    is_published: unit?.is_published ? "true" : "false",
    primary_image_url: unit?.primary_image_url ?? "",
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
      primary_image_url: form.primary_image_url || undefined,
    });
  }

  const isEdit = !!unit;

  return (
    <Modal onClose={onClose} title={isEdit ? "Edit Unit" : "Add Unit"}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit Code *">
            <input
              required
              disabled={isEdit}
              value={form.unit_code}
              onChange={(e) => setForm({ ...form, unit_code: e.target.value })}
              className={inputCls + (isEdit ? " opacity-60" : "")}
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
        <Field label="Cover Image URL">
          <input
            value={form.primary_image_url}
            onChange={(e) => setForm({ ...form, primary_image_url: e.target.value })}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Publish?">
          <select
            value={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.value })}
            className={inputCls}
          >
            <option value="false">No (draft)</option>
            <option value="true">Yes</option>
          </select>
        </Field>
        {unit?.airbnb_url && (
          <div className="text-xs text-stone-500 bg-stone-50 rounded-lg p-2 break-all">
            Airbnb: {unit.airbnb_url}
          </div>
        )}
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
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Unit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
