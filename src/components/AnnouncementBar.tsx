import React, { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

/**
 * Single-row announcement bar.
 *
 * The ENTIRE announcement — every text segment, every bullet separator, and
 * the phone link — lives inside ONE non-wrapping track (`width: max-content`,
 * `white-space: nowrap`, `inline-flex` / `flex-wrap: nowrap`). The track can
 * never form a second row because it is laid out at its natural content width
 * inside a fixed-height viewport with `overflow: hidden`.
 *
 * When the content is wider than the viewport we animate the track as a
 * seamless marquee (two identical copies, translateX(-50%)). When it fits
 * naturally the track stays static. Reduced-motion users get a horizontally
 * scrollable static row instead of animation. Motion pauses on hover/focus.
 */
const TEXT_SEGMENTS = [
  "Now Booking 2027 Weddings and Retreats",
  "Reserve your date early and start planning your unforgettable event",
  "Weddings, retreats, and special gatherings are now being booked for 2027",
];

const SEPARATOR = "•";

const FULL_TEXT = [...TEXT_SEGMENTS, "Call us at 931-722-5589!"].join(` ${SEPARATOR} `);

function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span
      aria-hidden={ariaHidden}
      style={{
        display: "inline-flex",
        flexWrap: "nowrap",
        alignItems: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {TEXT_SEGMENTS.map((seg, i) => (
        <React.Fragment key={i}>
          <span style={{ flexShrink: 0, whiteSpace: "nowrap" }} className="mx-3">
            {seg}
          </span>
          <span
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            className="text-white/60 mx-1"
            aria-hidden="true"
          >
            {SEPARATOR}
          </span>
        </React.Fragment>
      ))}
      <a
        href="tel:+19317225589"
        aria-label="Call The Bridges at 931-722-5589"
        className="mx-3 inline-flex items-center gap-1.5 text-white hover:text-white"
        style={{ flexShrink: 0, whiteSpace: "nowrap" }}
      >
        <Phone className="w-3.5 h-3.5 shrink-0" />
        <span>Call us at 931-722-5589!</span>
      </a>
    </span>
  );
}

export function AnnouncementBar() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;
    const check = () => setOverflowing(tr.scrollWidth > vp.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(vp);
    ro.observe(tr);
    return () => ro.disconnect();
  }, []);

  const animate = overflowing && !reducedMotion;

  return (
    <div
      className="bg-[#1b251e] text-white border-b border-white/10"
      onMouseEnter={(e) => {
        if (!animate) return;
        const m = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (m) m.style.animationPlayState = "paused";
      }}
      onMouseLeave={(e) => {
        if (!animate) return;
        const m = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (m) m.style.animationPlayState = "running";
      }}
      onFocusCapture={(e) => {
        if (!animate) return;
        const m = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (m) m.style.animationPlayState = "paused";
      }}
      onBlurCapture={(e) => {
        if (!animate) return;
        const m = e.currentTarget.querySelector<HTMLElement>("[data-marquee]");
        if (m) m.style.animationPlayState = "running";
      }}
    >
      <div
        ref={viewportRef}
        role="marquee"
        aria-label={FULL_TEXT}
        style={{
          width: "100%",
          minWidth: 0,
          height: "2.5rem",
          overflow: animate ? "hidden" : "auto",
          display: "flex",
          alignItems: "center",
          scrollbarWidth: "thin",
        }}
      >
        <span
          ref={trackRef}
          data-marquee={animate ? "" : undefined}
          className="text-xs sm:text-sm font-medium"
          style={{
            display: "inline-flex",
            flexWrap: "nowrap",
            alignItems: "center",
            whiteSpace: "nowrap",
            width: "max-content",
            flexShrink: 0,
            paddingLeft: animate ? undefined : "1rem",
            ...(animate
              ? {
                  animation: "announcement-marquee 38s linear infinite",
                  willChange: "transform",
                }
              : {}),
          }}
        >
          <Track />
          {animate && <Track ariaHidden />}
        </span>
      </div>
      {animate && (
        <style>{`@keyframes announcement-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      )}
    </div>
  );
}
