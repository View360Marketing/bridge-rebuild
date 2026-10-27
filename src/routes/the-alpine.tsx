import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect legacy /the-alpine route permanently to home without showing restaurant content
export const Route = createFileRoute("/the-alpine")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
