import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  BUNDLE_INSTALL,
  findMissingWorkflowGuidance,
  WORKFLOW_REQUIREMENTS,
  findMissingDeviceAuthGuidance,
  findMissingRetryGuidance,
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
      "Pipe an organization-scoped access token to `farthershore login --token-stdin`, or set `FARTHERSHORE_TOKEN` as an ephemeral override.",
    ),
    [],
  );
});

test("permits supported operational administration without allowing raw credentials", () => {
  for (const text of [
    "Manage an access token with farthershore token update.",
    "Install the host's official MCP server for its own deployments.",
    "Run farthershore business update for presentation metadata.",
    "The responsible human connects Stripe and completes Tax requirements.",
  ])
    assert.deepEqual(findObsoleteGuidance(text), []);
  assert.deepEqual(
    findObsoleteGuidance("Set FARTHERSHORE_TOKEN=mk_plaintext_secret."),
    ["raw access-token credential"],
  );
  assert.ok(
    findObsoleteGuidance("farthershore plan update paid").includes(
      "CLI contract mutation",
    ),
  );
});

test("rejects the retired hosted MCP, code mode, exchange and token names", () => {
  for (const [text, label] of [
    ["Use hosted MCP search, then run_writes.", "retired hosted MCP surface"],
    ["Call search_docs and read_docs_page.", "retired hosted MCP surface"],
    ["MCP describe supplies types.", "retired hosted MCP surface"],
    ["Run farthershore code with a script.", "retired CLI code mode"],
    ["CLI code mode exposes types.", "retired CLI code mode"],
    ["Create a MakerToken for CI.", "retired maker-token name"],
    ["Pipe the maker token to stdin.", "retired maker-token name"],
    ["POST /auth/cli/exchange first.", "retired credential exchange or personal token"],
    ["Create a personal access token.", "retired credential exchange or personal token"],
    ["Import from @farthershore/client.", "retired @farthershore/client package"],
  ])
    assert.ok(findObsoleteGuidance(text).includes(label), text);
  assert.deepEqual(
    findObsoleteGuidance(
      "Read https://docs.farthershore.com/operate/maker-tokens for access tokens.",
    ),
    [],
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
    "Run `farthershore login`; the CLI opens the browser sign-in.",
    "Without a browser, run `farthershore login --device` or `farthershore login --headless`.",
    "Run `farthershore logout` to remove the saved credential.",
    "The CLI keeps the sign-in in the system keychain.",
    "The credential follows the user's live role across all current and future organizations and businesses.",
    "Normal login has no permission or scope choices.",
    "Run `farthershore auth organization list --format json` and `farthershore auth organization use <id-or-slug>` to change the saved organization.",
    "Use `farthershore --organization <id-or-slug> business list --format json` for a one-command override.",
    "For unattended automation, pipe an organization-scoped access token into `farthershore login --token-stdin` or use the ephemeral `FARTHERSHORE_TOKEN` override.",
    "Never place a raw credential in argv, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(findMissingDeviceAuthGuidance(complete), []);
  assert.deepEqual(findMissingDeviceAuthGuidance("Run `farthershore login`."), [
    "device-code login",
    "headless device login",
    "keychain-stored sign-in",
    "logout command",
    "live user authority",
    "all-organization and all-business membership",
    "zero-option login",
    "organization list command",
    "organization use command",
    "one-command organization override",
    "organization-scoped access token stdin override",
    "ephemeral access token environment override",
    "secret-safe credential handling",
  ]);
});

test("requires normal login guidance to distinguish a restricted stdin credential", () => {
  const guidanceWithoutRestrictedCredential = [
    "Run `farthershore login`; the CLI opens the browser sign-in.",
    "Without a browser, run `farthershore login --device` or `farthershore login --headless`.",
    "Run `farthershore logout` to remove the saved credential.",
    "The CLI keeps the sign-in in the system keychain.",
    "The credential follows the user's live role across all current and future organizations and businesses.",
    "Normal login has no permission or scope choices.",
    "Run `farthershore auth organization list --format json` and `farthershore auth organization use <id-or-slug>` to change the saved organization.",
    "Use `farthershore --organization <id-or-slug> business list --format json` for a one-command override.",
    "Never place a raw credential in argv, stdout, or stderr.",
  ].join("\n");

  assert.deepEqual(
    findMissingDeviceAuthGuidance(guidanceWithoutRestrictedCredential),
    [
      "organization-scoped access token stdin override",
      "ephemeral access token environment override",
    ],
  );
});

test("published overview contain the complete device-login safety model", () => {
  const publishedGuidance = [
    readFileSync(new URL("../README.md", import.meta.url), "utf8"),
    readFileSync(
      new URL("../skills/farthershore-overview/SKILL.md", import.meta.url),
      "utf8",
    ),
  ].join("\n");

  assert.deepEqual(findMissingDeviceAuthGuidance(publishedGuidance), []);
});

test("published overview contains the complete retry safety model", () => {
  const guidance = readFileSync(
    new URL("../skills/farthershore-overview/SKILL.md", import.meta.url),
    "utf8",
  );

  assert.deepEqual(findMissingRetryGuidance(guidance), []);
});

test("discovery matches the declared active names, with retired names absent", () => {
  const inventory = JSON.parse(
    readFileSync(new URL("../bundle.json", import.meta.url), "utf8"),
  );
  const actual = readdirSync(new URL("../skills", import.meta.url), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(actual, inventory.activeSkills);
  assert.equal(new Set(actual).size, actual.length);
  for (const [oldName, destination] of Object.entries(
    inventory.retiredSkills,
  )) {
    assert.ok(!actual.includes(oldName));
    assert.ok(actual.includes(destination));
  }
});

test("rejects the retired caller-supplied retry key in every spelling", () => {
  // Built from parts so this repository never contains the retired word.
  const retired = "idem" + "potency";
  for (const text of [
    `farthershore business create acme --${retired}-key <key> --format json`,
    `Persist an ${retired} key before the first send.`,
    "Use `same_key_replay` for webhook test.",
    "Use `intrinsic_replay` with the transition identifier.",
    "Check `retry.keyRequired` before dispatch.",
    "Do not attach a replay key.",
    `Branch on ${retired.toUpperCase()}_KEY_IN_FLIGHT.`,
    `A replay is marked at meta.${retired}.replayed.`,
  ])
    assert.deepEqual(
      findObsoleteGuidance(text),
      ["retired caller-supplied retry key"],
      text,
    );
});

test("retry guidance requires the reconcile-before-repeat write contract", () => {
  assert.deepEqual(
    findMissingRetryGuidance(
      "Use retry.kind: read_current, convergent_write, no_automatic_retry.",
    ),
    [
      "operation reconciliation guidance",
      "operation retry rationale guidance",
      "server enforcement guidance",
      "response freshness guidance",
      "unknown-outcome write handling",
      "server safe-to-repeat verdict",
      "rate-limit write retry",
      "repeated-create conflict handling",
      "pending-release publish handling",
      "in-flight rollback handling",
      "unsupported preview handling",
      "write-result freshness warning",
    ],
  );
});

test("rejects obsolete SDK economics, reporting, and migration instructions", () => {
  for (const text of [
    "fs.rbac()",
    "price_per_unit_micros: 2000",
    "included_units: 1000",
    'import { withUsage } from "@farthershore/backend"',
    "farthershore plan migrate acme pro --to head",
  ])
    assert.ok(findObsoleteGuidance(text).length > 0, text);
});

test("direct invocation retains each workflow's critical decisions and retrieval fallback", () => {
  const inventory = JSON.parse(
    readFileSync(new URL("../bundle.json", import.meta.url), "utf8"),
  );
  for (const name of inventory.activeSkills) {
    const source = readFileSync(
      new URL(`../skills/${name}/SKILL.md`, import.meta.url),
      "utf8",
    );
    assert.deepEqual(findMissingWorkflowGuidance(name, source), [], name);
    // Removing all sentences supporting one invariant must make the guard red.
    // This catches weakened/unused predicates, not just current happy-path text.
    for (const [pattern, label] of WORKFLOW_REQUIREMENTS[name]) {
      let mutated = source;
      let match;
      while ((match = pattern.exec(mutated))) {
        mutated =
          mutated.slice(0, match.index) +
          mutated.slice(match.index + match[0].length);
      }
      assert.ok(
        findMissingWorkflowGuidance(name, mutated).includes(label),
        `${name}: ${label}`,
      );
    }
  }
});

test("known unsafe substitutions fail the corresponding workflow guards", () => {
  const cases = [
    [
      "farthershore-backends-and-runtime",
      /create an[\s\S]*?then mint/,
      "deploy first, obtain token later",
      "row before credential",
    ],
    [
      "farthershore-backends-and-runtime",
      /reconcile metadata and lineage first/,
      "mint again immediately",
      "lost-credential reconciliation",
    ],
    [
      "farthershore-environments-and-releasing",
      /Compatible pushes preserve personas/,
      "Every push wipes personas",
      "compatible preview preservation",
    ],
    [
      "farthershore-environments-and-releasing",
      /charges enabled[\s\S]*?free-only/,
      "free-only products can skip payment verification",
      "first launch payment gates",
    ],
    [
      "farthershore-customer-operations",
      /proposer-only[\s\S]*?human approval/,
      "automation applies its own changes without approval",
      "governed actor authority",
    ],
  ];
  for (const [name, pattern, bad, missing] of cases) {
    const source = readFileSync(
      new URL(`../skills/${name}/SKILL.md`, import.meta.url),
      "utf8",
    );
    assert.ok(pattern.test(source));
    assert.ok(
      findMissingWorkflowGuidance(name, source.replace(pattern, bad)).includes(
        missing,
      ),
    );
  }
});
