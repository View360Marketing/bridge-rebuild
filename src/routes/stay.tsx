import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * /stay layout — renders <Outlet /> so nested routes (/stay/$unitId) mount.
 * The listing page body lives in /stay.index.tsx.
 *
 * The direct-booking flow is not ready for public use yet. Gate the entire
 * /stay subtree behind staff authentication; non-staff visitors are
 * redirected to the staff login. Staff who sign in can still access /stay
 * to preview the in-progress flow.
 */
export const Route = createFileRoute("/stay")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Stay at The Bridges | Waynesboro, TN Lodging" },
      {
        name: "description",
        content:
          "Search real availability and book your stay at The Bridges. Cabins, guest rooms, and RV sites near Tennessee's Natural Bridge.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StayLayout,
});

function StayLayout() {
  return <Outlet />;
}