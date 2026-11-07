#!/usr/bin/env node
import { readFileSync } from "node:fs";
const expected = JSON.parse(
  readFileSync(new URL("../bundle.json", import.meta.url)),
).activeSkills;
const output = readFileSync(0, "utf8")
  .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "")
  .replace(/\r/g, "");
const names = [
  ...new Set(
    [...output.matchAll(/^\s*(?:[│┃]\s*)?(farthershore-[a-z-]+)\s*$/gm)].map(
      (match) => match[1],
    ),
  ),
].sort();
if (JSON.stringify(names) !== JSON.stringify(expected)) {
  console.error(
    `Discovery names differ: expected ${expected.join(", ")}; found ${names.join(", ")}`,
  );
  process.exit(1);
}
console.log(`✓ exact discovery parity: ${names.length} active skills`);
