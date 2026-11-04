/** Run on a trusted server with its existing Cloud service-role environment. */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SOURCE_HOSTS = new Set(["bookingenginecdn.hostaway.com", "bookingenginecdn-2.hostaway.com"]);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export function validateImage(bytes, photo) {
  if (!/^[a-f0-9]{64}$/.test(photo.sha256)) throw new Error("Invalid expected image checksum");
  if (bytes.length > MAX_IMAGE_BYTES || bytes.length < 12) throw new Error("Invalid image size");
  if (bytes.subarray(0, 4).toString() !== "RIFF" || bytes.subarray(8, 12).toString() !== "WEBP") {
    throw new Error("Expected verified WebP image bytes");
  }
  if (createHash("sha256").update(bytes).digest("hex") !== photo.sha256) {
    throw new Error(
      "Image checksum changed; use the verified photo backup or review a new source snapshot",
    );
  }
  return bytes;
}

export function validateSourceUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !SOURCE_HOSTS.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new Error("Unapproved image source");
  }
  return url;
}

export function validateManifest(manifest) {
  const rows = manifest.listings;
  if (
    !Array.isArray(rows) ||
    rows.length !== 35 ||
    new Set(rows.map((r) => r.hostaway_listing_id)).size !== 35
  ) {
    throw new Error("Expected exactly 35 unique verified source listings");
  }
  if (rows.reduce((sum, r) => sum + r.media.length, 0) !== 1031)
    throw new Error("Incomplete photo manifest");
  for (const row of rows) {
    if (row.media.filter((p) => p.is_primary).length !== 1)
      throw new Error("Each listing needs one source cover");
    for (const photo of row.media) {
      validateSourceUrl(photo.download_url);
      if (photo.relative_file !== `assets/${photo.sha256}.webp`)
        throw new Error("Unsafe photo backup path");
    }
  }
  return rows;
}

export function parseArgs(args) {
  if (args.includes("--apply") && args.includes("--dry-run"))
    throw new Error("Choose either --dry-run or --apply, not both");
  let backupRoot;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--media-dir") {
      backupRoot = args[++i];
      if (!backupRoot || backupRoot.startsWith("--"))
        throw new Error("--media-dir needs an extracted backup directory");
    } else if (!["--apply", "--dry-run"].includes(args[i])) {
      throw new Error(
        "Usage: node scripts/import-hostaway-photos.mjs [--dry-run|--apply] [--media-dir /extracted/photo-backup]",
      );
    }
  }
  return { apply: args.includes("--apply"), backupRoot };
}

async function downloadPhoto(photo, backupRoot) {
  if (backupRoot)
    return validateImage(await readFile(resolve(backupRoot, photo.relative_file)), photo);
  const response = await fetch(validateSourceUrl(photo.download_url), {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Image download HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Image response has no body");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_IMAGE_BYTES) throw new Error("Source image exceeds upload limit");
      chunks.push(Buffer.from(part.value));
    }
  } finally {
    await reader.cancel();
  }
  return validateImage(Buffer.concat(chunks), photo);
}

export async function main(args = process.argv.slice(2)) {
  const { apply, backupRoot } = parseArgs(args);
  const manifest = JSON.parse(
    await readFile(new URL("../data/hostaway-listings.json", import.meta.url), "utf8"),
  );
  const rows = validateManifest(manifest);
  const project = new URL(process.env.SUPABASE_URL ?? "https://invalid.invalid");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    project.protocol !== "https:" ||
    !project.hostname.endsWith(".supabase.co") ||
    project.pathname !== "/"
  ) {
    throw new Error("Set the deployed project SUPABASE_URL in the trusted server environment");
  }
  if (
    !key ||
    !(
      key.startsWith("sb_secret_") ||
      (key.split(".").length === 3 &&
        JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "service_role")
    )
  ) {
    throw new Error(
      "Requires the existing server SUPABASE_SERVICE_ROLE_KEY; never use a browser key or paste secrets in chat",
    );
  }
  const headers = { apikey: key };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  async function request(path, init = {}) {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(new URL(path, project), {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(30000),
          headers: { ...headers, ...init.headers },
        });
        if (!response.ok) {
          const message = `Cloud request failed: HTTP ${response.status} at ${path.split("?")[0]}`;
          if (![408, 429, 500, 502, 503, 504].includes(response.status))
            throw Object.assign(new Error(message), { noRetry: true });
          throw new Error(message);
        }
        return response;
      } catch (error) {
        lastError = error;
        if (error.noRetry) break;
        if (attempt < 2) await pause((attempt + 1) * 1000);
      }
    }
    throw lastError;
  }
  const catalog = await (
    await request("/rest/v1/hostaway_catalog?select=listing_id,unit_id")
  ).json();
  const byId = new Map(catalog.map((r) => [r.listing_id, r.unit_id]));
  if (catalog.length !== 35 || rows.some((r) => !byId.has(r.hostaway_listing_id))) {
    throw new Error(
      "Apply the Hostaway catalog migration to this project first; all 35 source mappings must exist",
    );
  }
  const before = await (
    await request(
      "/rest/v1/units?hostaway_listing_id=not.is.null&select=id,base_rate_cents,cleaning_fee_cents,ical_import_url,ical_export_token,is_published,is_closed&order=id",
    )
  ).json();
  const assets = new Map(rows.flatMap((r) => r.media).map((p) => [p.sha256, p]));
  console.log(
    `${apply ? "Importing" : "DRY RUN:"} ${rows.length} listings, 1031 gallery links, ${assets.size} unique image files.`,
  );
  if (!apply) {
    console.log("No writes made. Use --apply in the trusted server environment to copy photos.");
    return;
  }
  const uploaded = new Set();
  const failures = [];
  const queue = [...assets.values()];
  let completed = 0;
  async function worker() {
    while (queue.length) {
      const photo = queue.shift();
      try {
        const bytes = await downloadPhoto(photo, backupRoot);
        await request(`/storage/v1/object/unit-media/hostaway/assets/${photo.sha256}.webp`, {
          method: "POST",
          body: bytes,
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "max-age=31536000",
            "x-upsert": "true",
          },
        });
        uploaded.add(photo.sha256);
      } catch (error) {
        failures.push({ image: photo.sha256, error: error.message });
      }
      completed++;
      if (completed % 10 === 0 || completed === assets.size)
        console.log(`Photos: ${completed}/${assets.size}; failed: ${failures.length}`);
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  for (const row of rows) {
    const photos = row.media
      .filter((p) => uploaded.has(p.sha256))
      .map((p) => {
        const storage_path = `hostaway/assets/${p.sha256}.webp`;
        return {
          source_image_id: p.source_image_id,
          storage_path,
          image_url: new URL(`/storage/v1/object/public/unit-media/${storage_path}`, project).href,
        };
      });
    try {
      await request("/rest/v1/rpc/apply_hostaway_owned_media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p_listing_id: row.hostaway_listing_id, p_photos: photos }),
      });
      console.log(`Gallery ${row.hostaway_listing_id}: ${photos.length}/${row.media.length}`);
    } catch (error) {
      failures.push({ listing: row.hostaway_listing_id, error: error.message });
    }
  }
  const units = await (
    await request(
      "/rest/v1/units?hostaway_listing_id=not.is.null&select=hostaway_listing_id,hostaway_media_copied,hostaway_media_expected,primary_image_url",
    )
  ).json();
  const after = await (
    await request(
      "/rest/v1/units?hostaway_listing_id=not.is.null&select=id,base_rate_cents,cleaning_fee_cents,ical_import_url,ical_export_token,is_published,is_closed&order=id",
    )
  ).json();
  if (JSON.stringify(before) !== JSON.stringify(after))
    failures.push({
      error:
        "Operational settings changed during import; inspect concurrent edits. No automatic rollback was attempted.",
    });
  const incomplete = units.filter(
    (u) =>
      u.hostaway_media_copied !== u.hostaway_media_expected ||
      !u.primary_image_url?.startsWith(
        `${project.origin}/storage/v1/object/public/unit-media/hostaway/assets/`,
      ),
  );
  const copied = units.reduce((sum, u) => sum + u.hostaway_media_copied, 0);
  console.log(
    JSON.stringify(
      {
        listings: units.length,
        copied_gallery_links: copied,
        incomplete_listings: incomplete.map((u) => u.hostaway_listing_id),
        failures,
      },
      null,
      2,
    ),
  );
  if (units.length !== 35 || copied !== 1031 || incomplete.length || failures.length) {
    throw new Error(
      "Photo import incomplete. Successful uploads and gallery transactions are preserved; fix reported failures and rerun.",
    );
  }
  console.log(
    "Verified: all 35 source galleries copied into owned storage. Rates and calendar mappings unchanged.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
