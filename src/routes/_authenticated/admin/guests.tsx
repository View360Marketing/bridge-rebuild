import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listGuestsFn,
  getGuestFn,
  findDuplicateGuestsFn,
  mergeGuestsFn,
  exportGuestsCsvFn,
} from "@/lib/booking/operations.functions";
import {
  listGhlContactsFn,
  syncGhlContactsFn,
  getGhlSyncStatusFn,
  getGhlConfigStatusFn,
} from "@/lib/booking/ghl.functions";
import { Search, Users, Download, GitMerge, X, RefreshCw, Cloud } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/guests")({
  head: () => ({
    meta: [
      { title: "Guests | The Bridges Admin" },
      { name: "description", content: "Guest profiles and stay history." },
    ],
  }),
  component: GuestsPage,
});

function GuestsPage() {
  const list = useServerFn(listGuestsFn);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-guests", search],
    queryFn: () => list({ data: { search: search || undefined } }),
  });

  return (
    <>
      <GhlContactsSection />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Guests</h1>
          <p className="text-sm text-stone-500 mt-1">{data?.length ?? 0} guest profile(s)</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm w-64"
            />
          </div>
          <ExportButton />
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading guests…</p>}
      {error && <ErrorBox message={(error as Error).message} />}

      {data && data.length === 0 && !isLoading && (
        <EmptyState
          title={search ? "No matching guests" : "No guests yet"}
          body={
            search
              ? "Try a different search term."
              : "Guest profiles are created automatically when reservations are made."
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((g) => (
                <tr key={g.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{g.name}</td>
                  <td className="px-4 py-3 text-stone-600">{g.email ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{g.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {(g.created_at ?? "").slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openGuestDetail(g.id)}
                      className="text-xs text-[#2a382c] font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GuestDetailLauncher />
    </>
  );
}

function ExportButton() {
  const exportCsv = useServerFn(exportGuestsCsvFn);
  async function handleExport() {
    try {
      const csv = await exportCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bridges-guests.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium px-4 py-2.5 rounded-xl text-sm"
    >
      <Download className="w-4 h-4" /> Export CSV
    </button>
  );
}

// Simple detail launcher using window state to avoid prop drilling across the list.
let _openGuestId: string | null = null;
function openGuestDetail(id: string) {
  _openGuestId = id;
  window.dispatchEvent(new CustomEvent("open-guest-detail"));
}
function GuestDetailLauncher() {
  const [id, setId] = useState<string | null>(null);
  React.useEffect(() => {
    const handler = () => setId(_openGuestId);
    window.addEventListener("open-guest-detail", handler);
    return () => window.removeEventListener("open-guest-detail", handler);
  }, []);
  if (!id) return null;
  return <GuestDetail guestId={id} onClose={() => setId(null)} />;
}

function GuestDetail({ guestId, onClose }: { guestId: string; onClose: () => void }) {
  const getGuest = useServerFn(getGuestFn);
  const findDupes = useServerFn(findDuplicateGuestsFn);
  const merge = useServerFn(mergeGuestsFn);
  const qc = useQueryClient();
  const { data: guest, isLoading } = useQuery({
    queryKey: ["admin-guest", guestId],
    queryFn: () => getGuest({ data: { guest_id: guestId } }),
  });
  const { data: dupes } = useQuery({
    queryKey: ["admin-guest-dupes", guestId],
    queryFn: () => findDupes({ data: { guest_id: guestId } }),
  });

  async function handleMerge(sourceId: string) {
    if (!confirm("Merge this guest into the current one? Reservations will be reassigned.")) return;
    try {
      await merge({ data: { source_id: sourceId, target_id: guestId } });
      toast.success("Guests merged");
      await qc.invalidateQueries({ queryKey: ["admin-guests"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

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
          <h2 className="font-serif text-xl font-bold text-stone-900">Guest Profile</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
        {guest && (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-medium text-stone-900">{guest.name}</p>
              <p className="text-sm text-stone-600">{guest.email ?? "No email"}</p>
              <p className="text-sm text-stone-600">{guest.phone ?? "No phone"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                Stay History
              </p>
              {guest.reservations.length === 0 ? (
                <p className="text-sm text-stone-500">No reservations.</p>
              ) : (
                <div className="space-y-1">
                  {guest.reservations.map((r) => (
                    <div
                      key={r.id}
                      className="text-sm flex justify-between border-b border-stone-100 pb-1"
                    >
                      <span className="font-mono text-xs">{r.booking_reference}</span>
                      <span className="text-stone-500">
                        {r.checkin_date ?? "—"} · {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {dupes && dupes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                  Possible Duplicates
                </p>
                <p className="text-xs text-stone-500 mb-2">
                  Reviewed matches by email/phone. Merge only if these are the same person.
                </p>
                {dupes.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between border border-stone-200 rounded-lg px-3 py-2 mb-1"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-stone-500"> · {d.email ?? "no email"}</span>
                    </div>
                    <button
                      onClick={() => handleMerge(d.id)}
                      className="inline-flex items-center gap-1 text-xs text-[#2a382c] font-semibold"
                    >
                      <GitMerge className="w-3.5 h-3.5" /> Merge into current
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GhlContactsSection() {
  const listContacts = useServerFn(listGhlContactsFn);
  const syncContacts = useServerFn(syncGhlContactsFn);
  const getSyncStatus = useServerFn(getGhlSyncStatusFn);
  const getConfigStatus = useServerFn(getGhlConfigStatusFn);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const { data: config } = useQuery({ queryKey: ["ghl-config"], queryFn: getConfigStatus });
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["ghl-contacts", search],
    queryFn: () => listContacts({ data: { search: search || undefined } }),
  });
  const { data: syncStatus } = useQuery({
    queryKey: ["ghl-sync-status"],
    queryFn: getSyncStatus,
  });

  const configured = config?.configured ?? false;

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncContacts();
      if (result.status === "failed") {
        toast.error(result.error ?? "Sync failed");
      } else {
        toast.success(
          `Synced: ${result.updated} updated, ${result.failed} failed`,
        );
      }
      await qc.invalidateQueries({ queryKey: ["ghl-contacts"] });
      await qc.invalidateQueries({ queryKey: ["ghl-sync-status"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-[#2a382c]" />
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              CRM Contacts
            </h2>
            <p className="text-xs text-stone-500">
              {configured
                ? syncStatus?.lastSync
                  ? `Last sync: ${syncStatus.lastSync.slice(0, 16).replace("T", " ")}`
                  : "Not synced yet"
                : "Not configured — set GHL_PRIVATE_TOKEN and GHL_LOCATION_ID in server secrets"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={!configured || syncing}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>
      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-amber-800">
            GoHighLevel is not configured. Add GHL_PRIVATE_TOKEN and
            GHL_LOCATION_ID in server secrets to import contacts.
          </p>
        </div>
      )}
      {configured && (
        <>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm w-full"
            />
          </div>
          {isLoading && <p className="text-sm text-stone-500">Loading contacts…</p>}
          {contacts && contacts.length === 0 && !isLoading && (
            <p className="text-sm text-stone-500">
              No contacts {search ? "match your search" : "imported yet"}. Click Sync Now to import from CRM.
            </p>
          )}
          {contacts && contacts.length > 0 && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {contacts.map((c) => (
                <div
                  key={c.ghl_contact_id}
                  className="flex items-center justify-between border border-stone-200 rounded-lg px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium text-stone-800">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown"}
                    </span>
                    <span className="text-stone-500">
                      {" "}{c.email ?? "no email"} · {c.phone ?? "no phone"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.linked_guest_id ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Linked
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        Contact only
                      </span>
                    )}
                    {c.dnd_opted_out && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                        DND
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
      <Users className="w-8 h-8 text-stone-300 mx-auto mb-3" />
      <p className="font-medium text-stone-800">{title}</p>
      <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">{body}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm">
      <p className="font-medium">Unable to load guests</p>
      <p className="mt-1 text-rose-700">{message}</p>
    </div>
  );
}
