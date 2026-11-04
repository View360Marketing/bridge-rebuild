import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Server-side photo importer for the Hostaway catalog.
 *
 * Runs inside the app's server runtime where the Cloud service-role key is
 * available. Downloads verified images from Hostaway CDN into the project's
 * owned storage bucket and populates unit_media + primary_image_url.
 *
 * Idempotent: re-running updates existing media rows without duplicates.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SOURCE_HOSTS = new Set(["bookingenginecdn.hostaway.com", "bookingenginecdn-2.hostaway.com"]);

type ManifestPhoto = {
  source_image_id: string;
  download_url: string;
  relative_file: string;
  sort_order: number;
  is_primary: boolean;
  source_caption?: string | null;
  alt_text?: string | null;
  sha256: string;
  bytes?: number;
};

type ManifestListing = {
  hostaway_listing_id: string;
  media: ManifestPhoto[];
};

type Manifest = { listings: ManifestListing[] };

const EXPECTED_LISTINGS = 35;
const EXPECTED_MEDIA = 1031;

function validateSourceUrl(url: string): URL {
  const u = new URL(url);
  if (
    u.protocol !== "https:" ||
    !SOURCE_HOSTS.has(u.hostname) ||
    u.username ||
    u.password ||
    u.port
  ) {
    throw new Error("Unapproved image source");
  }
  return u;
}

async function downloadPhoto(photo: ManifestPhoto): Promise<Uint8Array> {
  const url = validateSourceUrl(photo.download_url);
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Image download HTTP ${response.status}`);
  const buf = await response.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length > MAX_IMAGE_BYTES || bytes.length < 12) {
    throw new Error("Invalid image size");
  }
  return bytes;
}

export type ImportProgress = {
  total_listings: number;
  total_media: number;
  unique_images: number;
  uploaded: number;
  failed: { sha256: string; error: string }[];
  gallery_links_copied: number;
  listings_complete: number;
  listings_incomplete: number;
};

export async function runPhotoImport(): Promise<ImportProgress> {
  const manifest = JSON.parse(
    await readFile(resolve(here, "../../../data/hostaway-listings.json"), "utf8"),
  ) as Manifest;

  const listings = manifest.listings;
  if (listings.length !== EXPECTED_LISTINGS) {
    throw new Error(`Expected ${EXPECTED_LISTINGS} listings, got ${listings.length}`);
  }
  const mediaTotal = listings.reduce((s, r) => s + r.media.length, 0);
  if (mediaTotal !== EXPECTED_MEDIA) {
    throw new Error(`Expected ${EXPECTED_MEDIA} media, got ${mediaTotal}`);
  }

  // Verify all 35 catalog mappings exist
  const { data: catalog } = await supabaseAdmin
    .from("hostaway_catalog")
    .select("listing_id, unit_id");
  const byId = new Map((catalog ?? []).map((r) => [r.listing_id, r.unit_id]));
  if (byId.size !== EXPECTED_LISTINGS || listings.some((r) => !byId.has(r.hostaway_listing_id))) {
    throw new Error("All 35 source mappings must exist in hostaway_catalog");
  }

  // Collect unique images across all listings
  const uniqueAssets = new Map<string, ManifestPhoto>();
  for (const listing of listings) {
    for (const photo of listing.media) {
      if (!uniqueAssets.has(photo.sha256)) {
        uniqueAssets.set(photo.sha256, photo);
      }
    }
  }

  const uploaded = new Set<string>();
  const failed: { sha256: string; error: string }[] = [];

  // Upload unique images in bounded batches of 4
  const queue = [...uniqueAssets.values()];
  const BATCH_SIZE = 4;
  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    const batch = queue.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (photo) => {
        try {
          if (uploaded.has(photo.sha256)) return;
          const bytes = await downloadPhoto(photo);
          const storagePath = `hostaway/assets/${photo.sha256}.webp`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("unit-media")
            .upload(storagePath, bytes, {
              contentType: "image/webp",
              cacheControl: "31536000",
              upsert: true,
            });
          if (upErr) throw new Error(upErr.message);
          uploaded.add(photo.sha256);
        } catch (e) {
          failed.push({ sha256: photo.sha256, error: (e as Error).message });
        }
      }),
    );
  }

  // Populate gallery records per listing
  let galleryLinksCopied = 0;
  let listingsComplete = 0;
  for (const listing of listings) {
    const unitId = byId.get(listing.hostaway_listing_id)!;
    const photos = listing.media.filter((p) => uploaded.has(p.sha256));
    const photoRecords = photos.map((p) => {
      const storagePath = `hostaway/assets/${p.sha256}.webp`;
      const supabaseUrl = process.env["SUPABASE_URL"];
      return {
        unit_id: unitId,
        image_url: `${supabaseUrl}/storage/v1/object/public/unit-media/${storagePath}`,
        alt_text: p.alt_text ?? listing.hostaway_listing_id,
        caption: p.source_caption ?? null,
        sort_order: p.sort_order,
        is_primary: p.is_primary,
        storage_path: storagePath,
        hostaway_image_id: p.source_image_id,
      };
    });

    // Delete existing hostaway media for this unit (idempotent replace)
    await supabaseAdmin
      .from("unit_media")
      .delete()
      .eq("unit_id", unitId)
      .like("storage_path", "hostaway/assets/%");

    if (photoRecords.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("unit_media").insert(photoRecords);
      if (insErr) {
        failed.push({ sha256: listing.hostaway_listing_id, error: insErr.message });
        continue;
      }
    }

    // Update primary_image_url + counters
    const primary = photos.find((p) => p.is_primary) ?? photos[0];
    if (primary) {
      const primaryStoragePath = `hostaway/assets/${primary.sha256}.webp`;
      const supabaseUrl2 = process.env["SUPABASE_URL"];
      const primaryUrl = `${supabaseUrl2}/storage/v1/object/public/unit-media/${primaryStoragePath}`;
      await supabaseAdmin
        .from("units")
        .update({
          primary_image_url: primaryUrl,
          hostaway_media_copied: photos.length,
          hostaway_media_expected: listing.media.length,
        })
        .eq("id", unitId);
    }

    galleryLinksCopied += photos.length;
    if (photos.length === listing.media.length) listingsComplete++;
  }

  return {
    total_listings: listings.length,
    total_media: mediaTotal,
    unique_images: uniqueAssets.size,
    uploaded: uploaded.size,
    failed,
    gallery_links_copied: galleryLinksCopied,
    listings_complete: listingsComplete,
    listings_incomplete: listings.length - listingsComplete,
  };
}

// Re-export the manifest validation for testing
export function validateManifest(manifest: Manifest): Manifest {
  const rows = manifest.listings;
  if (!Array.isArray(rows) || rows.length !== EXPECTED_LISTINGS) {
    throw new Error(`Expected exactly ${EXPECTED_LISTINGS} unique verified source listings`);
  }
  if (new Set(rows.map((r) => r.hostaway_listing_id)).size !== EXPECTED_LISTINGS) {
    throw new Error("Duplicate listing IDs");
  }
  if (rows.reduce((s, r) => s + r.media.length, 0) !== EXPECTED_MEDIA) {
    throw new Error("Incomplete photo manifest");
  }
  for (const row of rows) {
    if (row.media.filter((p) => p.is_primary).length !== 1) {
      throw new Error("Each listing needs exactly one source cover");
    }
    for (const photo of row.media) {
      validateSourceUrl(photo.download_url);
      if (photo.relative_file !== `assets/${photo.sha256}.webp`) {
        throw new Error("Unsafe photo backup path");
      }
    }
  }
  return manifest;
}

// Keep the hash import referenced for environments that use it
void createHash;
