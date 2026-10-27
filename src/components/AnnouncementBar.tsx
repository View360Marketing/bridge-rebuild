import React, { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

/**
 * Single-row announcement bar.
 *
 * The full announcement is long, so on viewports where it does not fit
 * naturally we render a seamless marquee ticker. When it fits, it stays
 * static. Motion pauses on hover/focus and respects prefers-reduced-motion
 * (a horizontally scrollable static row is shown instead).
 */
const ANNOUNCEMENT = [
  "Now Booking 2027 Weddings and Retreats",
  "Reserve your date early and start planning your unforgettable event",
  "Weddings, retreats, and special gatherings are now being booked for 2027",
  "Call us at 931-722-5589!",
];

const SEPARATOR = "•";

function AnnouncementTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap" aria-hidden={ariaHidden}>
      {ANNOUNCEMENT.map((item, i) => (
        <React.Fragment key={i}>
          <span className="mx-3">{item}</span>
          {i < ANNOUNCEMENT.length - 1 && (
            <span className="text-white/70" aria-hidden="true">
              {SEPARATOR}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export function AnnouncementBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduced = () => setReducedMotion(mq.matches);
    updateReduced();
    mq.addEventListener("change", updateReduced);
    return () => mq.removeEventListener("change", updateReduced);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const check = () => {
      const inner = el.querySelector<HTMLElement>("[data-track]");
      if (!inner) return;
      setOverflowing(inner.scrollWidth > el.clientWidth + 2);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const innerEl = el.querySelector<HTMLElement>("[data-track]");
    if (innerEl) ro.observe(innerEl);
    return () => ro.disconnect();
  }, []);

  // Static row when it fits OR when reduced motion is requested.
  if (!overflowing || reducedMotion) {
    return (
      <div className="bg-[#1b251e] text-white border-b border-white/10">
        <div
          ref={trackRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div
            data-track
            className="flex items-center whitespace-nowrap text-xs sm:text-sm font-medium"
          >
            {ANNOUNCEMENT.map((item, i) => (
              <React.Fragment key={i}>
                <span className="mx-2 first:ml-0">{item}</span>
                {i < ANNOUNCEMENT.length - 1 && (
                  <span className="text-white/60 mx-1" aria-hidden="true">
                    {SEPARATOR}
                  </span>
                )}
              </React.Fragment>
            ))}
            <a
              href="tel:+19317225589"
              className="ml-2 inline-flex items-center gap-1 text-white/90 hover:text-white shrink-0"
              aria-label="Call The Bridges at 931-722-5589"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Seamless marquee ticker.
  return (
    <div
      className="bg-[#1b251e] text-white border-b border-white/10 group"
      onMouseEnter={(e) => {
        e.currentTarget
          .querySelectorAll<HTMLElement>("[data-marquee]")
          .forEach((n) => (n.style.animationPlayState = "paused"));
      }}
      onMouseLeave={(e) => {
        e.currentTarget
          .querySelectorAll<HTMLElement>("[data-marquee]")
          .forEach((n) => (n.style.animationPlayState = "running"));
      }}
      onFocusCapture={(e) => {
        const target = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (target) target.style.animationPlayState = "paused";
      }}
      onBlurCapture={(e) => {
        const target = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (target) target.style.animationPlayState = "running";
      }}
    >
      <div
        ref={trackRef}
        className="h-10 overflow-hidden flex items-center"
        aria-label={ANNOUNCEMENT.join(" • ")}
      >
        <div
          data-marquee
          data-track
          className="flex items-center whitespace-nowrap text-xs sm:text-sm font-medium will-change-transform"
          style={{
            animation: "announcement-marquee 38s linear infinite",
            paddingLeft: "1rem",
          }}
        >
          <AnnouncementTrack />
          {/* duplicate for seamless loop, hidden from AT */}
          <AnnouncementTrack ariaHidden />
          <AnnouncementTrack ariaHidden />
        </div>
      </div>
      <style>{`
        @keyframes announcement-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.3333%); }
        }
      `}</style>
    </div>
  );
}
