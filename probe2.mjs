import { readFileSync } from "node:fs";

const dev = readFileSync("/tmp/dev-after.css", "utf8");
const built = readFileSync("dist/client/assets/styles-BA5yHXNZ.css", "utf8");

const pats = [
  "h-16", "min-h-[85vh", "bg-[#1b251e", "text-[#2f4032", "bg-[#faf8f5",
  "bg-[#2a382c", "h-[380px", "h-[460px", "bg-[#243327", "text-[#3e5340",
  "bg-[#f4eee6", "bg-[#fbf9f6", "h-14", "max-w-7xl", "backdrop-blur-md",
  "font-serif", "rounded-full", "object-contain", "text-stone-100",
];

console.log("dev-after size:", dev.length, "built size:", built.length);
let missing = 0;
for (const p of pats) {
  const d = dev.split(p).length - 1;
  if (d === 0) {
    console.log(`MISSING IN DEV-AFTER: ${p}`);
    missing++;
  }
}
console.log(missing === 0 ? "ALL PRESENT IN DEV-AFTER ✅" : `${missing} missing in dev-after`);