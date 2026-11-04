import https from "https";

const urls = [
  "https://bookingenginecdn.hostaway.com/listing/127008-318378-yxku1t82GTvWmduXkFRbOQ4PPNCy8n7N3uwnZNWoHy0-68387d79eeb2a?width=1600&quality=80&format=webp&v=2",
  "https://bookingenginecdn.hostaway.com/listing/127008-318377--fuDUNIOoA5AL0v4Rop52W4dO71Rc36zRHCnPGcBW-Q-67291b2ece776?width=1600&quality=80&format=webp&v=2",
];

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    const get = (u, redir = 0) => {
      if (redir > 5) return reject(new Error("too many redirects"));
      https.get(u, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 30000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`  redirect ${res.statusCode} -> ${res.headers.location}`);
          return get(res.headers.location, redir + 1);
        }
        console.log(`  status=${res.statusCode} content-type=${res.headers["content-type"]} content-length=${res.headers["content-length"]}`);
        if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
        const chunks = [];
        res.on("data", d => chunks.push(d));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }).on("error", reject).on("timeout", function() { this.destroy(new Error("timeout")); });
    };
    get(url);
  });
}

for (const url of urls) {
  console.log("\nURL:", url.slice(0, 80) + "...");
  try {
    const buf = await fetchBuf(url);
    console.log(`  bytes=${buf.length} magic=${buf.subarray(0,4).toString()} ${buf.subarray(8,12).toString()}`);
  } catch (e) {
    console.log("  ERROR:", e.message);
  }
}
