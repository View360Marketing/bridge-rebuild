import https from "https";
import http from "http";
import fs from "fs";
import crypto from "crypto";

const remaining = JSON.parse(fs.readFileSync("data/remaining-urls.json", "utf8"));
const results = JSON.parse(fs.readFileSync("data/upload-results.json", "utf8"));
const BATCH = parseInt(process.env.BATCH_SIZE || "20", 10);
const batch = remaining.slice(0, BATCH);

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

for (const item of batch) {
  try {
    const buf = await download(item.url);
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    if (hash !== item.sha) {
      console.log(`HASH MISMATCH ${item.sha.slice(0, 12)} got ${hash.slice(0, 12)}`);
      continue;
    }
    const boundary = "----FormBoundary" + crypto.randomBytes(8).toString("hex");
    const parts = [];
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${hash}.webp"\r\nContent-Type: image/webp\r\n\r\n`));
    parts.push(buf);
    parts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="sha256"\r\n\r\n${hash}\r\n`));
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="storagePath"\r\n\r\nhostaway/${hash}.webp\r\n`));
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    const body = Buffer.concat(parts);
    const uploadRes = await new Promise((resolve, reject) => {
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
    if (uploadRes.status === 200) {
      const parsed = JSON.parse(uploadRes.body);
      if (parsed.url) { results[hash] = parsed.url; console.log(`OK ${hash.slice(0, 12)} -> ${parsed.url}`); }
      else console.log(`NO URL ${hash.slice(0, 12)}: ${uploadRes.body.slice(0, 100)}`);
    } else {
      console.log(`UPLOAD FAIL ${hash.slice(0, 12)} status=${uploadRes.status}: ${uploadRes.body.slice(0, 150)}`);
    }
  } catch (e) {
    console.log(`ERR ${item.sha.slice(0, 12)}: ${e.message}`);
  }
}
fs.writeFileSync("data/upload-results.json", JSON.stringify(results, null, 2));
console.log("Batch done. Total uploaded:", Object.keys(results).length);
