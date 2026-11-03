import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/events")({
  component: EventsLayout,
});

function EventsLayout() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
