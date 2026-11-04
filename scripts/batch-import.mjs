/**
 * Batch photo importer — reads URLs directly from the manifest JSON (no shell interpolation),
 * downloads verified WebP bytes, uploads to owned unit-media storage via the app's
 * /api/import-hostaway-photos endpoint, and persists progress to data/upload-results.json.
 *
 * Usage: BATCH_SIZE=10 node scripts/batch-import.mjs
 */
import fs from "fs";
import https from "https";
import http from "http";
import crypto from "crypto";

const manifest = JSON.parse(fs.readFileSync("data/hostaway-listings.json", "utf8"));
const results = JSON.parse(fs.readFileSync("data/upload-results.json", "utf8"));
const BATCH = parseInt(process.env.BATCH_SIZE || "10", 10);

// Build sha -> {url, sha} map from manifest (authoritative source, no URL reconstruction)
const shaToUrl = new Map();
for (const listing of manifest.listings) {
  for (const photo of listing.media) {
    if (!shaToUrl.has(photo.sha256)) {
      shaToUrl.set(photo.sha256, photo.download_url);
    }
  }
}

// Find remaining (not yet uploaded)
const allShas = [...shaToUrl.keys()];
const remaining = allShas.filter((s) => !results[s]);
console.log(`Total unique: ${allShas.length}, already uploaded: ${Object.keys(results).length}, remaining: ${remaining.length}`);
const batch = remaining.slice(0, BATCH);
console.log(`Processing batch of ${batch.length}`);

function download(url) {
  return new Promise((resolve, reject) => {
    const get = (u, redir = 0) => {
      if (redir > 5) return reject(new Error("too many redirects"));
      const mod = u.startsWith("https") ? https : http;
      mod.get(u, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 30000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redir + 1);
        }
        if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
        const chunks = [];
        res.on("data", d => chunks.push(d));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }).on("error", reject).on("timeout", function () { this.destroy(new Error("timeout")); });
    };
    get(url);
  });
}

function uploadToStorage(buf, sha) {
  const boundary = "----FormBoundary" + crypto.randomBytes(8).toString("hex");
  const parts = [];
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${sha}.webp"\r\nContent-Type: image/webp\r\n\r\n`));
  parts.push(buf);
  parts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="sha256"\r\n\r\n${sha}\r\n`));
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="storagePath"\r\n\r\nhostaway/${sha}.webp\r\n`));
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts);
  return new Promise((resolve, reject) => {
    const req = http.request("http://localhost:8080/api/import-hostaway-photos", {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": body.length },
      timeout: 60000,
    }, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(new Error("upload timeout")); });
    req.write(body);
    req.end();
  });
}

let copied = 0;
const failures = [];
for (const sha of batch) {
  const url = shaToUrl.get(sha);
  try {
    const buf = await download(url);
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    if (hash !== sha) {
      console.log(`HASH MISMATCH ${sha.slice(0, 12)} got ${hash.slice(0, 12)}`);
      failures.push({ sha, error: "hash mismatch" });
      continue;
    }
    const upRes = await uploadToStorage(buf, sha);
    if (upRes.status === 200) {
      const parsed = JSON.parse(upRes.body);
      if (parsed.url) {
        results[sha] = parsed.url;
        copied++;
        console.log(`OK ${sha.slice(0, 12)} -> ${parsed.url}`);
      } else {
        console.log(`NO URL ${sha.slice(0, 12)}: ${upRes.body.slice(0, 120)}`);
        failures.push({ sha, error: upRes.body.slice(0, 200) });
      }
    } else {
      console.log(`UPLOAD FAIL ${sha.slice(0, 12)} status=${upRes.status}: ${upRes.body.slice(0, 150)}`);
      failures.push({ sha, error: `upload status ${upRes.status}` });
    }
  } catch (e) {
    console.log(`ERR ${sha.slice(0, 12)}: ${e.message}`);
    failures.push({ sha, error: e.message });
  }
}

fs.writeFileSync("data/upload-results.json", JSON.stringify(results, null, 2));
console.log(`\nBatch done. Copied this batch: ${copied}. Total uploaded: ${Object.keys(results).length}. Failures: ${failures.length}`);
if (failures.length) console.log("Failures:", JSON.stringify(failures, null, 2));
