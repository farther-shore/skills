import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const names = JSON.parse(
  readFileSync(new URL("../bundle.json", import.meta.url)),
).activeSkills;
const run = (input) =>
  spawnSync(
    process.execPath,
    [new URL("./check-discovery.mjs", import.meta.url).pathname],
    { input, encoding: "utf8" },
  );
test("exact discovery accepts active names and excludes source path noise", () => {
  assert.equal(
    run(
      `Source: /Users/example/farthershore-turbo/skills\n${names.map((n) => `│    ${n}`).join("\n")}\n`,
    ).status,
    0,
  );
});
test("same-count wrong name and silently dropped skill both fail discovery", () => {
  assert.equal(run(names.slice(1).join("\n")).status, 1);
  assert.equal(
    run(["farthershore-retired", ...names.slice(1)].join("\n")).status,
    1,
  );
});
