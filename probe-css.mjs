import { readFileSync } from "node:fs";

const dev = readFileSync("/tmp/dev-fresh.css", "utf8");
const built = readFileSync("dist/client/assets/styles-BA5yHXNZ.css", "utf8");

const pats = [
  "h-16", "min-h-[85vh", "bg-[#1b251e", "text-[#2f4032", "bg-[#faf8f5",
  "bg-[#2a382c", "h-[380px", "h-[460px", "bg-[#243327", "text-[#3e5340",
  "bg-[#f4eee6", "bg-[#fbf9f6", "h-14", "max-w-7xl", "backdrop-blur-md",
  "font-serif", "rounded-full", "object-contain", "text-stone-100",
];

console.log("dev size:", dev.length, "built size:", built.length);
console.log("");
for (const p of pats) {
  const d = dev.split(p).length - 1;
  const b = built.split(p).length - 1;
  const flag = d === 0 && b > 0 ? "  <-- MISSING IN DEV" : "";
  console.log(`${p.padEnd(22)} dev=${d} built=${b}${flag}`);
}