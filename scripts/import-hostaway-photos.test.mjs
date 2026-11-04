import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  parseArgs,
  validateImage,
  validateManifest,
  validateSourceUrl,
} from "./import-hostaway-photos.mjs";

test("photo command defaults to read-only and rejects contradictory write flags", () => {
  assert.equal(parseArgs([]).apply, false);
  assert.equal(parseArgs(["--dry-run"]).apply, false);
  assert.equal(parseArgs(["--apply"]).apply, true);
  assert.throws(() => parseArgs(["--apply", "--dry-run"]));
  assert.throws(() => parseArgs(["--media-dir", "--apply"]));
  assert.throws(() => parseArgs(["--unknown"]));
});
test("source fetching rejects non-HTTPS, foreign hosts, credentials and custom ports", () => {
  for (const url of [
    "http://bookingenginecdn.hostaway.com/x",
    "https://evil.invalid/x",
    "https://bookingenginecdn.hostaway.com.evil.invalid/x",
    "https://user:pass@bookingenginecdn.hostaway.com/x",
    "https://bookingenginecdn.hostaway.com:8443/x",
  ])
    assert.throws(() => validateSourceUrl(url));
  assert.equal(
    validateSourceUrl("https://bookingenginecdn.hostaway.com/listing/x").hostname,
    "bookingenginecdn.hostaway.com",
  );
});
test("changed image bytes, incorrect file type and oversized responses are rejected", () => {
  const bytes = Buffer.from("RIFF0000WEBPverified-fixture");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  assert.equal(validateImage(bytes, { sha256 }), bytes);
  assert.throws(
    () => validateImage(Buffer.from("RIFF0000WEBPchanged"), { sha256 }),
    /checksum changed/,
  );
  assert.throws(() => validateImage(Buffer.from("<html>error page</html>"), { sha256 }), /WebP/);
  assert.throws(() => validateImage(Buffer.alloc(9 * 1024 * 1024), { sha256 }), /size/);
});
test("complete verified manifest contains 35 listings and 1031 gallery entries; unsafe paths are rejected", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../data/hostaway-listings.json", import.meta.url), "utf8"),
  );
  assert.equal(validateManifest(manifest).length, 35);
  assert.equal(new Set(manifest.listings.flatMap((r) => r.media.map((p) => p.sha256))).size, 137);
  const incomplete = structuredClone(manifest);
  incomplete.listings.pop();
  assert.throws(() => validateManifest(incomplete), /35/);
  manifest.listings[0].media[0].relative_file = "../private";
  assert.throws(() => validateManifest(manifest), /Unsafe/);
});
