import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
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

test("rejects raw credentials in login argv while allowing stdin ingestion", () => {
  assert.deepEqual(
    findObsoleteGuidance("Run `farthershore login --token super-secret` now."),
    ["secret-bearing CLI authentication"],
  );
  assert.deepEqual(
    findObsoleteGuidance("Run `farthershore login --token=super-secret` now."),
    ["secret-bearing CLI authentication"],
  );
  assert.deepEqual(
    findObsoleteGuidance(
      "Pipe an organization-scoped MakerToken to `farthershore login --token-stdin`, or set `FARTHERSHORE_TOKEN` as an ephemeral override.",
    ),
    [],
  );
});

test("rejects MakerToken administration and raw MakerToken literals", () => {
  const administration = [
    "Create a MakerToken for the agent.",
    "Generate a MakerToken in the dashboard.",
    "Update the MakerToken permissions.",
    "Rotate the maker token when it expires.",
  ];

  for (const text of administration) {
    assert.deepEqual(findObsoleteGuidance(text), [
      "maker-token credential administration",
    ]);
  }
  assert.deepEqual(
    findObsoleteGuidance("Set FARTHERSHORE_TOKEN=mk_plaintext_secret."),
    ["raw maker-token credential"],
  );
});

test("rejects organization context described as authority narrowing", () => {
  assert.deepEqual(
    findObsoleteGuidance(
      "Run farthershore auth organization use alpha to restrict the normal CLI credential to organization alpha.",
    ),
    ["organization context described as authority narrowing"],
  );
});

test("rejects the retired nested login and logout commands", () => {
  assert.deepEqual(
    findObsoleteGuidance(
      "Run `farthershore auth login`, then `farthershore auth logout`.",
    ),
    ["obsolete nested authentication command"],
  );
});

test("rejects login option flags and configurable approval guidance", () => {
  const stale = [
    "farthershore login --headless --name agent --access read-only --business alpha --permission usage:read",
    "A human reviews exact permissions and business scope before approval.",
    "Request hints do not grant authority.",
    "The standalone approval page may narrow organization and business scope.",
  ].join("\n");

  assert.deepEqual(findObsoleteGuidance(stale), [
    "obsolete device-login option flags",
    "obsolete device-login permission selection",
    "obsolete device-login request hints",
    "obsolete device-login approval options",
  ]);
});

test("requires the complete user-bound multi-organization login model", () => {
  const complete = [
    "Run `farthershore login`; the CLI opens the browser for device approval.",
    "Without a browser, run `farthershore login --headless`.",
    "Run `farthershore logout` to remove the saved credential.",
    "The credential follows the user's live role and CLI-operable permissions across all current and future organizations and businesses.",
    "The standalone approval page has only Allow and Deny actions.",
    "Run `farthershore auth organization list --format json` and `farthershore auth organization use <id-or-slug>` to change the saved organization.",
    "Use `farthershore --organization <id-or-slug> business list --format json` for a one-command override.",
    "For a separately pre-issued organization-scoped restricted MakerToken, use `farthershore login --token-stdin` or the ephemeral `FARTHERSHORE_TOKEN` override.",
    "Never place a raw credential in argv, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(findMissingDeviceAuthGuidance(complete), []);
  assert.deepEqual(
    findMissingDeviceAuthGuidance("Run `farthershore login`."),
    [
      "headless device login",
      "logout command",
      "live user authority",
      "all-organization and all-business membership",
      "zero-option approval",
      "organization list command",
      "organization use command",
      "one-command organization override",
      "organization-scoped MakerToken stdin override",
      "ephemeral MakerToken environment override",
      "secret-safe credential handling",
    ],
  );
});

test("requires normal login guidance to distinguish a restricted stdin credential", () => {
  const guidanceWithoutRestrictedCredential = [
    "Run `farthershore login`; the CLI opens the browser for device approval.",
    "Without a browser, run `farthershore login --headless`.",
    "Run `farthershore logout` to remove the saved credential.",
    "The credential follows the user's live role and CLI-operable permissions across all current and future organizations and businesses.",
    "The standalone approval page has only Allow and Deny actions.",
    "Run `farthershore auth organization list --format json` and `farthershore auth organization use <id-or-slug>` to change the saved organization.",
    "Use `farthershore --organization <id-or-slug> business list --format json` for a one-command override.",
    "Never place a raw credential in argv, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(
    findMissingDeviceAuthGuidance(guidanceWithoutRestrictedCredential),
    [
      "organization-scoped MakerToken stdin override",
      "ephemeral MakerToken environment override",
    ],
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

test("publishes exactly nine job-shaped skills", () => {
  const expected = [
    "farthershore-backends-and-runtime",
    "farthershore-building-uis",
    "farthershore-business-sdk",
    "farthershore-customer-operations",
    "farthershore-environments-and-releasing",
    "farthershore-observability-and-troubleshooting",
    "farthershore-overview",
    "farthershore-plans-and-metering",
    "farthershore-quickstart",
  ];

  assert.deepEqual(
    readdirSync(new URL("../skills", import.meta.url), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
    expected,
  );
});

test("every skill routes agents through the live docs index and exact pages", () => {
  for (const entry of readdirSync(new URL("../skills", import.meta.url), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue;
    const text = readFileSync(
      new URL(`../skills/${entry.name}/SKILL.md`, import.meta.url),
      "utf8",
    );
    assert.match(text, /https:\/\/docs\.farthershore\.com\/llms\.txt/);
    assert.match(text, /\*\*Required before acting:\*\* fetch the live machine-readable index/);
    assert.match(
      text,
      /https:\/\/docs\.farthershore\.com\/(?:get-started|agents|define|monetize|frontend|backend|operate|cookbook|reference)\/[a-z0-9-]+/,
    );
  }
});
