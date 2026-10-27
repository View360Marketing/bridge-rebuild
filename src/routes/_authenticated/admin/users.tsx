import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listStaffUsersFn,
  createStaffUserFn,
  assignRoleFn,
  removeRoleFn,
  disableUserFn,
  enableUserFn,
  resetPasswordFn,
  type StaffUser,
} from "@/lib/booking/operations.functions";
import { Plus, X, UserCog, Shield, ShieldOff, KeyRound, UserX, UserCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users | The Bridges Admin" },
      { name: "description", content: "Staff accounts, roles, and permissions." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const list = useServerFn(listStaffUsersFn);
  const create = useServerFn(createStaffUserFn);
  const assign = useServerFn(assignRoleFn);
  const remove = useServerFn(removeRoleFn);
  const disable = useServerFn(disableUserFn);
  const enable = useServerFn(enableUserFn);
  const reset = useServerFn(resetPasswordFn);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: list });
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading users…</p>;
  if (error) return <ErrorBox message={(error as Error).message} />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Users & Roles</h1>
          <p className="text-sm text-stone-500 mt-1">{data?.length ?? 0} staff account(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {data && data.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Roles</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles ?? []).map((r) => (
                        <span
                          key={r}
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#2a382c]/10 text-[#2a382c] capitalize"
                        >
                          {r.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!u.is_active ? (
                      <span className="text-xs text-rose-600">Disabled</span>
                    ) : (
                      <span className="text-xs text-emerald-600">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!u.roles?.includes("super_admin") && (
                        <select
                          defaultValue=""
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            try {
                              await assign({
                                data: { target_user_id: u.id, role: e.target.value as never },
                              });
                              toast.success("Role assigned");
                              await refresh();
                            } catch (err) {
                              toast.error((err as Error).message);
                            }
                            e.target.value = "";
                          }}
                          className="text-xs border border-stone-300 rounded-lg px-2 py-1"
                        >
                          <option value="">+ Role</option>
                          <option value="manager">Manager</option>
                          <option value="front_desk">Front desk</option>
                          <option value="housekeeping">Housekeeping</option>
                          <option value="read_only">Read-only</option>
                        </select>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("Send a password reset email?")) return;
                          try {
                            await reset({ data: { target_user_id: u.id } });
                            toast.success("Reset email queued");
                          } catch (err) {
                            toast.error((err as Error).message);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
                        title="Reset password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      {!u.is_active ? (
                        <button
                          onClick={async () => {
                            try {
                              await enable({ data: { target_user_id: u.id } });
                              toast.success("User enabled");
                              await refresh();
                            } catch (err) {
                              toast.error((err as Error).message);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700"
                          title="Enable"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!confirm("Disable this user? They will lose access immediately."))
                              return;
                            try {
                              await disable({ data: { target_user_id: u.id } });
                              toast.success("User disabled");
                              await refresh();
                            } catch (err) {
                              toast.error((err as Error).message);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-700"
                          title="Disable"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No staff accounts"
          body="Add staff and assign roles to control access to the dashboard."
          actionLabel="Add Staff"
          onAction={() => setShowForm(true)}
        />
      )}

      {showForm && (
        <UserForm
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            try {
              await create({ data: input });
              toast.success("Staff account created");
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

function UserForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: Record<string, unknown>) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "front_desk" | "housekeeping" | "read_only">(
    "manager",
  );
  const [sendInvite, setSendInvite] = useState(false);
  return (
    <Modal title="Add Staff Account" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ email, password, role, send_invite: sendInvite });
        }}
        className="space-y-3"
      >
        <Field label="Email *">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Password *">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as never)}
            className={inputCls}
          >
            <option value="manager">Manager</option>
            <option value="front_desk">Front desk</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="read_only">Read-only</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
          />
          Send invite email (requires configured email)
        </label>
        <FormActions onClose={onClose} label="Create Account" />
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

const inputCls =
  "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a382c]";
