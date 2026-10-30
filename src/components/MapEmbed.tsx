import React from "react";

interface MapEmbedProps {
  /** Optional extra classes for the wrapper */
  className?: string;
  /** Optional height class (Tailwind). Defaults to h-[360px]. */
  heightClass?: string;
  /** Optional heading shown above the map. */
  title?: string;
  /** Optional subtext shown under the heading. */
  subtitle?: string;
}

// The Bridges — 299 Natural Bridge Park Rd, Waynesboro, TN 38485
const PLACE_QUERY = "The+Bridges,+299+Natural+Bridge+Park+Rd,+Waynesboro,+TN+38485";
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${PLACE_QUERY}&output=embed`;
const MAP_LINK = `https://maps.app.goo.gl/HiuVGpDerVDiNx4S7`;

export function MapEmbed({
  className = "",
  heightClass = "h-[360px]",
  title,
  subtitle,
}: MapEmbedProps) {
  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-serif text-2xl font-bold text-stone-900">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-stone-600 mt-1 leading-relaxed font-light">{subtitle}</p>
          )}
        </div>
      )}
      <div
        className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100`}
      >
        <iframe
          title="Map to The Bridges — 299 Natural Bridge Park Rd, Waynesboro, TN 38485"
          src={MAP_EMBED_SRC}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <a
        href={MAP_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#2a382c] hover:text-[#1b251e] transition-colors"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
