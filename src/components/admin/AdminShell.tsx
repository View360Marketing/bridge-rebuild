import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  CalendarDays,
  Users,
  DollarSign,
  Sparkles,
  ClipboardList,
  Plug,
  Settings,
  LayoutGrid,
  BarChart3,
  UserCog,
  Megaphone,
  LogOut,
  Eye,
  X,
  ShieldCheck,
  Menu,
  Hand,
} from "lucide-react";
import {
  getEffectivePermissionsFn,
  type ResolvedPermissions,
  type ModuleKey,
} from "@/lib/booking/permissions.functions";
import {
  listPreviewableStaffFn,
  startPreviewFn,
  exitPreviewFn,
  type PreviewStaff,
} from "@/lib/booking/preview.functions";

type NavItem = {
  key: ModuleKey | string;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: ModuleKey;
};

// Modules that are always available to super_admin/admin regardless of per-module perms.
const ADMIN_ONLY_ITEMS: NavItem[] = [
  { key: "users", label: "Users", to: "/admin/users", icon: UserCog },
  { key: "access", label: "Access Control", to: "/admin/access-control", icon: ShieldCheck },
  { key: "settings", label: "Settings", to: "/admin/settings", icon: Settings },
  { key: "integrations", label: "Integrations", to: "/admin/integrations", icon: Plug },
];

const MODULE_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", to: "/admin", icon: LayoutGrid, module: "overview" },
  {
    key: "manager-dashboard",
    label: "Dashboard",
    to: "/admin/manager-dashboard",
    icon: LayoutGrid,
    module: "overview",
  },
  {
    key: "calendar",
    label: "Calendar",
    to: "/admin/calendar",
    icon: CalendarDays,
    module: "calendar",
  },
  {
    key: "reservations",
    label: "Reservations",
    to: "/admin/reservations",
    icon: ClipboardList,
    module: "reservations",
  },
  { key: "guests", label: "Guests", to: "/admin/guests", icon: Users, module: "guests" },
  {
    key: "payments",
    label: "Payments",
    to: "/admin/payments",
    icon: DollarSign,
    module: "reservations",
  },
  {
    key: "housekeeping",
    label: "Housekeeping",
    to: "/admin/housekeeping",
    icon: Sparkles,
    module: "overview",
  },
  {
    key: "rooms",
    label: "Rooms & Properties",
    to: "/admin/rooms",
    icon: Building2,
    module: "rooms",
  },
  { key: "rates", label: "Rates & Rules", to: "/admin/rates", icon: DollarSign, module: "rooms" },
  { key: "events", label: "Events", to: "/admin/events", icon: Megaphone, module: "events" },
  {
    key: "social",
    label: "Social Media",
    to: "/admin/social-media",
    icon: Megaphone,
    module: "social",
  },
  { key: "reports", label: "Reports", to: "/admin/reports", icon: BarChart3, module: "reports" },
];

export function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchPerms = useServerFn(getEffectivePermissionsFn);
  const fetchStaff = useServerFn(listPreviewableStaffFn);
  const startPreview = useServerFn(startPreviewFn);
  const exitPreviewCall = useServerFn(exitPreviewFn);

  const perms = useQuery({ queryKey: ["effective-perms"], queryFn: fetchPerms });
  const staff = useQuery({
    queryKey: ["previewable-staff"],
    queryFn: fetchStaff,
    retry: false,
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = perms.data?.role ?? "guest";
  const permissions: ResolvedPermissions | undefined = perms.data?.permissions;
  const isPreview = perms.data?.isPreview ?? false;
  const previewTarget = perms.data?.previewTarget;
  const isSuperOrAdmin = role === "super_admin" || role === "admin";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  async function handlePreview(option: string) {
    setDropdownOpen(false);
    try {
      if (option === "exit") {
        await exitPreviewCall();
        toast.success("Exited preview");
      } else if (option === "manager") {
        await startPreview({ data: { role: "manager" } });
        toast.success("Previewing Manager role");
      } else if (option === "admin") {
        await startPreview({ data: { role: "admin" } });
        toast.success("Previewing Admin role");
      } else if (option.startsWith("user:")) {
        const userId = option.slice(5);
        await startPreview({ data: { user_id: userId } });
        toast.success("Previewing staff member");
      }
      await qc.invalidateQueries({ queryKey: ["effective-perms"] });
      // Land managers on their operations dashboard (their default landing).
      if (option === "manager" || option.startsWith("user:")) {
        navigate({ to: "/admin/manager-dashboard" });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  // Filter nav items by permissions.
  const visibleModuleItems = MODULE_ITEMS.filter((item) => {
    if (!item.module || !permissions) return true;
    return permissions[item.module] !== "none";
  });

  // Admin-only items visible to super_admin/admin (not in preview).
  const visibleAdminItems = isSuperOrAdmin && !isPreview ? ADMIN_ONLY_ITEMS : [];

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png"
            alt="The Bridges"
            className="h-9 w-auto"
          />
          <span className="text-xs text-stone-400 uppercase tracking-wider">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Dashboard
          </p>
          <div className="space-y-0.5">
            {visibleModuleItems
              .filter((i) => ["overview", "manager-dashboard"].includes(i.key))
              .map((item) => renderNav(item, active))}
          </div>
        </div>
        {visibleModuleItems.filter((i) =>
          ["calendar", "reservations", "guests", "payments", "housekeeping"].includes(i.key),
        ).length > 0 && (
          <div className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Operations
            </p>
            <div className="space-y-0.5">
              {visibleModuleItems
                .filter((i) =>
                  ["calendar", "reservations", "guests", "payments", "housekeeping"].includes(
                    i.key,
                  ),
                )
                .map((item) => renderNav(item, active))}
            </div>
          </div>
        )}
        {visibleModuleItems.filter((i) => ["rooms", "rates", "events"].includes(i.key)).length >
          0 && (
          <div className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Property
            </p>
            <div className="space-y-0.5">
              {visibleModuleItems
                .filter((i) => ["rooms", "rates", "events"].includes(i.key))
                .map((item) => renderNav(item, active))}
            </div>
          </div>
        )}
        {visibleModuleItems.filter((i) => ["social", "reports"].includes(i.key)).length > 0 && (
          <div className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Insights
            </p>
            <div className="space-y-0.5">
              {visibleModuleItems
                .filter((i) => ["social", "reports"].includes(i.key))
                .map((item) => renderNav(item, active))}
            </div>
          </div>
        )}
        {visibleAdminItems.length > 0 && (
          <div className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Administration
            </p>
            <div className="space-y-0.5">
              {visibleAdminItems.map((item) => renderNav(item, active))}
            </div>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-stone-800 flex">
      {/* Desktop sidebar */}
      <aside className="w-60 shrink-0 bg-[#1b251e] text-stone-200 hidden md:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#1b251e] text-stone-200 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-lg font-bold text-stone-900 hidden sm:block">Admin</h1>

            {/* View as dropdown */}
            {isSuperOrAdmin && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm border border-stone-300 rounded-lg px-3 py-1.5 hover:bg-stone-50"
                >
                  <Eye className="w-4 h-4 text-stone-500" />
                  <span className="text-stone-700">
                    {isPreview
                      ? `Viewing as ${previewTarget?.name ?? previewTarget?.role ?? "preview"}`
                      : `View as: ${role === "super_admin" ? "Super Admin" : "Admin"}`}
                  </span>
                  <span className="text-stone-400">▾</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-1">
                    {!isPreview && (
                      <>
                        <button
                          onClick={() => handlePreview("self")}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 text-stone-700"
                        >
                          My view — {role === "super_admin" ? "Super Admin" : "Admin"}
                        </button>
                        <div className="border-t border-stone-100 my-1" />
                        <button
                          onClick={() => handlePreview("manager")}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 text-stone-700"
                        >
                          Manager view
                        </button>
                        {role === "super_admin" && (
                          <button
                            onClick={() => handlePreview("admin")}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 text-stone-700"
                          >
                            Admin view
                          </button>
                        )}
                        {(staff.data ?? []).length > 0 && (
                          <>
                            <div className="border-t border-stone-100 my-1" />
                            <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-stone-400">
                              Staff
                            </p>
                            {(staff.data ?? []).map((s: PreviewStaff) => (
                              <button
                                key={s.id}
                                onClick={() => handlePreview(`user:${s.id}`)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50"
                              >
                                <div className="text-stone-800 truncate">{s.email}</div>
                                <div className="text-[11px] text-stone-400 capitalize">
                                  {s.roles.join(", ").replace(/_/g, " ")}
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </>
                    )}
                    {isPreview && (
                      <button
                        onClick={() => handlePreview("exit")}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Exit preview
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSuperOrAdmin && !isPreview && (
              <Link
                to="/admin/access-control"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg px-2.5 py-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Manage access
              </Link>
            )}
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg px-2.5 py-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Preview banner */}
        {isPreview && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 sm:px-6 py-2 flex items-center justify-between">
            <p className="text-sm text-amber-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Previewing {previewTarget?.name ?? previewTarget?.role ?? "Manager"} — read-only
            </p>
            <button
              onClick={() => handlePreview("exit")}
              className="text-sm text-amber-900 font-medium hover:underline flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Exit preview
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">{children}</div>
        </div>
      </main>
    </div>
  );

  function renderNav(item: NavItem, activeKey: string) {
    const Icon = item.icon;
    const isActive = item.key === activeKey || (item.to === "/admin" && activeKey === "overview");
    return (
      <Link
        key={item.key}
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive ? "bg-white/15 text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  }
}
