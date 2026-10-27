import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal, inputCls } from "./RoomUI";
import { Star, Trash2 } from "lucide-react";
import type { UnitRow } from "@/lib/booking/rooms.server";

type MediaRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
};

export function PhotoManager({
  unit,
  listMedia,
  addMedia,
  deleteMedia,
  onSetPrimary,
  onClose,
}: {
  unit: UnitRow;
  listMedia: (args: { data: { unitId: string } }) => Promise<MediaRow[]>;
  addMedia: (args: {
    data: { unitId: string; image_url: string; alt_text?: string; is_primary?: boolean };
  }) => Promise<unknown>;
  deleteMedia: (args: { data: { mediaId: string } }) => Promise<unknown>;
  onSetPrimary: (url: string | null) => void;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: media, isLoading } = useQuery({
    queryKey: ["unit-media", unit.id],
    queryFn: () => listMedia({ data: { unitId: unit.id } }),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["unit-media", unit.id] });
    await qc.invalidateQueries({ queryKey: ["admin-units"] });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    try {
      await addMedia({
        data: {
          unitId: unit.id,
          image_url: url.trim(),
          is_primary: !unit.primary_image_url,
        },
      });
      if (!unit.primary_image_url) onSetPrimary(url.trim());
      toast.success("Photo added");
      setUrl("");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  }

  async function handleDelete(mediaId: string, imageUrl: string) {
    if (!confirm("Remove this photo?")) return;
    try {
      await deleteMedia({ data: { mediaId } });
      if (unit.primary_image_url === imageUrl) onSetPrimary(null);
      toast.success("Photo removed");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleMakePrimary(imageUrl: string) {
    onSetPrimary(imageUrl);
    await refresh();
  }

  return (
    <Modal onClose={onClose} title={`Photos · ${unit.public_name ?? unit.unit_code}`} wide>
      <div className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https:// image URL"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 px-4 py-2 rounded-xl bg-[#2a382c] text-white text-sm disabled:opacity-60"
          >
            Add
          </button>
        </form>

        {isLoading && <p className="text-sm text-stone-500">Loading photos…</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {unit.primary_image_url && (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#2a382c]">
              <img
                src={unit.primary_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 text-[10px] bg-[#2a382c] text-white px-1.5 py-0.5 rounded">
                Cover
              </span>
            </div>
          )}
          {(media ?? []).map((m) => (
            <div
              key={m.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group"
            >
              <img
                src={m.image_url}
                alt={m.alt_text ?? ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {m.image_url !== unit.primary_image_url && (
                  <button
                    onClick={() => handleMakePrimary(m.image_url)}
                    className="p-1.5 rounded-lg bg-white/90 text-stone-700 hover:bg-white"
                    title="Set as cover"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(m.id, m.image_url)}
                  className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {media && media.length === 0 && !unit.primary_image_url && (
          <p className="text-sm text-stone-500 text-center py-4">No photos yet.</p>
        )}
      </div>
    </Modal>
  );
}
