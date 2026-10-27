import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * /stay layout — renders <Outlet /> so nested routes (/stay/$unitId) mount.
 * The listing page body lives in /stay.index.tsx.
 */
export const Route = createFileRoute("/stay")({
  head: () => ({
    meta: [
      { title: "Stay at The Bridges | Waynesboro, TN Lodging" },
      {
        name: "description",
        content:
          "Search real availability and book your stay at The Bridges. Cabins, guest rooms, and RV sites near Tennessee's Natural Bridge.",
      },
    ],
  }),
  component: StayLayout,
});

function StayLayout() {
  return <Outlet />;
}
