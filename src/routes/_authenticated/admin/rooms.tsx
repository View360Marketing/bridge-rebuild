import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listPropertiesFn,
  listRoomTypesFn,
  listUnitsFn,
  upsertUnitFn,
  updateUnitFn,
  archiveUnitFn,
  publishUnitFn,
  setPrimaryImageFn,
  listUnitMediaFn,
  addUnitMediaFn,
  deleteUnitMediaFn,
  validateCsvImportFn,
  confirmCsvImportFn,
} from "@/lib/booking/rooms.functions";
import type { UnitRow } from "@/lib/booking/rooms.server";
import { UnitForm } from "@/components/admin/UnitForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { CsvImportModal } from "@/components/admin/CsvImportModal";
import {
  Plus,
  Archive,
  Upload,
  Pencil,
  Eye,
  EyeOff,
  ImagePlus,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

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
  const updateUnit = useServerFn(updateUnitFn);
  const archive = useServerFn(archiveUnitFn);
  const publish = useServerFn(publishUnitFn);
  const setPrimary = useServerFn(setPrimaryImageFn);
  const listMedia = useServerFn(listUnitMediaFn);
  const addMedia = useServerFn(addUnitMediaFn);
  const deleteMedia = useServerFn(deleteUnitMediaFn);
  const validateCsv = useServerFn(validateCsvImportFn);
  const confirmCsv = useServerFn(confirmCsvImportFn);

  const properties = useQuery({ queryKey: ["admin-properties"], queryFn: listProperties });
  const roomTypes = useQuery({ queryKey: ["admin-room-types"], queryFn: listRoomTypes });
  const units = useQuery({ queryKey: ["admin-units"], queryFn: listUnits });

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<UnitRow | null>(null);
  const [managingPhotos, setManagingPhotos] = useState<UnitRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<
    "hostaway" | "all" | "published" | "draft" | "archived" | "unmatched"
  >("hostaway");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<"room_asc" | "room_desc" | "name_asc" | "name_desc">("room_asc");

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

  async function handleUpdate(id: string, patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await updateUnit({ data: { id, patch } as never });
      toast.success("Unit updated");
      setEditing(null);
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

  async function handlePublish(id: string, published: boolean) {
    try {
      await publish({ data: { id, published } });
      toast.success(published ? "Unit published" : "Unit unpublished");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleSetPrimary(id: string, url: string | null) {
    try {
      await setPrimary({ data: { id, primary_image_url: url } });
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const all = (units.data ?? []) as UnitRow[];
  const filtered = all.filter((u) => {
    if (kind !== "all" && u.unit_kind !== kind) return false;
    if (filter === "hostaway") return !!u.hostaway_listing_id && !u.is_archived;
    if (filter === "unmatched") return !u.hostaway_listing_id && !u.is_archived;
    if (filter === "published") return u.is_published && !u.is_archived;
    if (filter === "draft") return !u.is_published && !u.is_archived;
    if (filter === "archived") return u.is_archived;
    return !u.is_archived;
  });
  const sorted = [...filtered].sort((a, b) => {
    const an = roomNumber(a);
    const bn = roomNumber(b);
    if (an != null && bn != null) {
      if (sort === "room_asc") return an - bn;
      if (sort === "room_desc") return bn - an;
    }
    if (an != null && bn == null) return sort === "room_desc" ? 1 : -1;
    if (an == null && bn != null) return sort === "room_desc" ? -1 : 1;
    const aname = (a.public_name ?? a.unit_code).toLowerCase();
    const bname = (b.public_name ?? b.unit_code).toLowerCase();
    if (sort === "name_asc") return aname.localeCompare(bname);
    if (sort === "name_desc") return bname.localeCompare(aname);
    return aname.localeCompare(bname);
  });
  const counts = {
    hostaway: all.filter((u) => u.hostaway_listing_id && !u.is_archived).length,
    unmatched: all.filter((u) => !u.hostaway_listing_id && !u.is_archived).length,
    all: all.filter((u) => !u.is_archived).length,
    published: all.filter((u) => u.is_published && !u.is_archived).length,
    draft: all.filter((u) => !u.is_published && !u.is_archived).length,
    archived: all.filter((u) => u.is_archived).length,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Rooms & Properties</h1>
          <p className="text-sm text-stone-500 mt-1">
            {counts.hostaway} Hostaway listings · {counts.published} published · {counts.draft}{" "}
            draft · {counts.archived} archived
          </p>
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

      <div className="flex flex-wrap gap-1 mb-4 border-b border-stone-200">
        {(["hostaway", "all", "published", "draft", "unmatched", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              filter === f
                ? "border-[#2a382c] text-[#2a382c]"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label htmlFor="unit-kind" className="text-sm text-stone-600">
          Accommodation type
        </label>
        <select
          id="unit-kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="border border-stone-300 rounded-lg p-2 text-sm bg-white"
        >
          <option value="all">All types</option>
          <option value="room">Rooms</option>
          <option value="cabin">Cabins</option>
          <option value="rv_site">RV packages / sites</option>
          <option value="suite">Suites</option>
        </select>
        <label htmlFor="unit-sort" className="text-sm text-stone-600 ml-2">
          Sort by
        </label>
        <select
          id="unit-sort"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "room_asc" | "room_desc" | "name_asc" | "name_desc")
          }
          className="border border-stone-300 rounded-lg p-2 text-sm bg-white"
        >
          <option value="room_asc">Room number: Low to high</option>
          <option value="room_desc">Room number: High to low</option>
          <option value="name_asc">Name: A–Z</option>
          <option value="name_desc">Name: Z–A</option>
        </select>
      </div>

      {units.data && counts.hostaway === 0 && filter === "hostaway" && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          The verified Hostaway catalog has not been applied to this database yet. Existing records
          remain in All and Unmatched. Apply the catalog migration and run the server photo importer
          before marking setup complete.
        </div>
      )}

      {units.isLoading && <p className="text-sm text-stone-500">Loading units…</p>}
      {units.isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800">
          <p className="font-medium">Unable to load units</p>
          <p className="mt-1 text-rose-700">{(units.error as Error).message}</p>
        </div>
      )}

      {units.data && sorted.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="font-medium text-stone-800">
            {filter === "all" ? "No units yet" : `No ${filter} units`}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Choose another view, or add an accommodation.
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sorted.map((u) => (
            <UnitCard
              key={u.id}
              unit={u}
              onEdit={() => setEditing(u)}
              onArchive={() => handleArchive(u.id)}
              onPublish={() => handlePublish(u.id, !u.is_published)}
              onManagePhotos={() => setManagingPhotos(u)}
            />
          ))}
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

      {editing && (
        <UnitForm
          properties={properties.data ?? []}
          roomTypes={roomTypes.data ?? []}
          unit={editing}
          onClose={() => setEditing(null)}
          onSubmit={(input) => handleUpdate(editing.id, input)}
          saving={saving}
        />
      )}

      {managingPhotos && (
        <PhotoManager
          unit={managingPhotos}
          listMedia={listMedia}
          addMedia={addMedia}
          deleteMedia={deleteMedia}
          onSetPrimary={(url) => handleSetPrimary(managingPhotos.id, url)}
          onClose={() => setManagingPhotos(null)}
        />
      )}

      {showImport && (
        <CsvImportModal
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
    </>
  );
}

/** Extract the verified physical room number from public_name (e.g. "… — Room 11" → 11).
 * Returns null for cabins, RV packages, and accommodations without a verified number. */
function roomNumber(unit: UnitRow): number | null {
  const m = /Room\s+(\d+)/i.exec(unit.public_name ?? "");
  return m ? Number(m[1]) : null;
}

function roomLabel(unit: UnitRow): string {
  if (unit.hostaway_record_kind === "rv_package_offer") {
    return "RV package · shared site allocation required";
  }
  if (unit.unit_kind === "cabin") {
    return "Cabin";
  }
  // Extract the verified room number from public_name (e.g. "Gateway to Nature's Beauty — Room 11" → "Room 11")
  const m = /Room\s+(\d+)/i.exec(unit.public_name ?? "");
  if (m) return `Room ${m[1]}`;
  // Rooms without a verified physical number (e.g. Crockett's Lookout)
  if (unit.unit_kind === "room") {
    return "Room — number unconfirmed";
  }
  return unit.unit_kind ?? "—";
}

function UnitCard({
  unit,
  onEdit,
  onArchive,
  onPublish,
  onManagePhotos,
}: {
  unit: UnitRow;
  onEdit: () => void;
  onArchive: () => void;
  onPublish: () => void;
  onManagePhotos: () => void;
}) {
  const missingInfo: string[] = [];
  if (!unit.public_name) missingInfo.push("name");
  if (!unit.description) missingInfo.push("description");
  if (unit.base_rate_cents === 0) missingInfo.push("rate");
  if (!unit.primary_image_url) missingInfo.push("photo");

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-gradient-to-br from-[#2a382c] to-[#3e5340] relative">
        {unit.primary_image_url ? (
          <img
            src={unit.primary_image_url}
            alt={unit.public_name ?? unit.unit_code}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-3xl font-mono">
            {unit.unit_code}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {unit.is_archived ? (
            <span className="text-xs px-2 py-1 rounded-full bg-stone-800/80 text-white">
              Archived
            </span>
          ) : unit.is_closed ? (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-600/80 text-white">
              Closed
            </span>
          ) : unit.is_published ? (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/80 text-white">
              Published
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-stone-600/80 text-white">Draft</span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-xs text-stone-400">{unit.unit_code}</p>
            <p className="font-serif text-lg font-bold text-stone-900 truncate">
              {unit.public_name || "—"}
            </p>
          </div>
        </div>
        <span className="text-xs text-stone-500">{roomLabel(unit)}</span>
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span>{unit.max_guests} guests</span>
          <span className="text-stone-300">·</span>
          <span>${(unit.base_rate_cents / 100).toFixed(2)}/night</span>
        </div>

        {unit.hostaway_source_url && (
          <a
            href={unit.hostaway_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#2a382c] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Hostaway listing #{unit.hostaway_listing_id}
          </a>
        )}
        {unit.hostaway_listing_id && (
          <p className="text-xs text-stone-500">
            Photos copied: {unit.hostaway_media_copied ?? 0}/{unit.hostaway_media_expected ?? 0}
          </p>
        )}
        {unit.hostaway_review_required && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2">
            {unit.hostaway_record_kind === "rv_package_offer"
              ? "Package offer only. Direct booking is closed until shared RV inventory is configured."
              : "Review occupancy limits, rates, taxes, fees, policies and calendars before opening direct booking."}
          </p>
        )}

        {unit.airbnb_url && (
          <a
            href={unit.airbnb_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#2a382c] hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Airbnb listing
          </a>
        )}

        {missingInfo.length > 0 && !unit.is_archived && (
          <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
            <span>Needs: {missingInfo.join(", ")}</span>
          </div>
        )}

        <div className="flex items-center gap-1 pt-2 mt-auto border-t border-stone-100">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onManagePhotos}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            title="Manage photos"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          {!unit.is_archived &&
            !unit.hostaway_review_required &&
            unit.hostaway_record_kind !== "rv_package_offer" && (
              <button
                onClick={onPublish}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
                title={unit.is_published ? "Unpublish" : "Publish"}
              >
                {unit.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          <button
            onClick={onArchive}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 ml-auto"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
