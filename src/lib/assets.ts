/**
 * The Bridges — Media Asset Registry
 *
 * Central mapping of the retiring WordPress-hosted media URLs to durable,
 * app-owned storage URLs. Every original asset was downloaded and verified
 * before its reference was replaced. Keep this registry as the source of
 * truth for asset provenance.
 *
 * Storage: vibe.filesafe.space (durable, app-owned, independent of WordPress).
 * The homepage hero video lives on assets.cdn.filesafe.space (already
 * independent of WordPress) and is unchanged.
 *
 * Generated 2026-10-27. Do not restore superseded Alpine or October
 * movie-night promotional assets from the archive.
 */

export type AssetEntry = {
  /** Original WordPress URL (retiring host). */
  oldUrl: string;
  /** New durable, app-owned URL. */
  newUrl: string;
  /** Stable identifier / slug. */
  slug: string;
  /** Content type. */
  contentType: string;
  /** Human-readable alt / caption. */
  alt: string;
  /** Usage locations in the app. */
  usedIn: string[];
};

export const ASSET_REGISTRY: AssetEntry[] = [
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Natural-Bridge_Wayne-County-66-scaled.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/30945ebf-a148-4ad5-a769-9044e5e3bc37.jpg",
    slug: "natural-bridge-scaled",
    contentType: "image/jpeg",
    alt: "Tennessee's Natural Bridge rock formation at The Bridges",
    usedIn: ["ContactSection", "ExploreLandmarks", "gallery"],
  },
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Ice-Cave_Wayne-County-56-scaled.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/5d66d3b1-c34d-4f33-b0fa-032e1acf1ec5.jpg",
    slug: "ice-cave-scaled",
    contentType: "image/jpeg",
    alt: "The Ice Cave at The Bridges, Wayne County",
    usedIn: ["ExploreLandmarks", "gallery"],
  },
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Natural-Bridge_Wayne-County-66-1024x683.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/fab01de6-ea36-4c90-936b-29f93a1c006b.jpg",
    slug: "natural-bridge-1024",
    contentType: "image/jpeg",
    alt: "Tennessee's Natural Bridge rock formation at The Bridges",
    usedIn: ["ExploreLandmarks", "about-us", "events", "gallery", "index", "massage-wellness"],
  },
  {
    oldUrl: "https://thebridgestn.com/wp-content/uploads/2026/05/DSC2575-2-scaled.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/cab64087-066e-4e81-bd41-ad9bd9aba5f4.jpg",
    slug: "dsc2575-scaled",
    contentType: "image/jpeg",
    alt: "The Bridges resort grounds and scenery",
    usedIn: ["ExploreLandmarks", "amenities", "events", "gallery"],
  },
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges-infographic-1024x1024.png",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png",
    slug: "the-bridges-infographic",
    contentType: "image/png",
    alt: "The Bridges logo",
    usedIn: ["Header", "Footer", "AdminShell"],
  },
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_The-Willows-Event-Space_Wayne-County-39-1024x683.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/a826cf17-b6ac-415c-8c3b-6f1f59123962.jpg",
    slug: "the-willows-event-space",
    contentType: "image/jpeg",
    alt: "The Willows Event Space at The Bridges",
    usedIn: ["Hero", "events", "gallery", "weddings-events"],
  },
  {
    oldUrl:
      "https://thebridgestn.com/wp-content/uploads/2026/04/The-Bridges_Room-41_Wayne-County-69-1024x683.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/dc17e0c3-4e99-4b89-a69a-d623b2504ca8.jpg",
    slug: "room-41",
    contentType: "image/jpeg",
    alt: "Guest Room 41 at The Bridges",
    usedIn: ["amenities", "gallery", "index"],
  },
  {
    oldUrl: "https://thebridgestn.com/wp-content/uploads/2026/05/facilities27-min.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/b8fc567d-a74f-475f-a864-1e55446e5777.jpg",
    slug: "facilities27",
    contentType: "image/jpeg",
    alt: "The Bridges resort cabins and facilities",
    usedIn: ["events", "gallery", "index", "weddings-events"],
  },
  {
    oldUrl: "https://thebridgestn.com/wp-content/uploads/2026/08/IMG_7798-768x1024.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/0d9abec6-3cfb-413a-b63e-f2110da45dd9.jpg",
    slug: "img-7798",
    contentType: "image/jpeg",
    alt: "The Bridges resort amenities",
    usedIn: ["amenities", "gallery"],
  },
  {
    oldUrl: "https://thebridgestn.com/wp-content/uploads/2026/08/IMG_9626-1-768x1024.jpg",
    newUrl:
      "https://vibe.filesafe.space/1790196628861484830/assets/6eb4c2ea-6cc9-4cd6-8967-f444d1821ae6.jpg",
    slug: "img-9626",
    contentType: "image/jpeg",
    alt: "The Bridges resort amenities",
    usedIn: ["amenities", "gallery"],
  },
];

/** Map of old WordPress URL -> new durable URL for quick lookup. */
export const ASSET_URL_MAP: Record<string, string> = Object.fromEntries(
  ASSET_REGISTRY.map((a) => [a.oldUrl, a.newUrl]),
);

/** Resolve an old URL to its durable replacement, or return the input. */
export function resolveAssetUrl(url: string): string {
  return ASSET_URL_MAP[url] ?? url;
}
