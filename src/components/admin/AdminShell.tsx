import React from "react";
import { Link } from "@tanstack/react-router";
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
  Wrench,
  BarChart3,
  UserCog,
} from "lucide-react";

const NAV = [
  { key: "overview", label: "Overview", to: "/admin", icon: LayoutGrid, ready: true },
  { key: "calendar", label: "Calendar", to: "/admin/calendar", icon: CalendarDays, ready: true },
  {
    key: "reservations",
    label: "Reservations",
    to: "/admin/reservations",
    icon: ClipboardList,
    ready: true,
  },
  { key: "rooms", label: "Rooms & Properties", to: "/admin/rooms", icon: Building2, ready: true },
  { key: "rates", label: "Rates & Rules", to: "/admin/rates", icon: DollarSign, ready: true },
  { key: "guests", label: "Guests", to: "/admin/guests", icon: Users, ready: true },
  { key: "payments", label: "Payments", to: "/admin/payments", icon: DollarSign, ready: true },
  {
    key: "housekeeping",
    label: "Housekeeping",
    to: "/admin/housekeeping",
    icon: Sparkles,
    ready: true,
  },
  { key: "reports", label: "Reports", to: "/admin/reports", icon: BarChart3, ready: true },
  { key: "users", label: "Users", to: "/admin/users", icon: UserCog, ready: true },
  { key: "settings", label: "Settings", to: "/admin/settings", icon: Settings, ready: true },
  {
    key: "integrations",
    label: "Integrations",
    to: "/admin/integrations",
    icon: Plug,
    ready: true,
  },
];

export function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-stone-800 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#1b251e] text-stone-200 hidden md:flex flex-col">
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
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {!item.ready && <span className="text-[10px] text-stone-500">soon</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
