import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BUNDLE_INSTALL,
  findMissingDeviceAuthGuidance,
  findObsoleteGuidance,
  findSkillsAddCommands,
} from "./guidance-validation.mjs";

test("finds Skills CLI install commands in code blocks and inline Markdown", () => {
  const text = [
    "```bash",
    BUNDLE_INSTALL,
    "```",
    "Confirm `npx skills add . --list -y` locally.",
  ].join("\n");

  assert.deepEqual(findSkillsAddCommands(text), [
    BUNDLE_INSTALL,
    "npx skills add . --list -y",
  ]);
});

test("allows generic terms unrelated to retired FartherShore workflows", () => {
  const text =
    "Use a frontend template, run another-tool --preset compact, provision a preview, and review a subscriber proposal or draft note.";

  assert.deepEqual(findObsoleteGuidance(text), []);
});

test("rejects retired FartherShore setup and bidirectional config constructs", () => {
  const text = [
    "farthershore template",
    "farthershore provision",
    "POST /businesses/init",
    "farthershore config draft",
    "farthershore skills recommend",
  ].join("\n");

  assert.deepEqual(findObsoleteGuidance(text), [
    "obsolete FartherShore template or preset guidance",
    "obsolete local provisioning or init guidance",
    "FartherShore skills recommendation guidance",
    "obsolete bidirectional config workflow",
  ]);
});

test("rejects raw credentials in auth argv while allowing stdin ingestion", () => {
  assert.deepEqual(
    findObsoleteGuidance(
      "Run `farthershore auth login --token super-secret` now.",
    ),
    ["secret-bearing CLI authentication"],
  );
  assert.deepEqual(
    findObsoleteGuidance(
      "Run `farthershore auth login --token=super-secret` now.",
    ),
    ["secret-bearing CLI authentication"],
  );
  assert.deepEqual(
    findObsoleteGuidance("Pipe it to `farthershore auth login --token-stdin`."),
    [],
  );
});

test("requires the complete device-login safety model in active guidance", () => {
  const complete = [
    "Run `farthershore auth login`; the CLI opens the browser for device approval.",
    "Without a browser, run `farthershore auth login --headless`.",
    "Example: `farthershore auth login --headless --access read-only --business alpha --permission usage:read`.",
    "Request hints do not grant authority.",
    "A human approves the exact permissions and business scope.",
    "For a pre-issued credential, use `farthershore auth login --token-stdin`.",
    "Never place a raw credential in argv, environment variables, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(findMissingDeviceAuthGuidance(complete), []);
  assert.deepEqual(
    findMissingDeviceAuthGuidance("Run `farthershore auth login`."),
    [
      "headless device login",
      "headless narrow-authority request hints",
      "stdin-only pre-issued credential login",
      "non-authoritative request hints",
      "human approval of exact permissions and business scope",
      "secret-safe credential handling",
    ],
  );
});

test("requires headless guidance to carry known narrow-authority hints", () => {
  const deviceGuidanceWithoutNarrowExample = [
    "Run `farthershore auth login`; the CLI opens the browser for device approval.",
    "Without a browser, run `farthershore auth login --headless`.",
    "Request hints do not grant authority.",
    "A human approves the exact permissions and business scope.",
    "For a pre-issued credential, use `farthershore auth login --token-stdin`.",
    "Never place a raw credential in argv, environment variables, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(
    findMissingDeviceAuthGuidance(deviceGuidanceWithoutNarrowExample),
    ["headless narrow-authority request hints"],
  );
});

test("published overview and quickstart contain the complete device-login safety model", () => {
  const publishedGuidance = [
    readFileSync(new URL("../README.md", import.meta.url), "utf8"),
    readFileSync(
      new URL("../skills/farthershore-overview/SKILL.md", import.meta.url),
      "utf8",
    ),
    readFileSync(
      new URL("../skills/farthershore-quickstart/SKILL.md", import.meta.url),
      "utf8",
    ),
  ].join("\n");

  assert.deepEqual(findMissingDeviceAuthGuidance(publishedGuidance), []);
});
