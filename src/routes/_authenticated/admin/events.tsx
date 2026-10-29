import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listAllPropertyEventsFn,
  upsertPropertyEventFn,
  deletePropertyEventFn,
  togglePropertyEventFn,
} from "@/lib/booking/seasonal.functions";
import { Plus, X, Calendar, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({
    meta: [
      { title: "Events | The Bridges Admin" },
      {
        name: "description",
        content: "Create and manage property events shown on the public Events page.",
      },
    ],
  }),
  component: EventsAdminPage,
});

const inputCls =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a382c]/30";

type EventDraft = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  event_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  ticket_url: string;
  image_url: string;
  is_tentative: boolean;
  is_confirmed: boolean;
  includes_overnight_access: boolean;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: EventDraft = {
  code: "",
  title: "",
  subtitle: "",
  description: "",
  event_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  location: "",
  ticket_url: "",
  image_url: "",
  is_tentative: false,
  is_confirmed: true,
  includes_overnight_access: false,
  sort_order: 0,
  is_active: true,
};

function EventsAdminPage() {
  const qc = useQueryClient();
  const listAll = useServerFn(listAllPropertyEventsFn);
  const upsert = useServerFn(upsertPropertyEventFn);
  const remove = useServerFn(deletePropertyEventFn);
  const toggle = useServerFn(togglePropertyEventFn);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: listAll,
  });

  const [editing, setEditing] = useState<EventDraft | null>(null);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-events"] });
    await qc.invalidateQueries({ queryKey: ["property-events"] });
  }

  async function save() {
    if (!editing) return;
    if (!editing.code || !editing.title || !editing.event_date) {
      toast.error("Code, title, and event date are required.");
      return;
    }
    try {
      await upsert({
        data: {
          code: editing.code,
          title: editing.title,
          subtitle: editing.subtitle || null,
          description: editing.description || null,
          event_date: editing.event_date,
          end_date: editing.end_date || null,
          start_time: editing.start_time || null,
          end_time: editing.end_time || null,
          location: editing.location || null,
          ticket_url: editing.ticket_url || null,
          image_url: editing.image_url || null,
          is_tentative: editing.is_tentative,
          is_confirmed: editing.is_confirmed,
          includes_overnight_access: editing.includes_overnight_access,
          sort_order: editing.sort_order,
          is_active: editing.is_active,
        },
      });
      toast.success("Event saved");
      setEditing(null);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function onDelete(code: string) {
    if (!confirm(`Delete event "${code}"? This cannot be undone.`)) return;
    try {
      await remove({ data: { code } });
      toast.success("Event deleted");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function onToggle(code: string, isActive: boolean) {
    try {
      await toggle({ data: { code, is_active: isActive } });
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function editFrom(e: typeof events extends (infer T)[] | undefined ? T : never) {
    setEditing({
      code: e.code,
      title: e.title,
      subtitle: e.subtitle ?? "",
      description: e.description ?? "",
      event_date: e.event_date,
      end_date: e.end_date ?? "",
      start_time: e.start_time ?? "",
      end_time: e.end_time ?? "",
      location: e.location ?? "",
      ticket_url: e.ticket_url ?? "",
      image_url: e.image_url ?? "",
      is_tentative: e.is_tentative,
      is_confirmed: e.is_confirmed,
      includes_overnight_access: e.includes_overnight_access,
      sort_order: e.sort_order,
      is_active: e.is_active,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Events</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage events displayed on the public{" "}
            <a href="/events" target="_blank" rel="noreferrer" className="text-[#2a382c] underline">
              Events page
            </a>
            . Guests can add events to Apple/Google calendars.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading events…</p>}

      <div className="space-y-3">
        {(events ?? []).length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">
              No events yet. Click “Add Event” to create one.
            </p>
          </div>
        )}
        {(events ?? [])
          .slice()
          .sort((a, b) => (a.event_date < b.event_date ? -1 : 1))
          .map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 flex items-start gap-4"
            >
              {e.image_url ? (
                <img
                  src={e.image_url}
                  alt={e.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#2a382c]/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-7 h-7 text-[#2a382c]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-bold text-stone-900">{e.title}</h3>
                  {e.is_tentative && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Tentative
                    </span>
                  )}
                  {e.ticket_url && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a382c] bg-[#2a382c]/10 px-2 py-0.5 rounded-full">
                      Ticket link
                    </span>
                  )}
                  {!e.is_active && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {e.event_date}
                  {e.end_date ? ` → ${e.end_date}` : ""}
                  {e.start_time ? ` · ${e.start_time}` : ""}
                  {e.end_time ? `–${e.end_time}` : ""}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.subtitle && (
                  <p className="text-sm text-[#3e5340] font-medium mt-1">{e.subtitle}</p>
                )}
                {e.description && (
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">{e.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => editFrom(e)}
                    className="text-xs font-medium text-[#2a382c] hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    onClick={() => onToggle(e.code, !e.is_active)}
                    className="text-xs font-medium text-stone-600 hover:underline inline-flex items-center gap-1"
                  >
                    {e.is_active ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                  <span className="text-stone-300">·</span>
                  <button
                    onClick={() => onDelete(e.code)}
                    className="text-xs font-medium text-red-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <EventModal
          draft={editing}
          setDraft={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}

function EventModal({
  draft,
  setDraft,
  onClose,
  onSave,
}: {
  draft: EventDraft;
  setDraft: (d: EventDraft | null) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function set<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft({ ...draft, [key]: value });
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {draft.code ? "Edit Event" : "New Event"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Code (unique key) *
              </label>
              <input
                value={draft.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="grinchmas-2026"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Title *</label>
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Grinchmas Breakfast"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Subtitle</label>
            <input
              value={draft.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Girls' night at The Willows"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Event details…"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Event Date *</label>
              <input
                type="date"
                value={draft.event_date}
                onChange={(e) => set("event_date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={draft.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Start Time</label>
              <input
                type="time"
                value={draft.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">End Time</label>
              <input
                type="time"
                value={draft.end_time}
                onChange={(e) => set("end_time", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Location</label>
            <input
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="The Willows"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Ticket Link (optional)
              </label>
              <input
                value={draft.ticket_url}
                onChange={(e) => set("ticket_url", e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Image URL (optional)
              </label>
              <input
                value={draft.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Sort Order</label>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              Visible on site
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={draft.is_confirmed}
                onChange={(e) => set("is_confirmed", e.target.checked)}
              />
              Confirmed
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={draft.is_tentative}
                onChange={(e) => set("is_tentative", e.target.checked)}
              />
              Tentative
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={draft.includes_overnight_access}
                onChange={(e) => set("includes_overnight_access", e.target.checked)}
              />
              Included for overnight guests
            </label>
          </div>
          {draft.is_tentative && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Tentative events show a “Tentative” badge and do not display a ticket button.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm"
            >
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
