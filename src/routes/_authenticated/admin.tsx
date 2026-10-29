import React from "react";
import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Layout route for /admin/*. Renders the shared admin shell and an Outlet so
 * nested pages (overview index, rooms, …) can mount. The Overview page body
 * lives in src/routes/_authenticated/admin/index.tsx.
 */
export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "The Bridges Admin" },
      { name: "description", content: "Property management for The Bridges." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const matchRoute = useMatchRoute();
  let active = "";
  if (matchRoute({ to: "/admin/rooms", fuzzy: true })) active = "rooms";
  else if (matchRoute({ to: "/admin/calendar", fuzzy: true })) active = "calendar";
  else if (matchRoute({ to: "/admin/reservations", fuzzy: true })) active = "reservations";
  else if (matchRoute({ to: "/admin/guests", fuzzy: true })) active = "guests";
  else if (matchRoute({ to: "/admin/payments", fuzzy: true })) active = "payments";
  else if (matchRoute({ to: "/admin/housekeeping", fuzzy: true })) active = "housekeeping";
  else if (matchRoute({ to: "/admin/rates", fuzzy: true })) active = "rates";
  else if (matchRoute({ to: "/admin/events", fuzzy: true })) active = "events";
  else if (matchRoute({ to: "/admin/reports", fuzzy: true })) active = "reports";
  else if (matchRoute({ to: "/admin/users", fuzzy: true })) active = "users";
  else if (matchRoute({ to: "/admin/settings", fuzzy: true })) active = "settings";
  else if (matchRoute({ to: "/admin/integrations", fuzzy: true })) active = "integrations";
  else if (matchRoute({ to: "/admin/groups", fuzzy: true })) active = "groups";
  else if (matchRoute({ to: "/admin" })) active = "overview";
  return (
    <AdminShell active={active}>
      <Outlet />
    </AdminShell>
  );
}
