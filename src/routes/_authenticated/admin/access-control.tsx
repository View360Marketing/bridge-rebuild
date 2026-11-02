import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getManagerPermissionsFn,
  saveManagerPermissionsFn,
  type ResolvedPermissions,
  type ModuleKey,
} from "@/lib/booking/permissions.functions";
import { listPreviewableStaffFn, type PreviewStaff } from "@/lib/booking/preview.functions";

export const Route = createFileRoute("/_authenticated/admin/access-control")({
  head: () => ({
    meta: [
      { title: "Access Control — The Bridges Admin" },
      { name: "description", content: "Configure staff role and per-user module access." },
    ],
  }),
  component: AccessControlPage,
});

const MODULES: { key: ModuleKey; label: string; supportsManage: boolean }[] = [
  { key: "overview", label: "Overview", supportsManage: false },
  { key: "calendar", label: "Calendar", supportsManage: true },
  { key: "reservations", label: "Reservations", supportsManage: true },
  { key: "guests", label: "Guests", supportsManage: true },
  { key: "rooms", label: "Rooms & Properties", supportsManage: false },
  { key: "social", label: "Social Media", supportsManage: true },
  { key: "reports", label: "Reports", supportsManage: false },
  { key: "events", label: "Events", supportsManage: true },
  { key: "massage", label: "Massage Bookings", supportsManage: true },
];

const ROLE_DEFAULTS: Record<string, ResolvedPermissions> = {
  manager: {
    overview: "none",
    calendar: "manage",
    reservations: "none",
    guests: "none",
    rooms: "none",
    social: "none",
    reports: "none",
    events: "manage",
    massage: "manage",
  },
  admin: {
    overview: "manage",
    calendar: "manage",
    reservations: "manage",
    guests: "manage",
    rooms: "manage",
    social: "manage",
    reports: "manage",
    events: "manage",
    massage: "manage",
  },
};

function AccessControlPage() {
  const qc = useQueryClient();
  const fetchStaff = useServerFn(listPreviewableStaffFn);
  const getPerms = useServerFn(getManagerPermissionsFn);
  const savePerms = useServerFn(saveManagerPermissionsFn);

  const staff = useQuery({ queryKey: ["previewable-staff"], queryFn: fetchStaff, retry: false });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ResolvedPermissions | null>(null);
  const [saving, setSaving] = useState(false);

  const permsQuery = useQuery({
    queryKey: ["manager-perms", selectedUserId],
    queryFn: () => getPerms({ data: { target_user_id: selectedUserId! } }),
    enabled: !!selectedUserId,
  });

  React.useEffect(() => {
    if (permsQuery.data) setDraft(permsQuery.data);
  }, [permsQuery.data]);

  const managers = (staff.data ?? []).filter((s: PreviewStaff) =>
    s.roles.some((r) => r === "manager"),
  );

  async function save() {
    if (!selectedUserId || !draft) return;
    setSaving(true);
    try {
      await savePerms({ data: { target_user_id: selectedUserId, permissions: draft } });
      toast.success("Permissions saved");
      await qc.invalidateQueries({ queryKey: ["manager-perms", selectedUserId] });
      await qc.invalidateQueries({ queryKey: ["effective-perms"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function setAccess(module: ModuleKey, access: "none" | "view" | "manage") {
    if (!draft) return;
    setDraft({ ...draft, [module]: access });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Access Control</h1>
        <p className="text-sm text-stone-500 mt-1">
          Configure what each Manager can see and do. Only the Super Admin can change these
          settings. Role defaults apply to all Managers unless overridden per user.
        </p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        {/* User list */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Managers</h2>
          {managers.length === 0 && (
            <p className="text-xs text-stone-400">
              No Manager accounts yet. Create one in Users to configure access.
            </p>
          )}
          <div className="space-y-1">
            {managers.map((m: PreviewStaff) => (
              <button
                key={m.id}
                onClick={() => setSelectedUserId(m.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedUserId === m.id
                    ? "bg-[#2a382c] text-white"
                    : "hover:bg-stone-100 text-stone-700"
                }`}
              >
                <div className="truncate">{m.email}</div>
                <div className="text-[11px] opacity-70">Manager</div>
              </button>
            ))}
          </div>
        </div>

        {/* Permission editor */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          {!selectedUserId ? (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">
                Select a Manager to configure their module access.
              </p>
            </div>
          ) : !draft ? (
            <p className="text-sm text-stone-400">Loading permissions…</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-stone-900">Module Access</h2>
                <button
                  onClick={save}
                  disabled={saving}
                  className="bg-[#2a382c] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1b251e] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save permissions"}
                </button>
              </div>

              <div className="space-y-3">
                {MODULES.map((mod) => (
                  <div
                    key={mod.key}
                    className="flex items-center justify-between border-b border-stone-100 pb-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-800">{mod.label}</p>
                      <p className="text-[11px] text-stone-400">
                        {mod.supportsManage
                          ? "View and manage permitted operations"
                          : "View-only or no access"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {(["none", "view", "manage"] as const)
                        .filter((lvl) => mod.supportsManage || lvl !== "manage")
                        .map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setAccess(mod.key, lvl)}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${
                              draft[mod.key] === lvl
                                ? "bg-[#2a382c] text-white border-[#2a382c]"
                                : "border-stone-300 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {lvl === "none"
                              ? "No access"
                              : lvl === "view"
                                ? "View only"
                                : "View & manage"}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-500">
                  <strong>Effective access</strong> combines role defaults with these per-user
                  overrides. Managers can never access Users, Access Control, Integrations, refunds,
                  or payment settings regardless of these settings.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
