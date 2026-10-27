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
  else if (matchRoute({ to: "/admin" })) active = "overview";
  return (
    <AdminShell active={active}>
      <Outlet />
    </AdminShell>
  );
}