#!/usr/bin/env node
// Self-contained guard: the skills repo is correctly set up for every
// distribution channel (npx skills, Claude Code plugin, Codex).
//
// Checks, with zero dependencies:
//   - every skills/<name>/SKILL.md has `name` + `description` frontmatter, and
//     `name` matches its folder (folder name is the install path / namespace)
//   - active guidance has valid local links, one ownership model, and no retired
//     setup or contract-mutation terminology
//   - README installation guidance installs the complete tag-pinned bundle
//   - .claude-plugin/marketplace.json and plugin.json are well-formed
//
// The faithful end-to-end discovery-parity check (`npx skills … --list`) and
// the authoritative `claude plugin validate` run as separate CI steps; run
// `node scripts/validate-skills.mjs` locally for the fast version.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  BUNDLE_INSTALL,
  findMissingDeviceAuthGuidance,
  findObsoleteGuidance,
  findSkillsAddCommands,
} from "./guidance-validation.mjs";

const root = process.cwd();
const errors = [];
const EXPECTED_SKILLS = [
  "farthershore-agent-operations",
  "farthershore-backends-and-runtime",
  "farthershore-building-uis",
  "farthershore-business-sdk",
  "farthershore-customer-operations",
  "farthershore-environments-and-releasing",
  "farthershore-governance",
  "farthershore-observability-and-troubleshooting",
  "farthershore-overview",
  "farthershore-plans-and-metering",
  "farthershore-quickstart",
];

function frontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? null : text.slice(3, end);
}

function markdownFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...markdownFiles(path));
    else if (entry.endsWith(".md")) files.push(path);
  }
  return files;
}

// 1. Skills under skills/
const skillsDir = join(root, "skills");
let skillCount = 0;
if (!existsSync(skillsDir)) {
  errors.push("skills/ directory is missing");
} else {
  for (const name of readdirSync(skillsDir)) {
    const dir = join(skillsDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const file = join(dir, "SKILL.md");
    if (!existsSync(file)) {
      errors.push(`skills/${name}: no SKILL.md`);
      continue;
    }
    skillCount++;
    const fm = frontmatter(readFileSync(file, "utf8"));
    if (!fm) {
      errors.push(
        `skills/${name}/SKILL.md: missing YAML frontmatter (--- block)`,
      );
      continue;
    }
    const keys = [...fm.matchAll(/^([A-Za-z0-9_-]+):/gm)].map(
      (match) => match[1],
    );
    const unsupportedKeys = keys.filter(
      (key) => !["name", "description"].includes(key),
    );
    if (unsupportedKeys.length) {
      errors.push(
        `skills/${name}/SKILL.md: unsupported frontmatter fields: ${unsupportedKeys.join(", ")}`,
      );
    }
    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
      errors.push(`skills/${name}/SKILL.md: frontmatter missing 'name'`);
    } else {
      const declared = nameMatch[1].trim().replace(/^["']|["']$/g, "");
      if (declared !== name) {
        errors.push(
          `skills/${name}/SKILL.md: name '${declared}' does not match folder '${name}'`,
        );
      }
    }
    if (!/^description:\s*\S/m.test(fm) && !/^description:\s*$/m.test(fm)) {
      errors.push(`skills/${name}/SKILL.md: frontmatter missing 'description'`);
    } else if (!/^description:\s*Use when\b[^\n]*$/m.test(fm)) {
      errors.push(
        `skills/${name}/SKILL.md: description must be one line starting with 'Use when'`,
      );
    }
  }
}
if (skillCount === 0) errors.push("no skills found under skills/");
const discoveredSkills = existsSync(skillsDir)
  ? readdirSync(skillsDir)
      .filter((name) => statSync(join(skillsDir, name)).isDirectory())
      .sort()
  : [];
if (JSON.stringify(discoveredSkills) !== JSON.stringify(EXPECTED_SKILLS)) {
  errors.push(
    `skills/: expected the complete job-shaped bundle (${EXPECTED_SKILLS.join(", ")}); found ${discoveredSkills.join(", ")}`,
  );
}

// 2. Active guidance must describe the current agent-first workflow only.
const guidanceFiles = [
  join(root, "README.md"),
  join(root, "CONTRIBUTING.md"),
  ...(existsSync(skillsDir) ? markdownFiles(skillsDir) : []),
];
for (const file of guidanceFiles) {
  const text = readFileSync(file, "utf8");
  for (const label of findObsoleteGuidance(text)) {
    errors.push(`${file.slice(root.length + 1)}: contains ${label}`);
  }

  if (file.endsWith("/SKILL.md")) {
    if (!text.includes("https://docs.farthershore.com/llms.txt")) {
      errors.push(
        `${file.slice(root.length + 1)}: missing live docs index URL`,
      );
    }
    if (
      !text.includes(
        "**Required before acting:** fetch the live machine-readable index",
      )
    ) {
      errors.push(
        `${file.slice(root.length + 1)}: missing required docs callout`,
      );
    }
    if (
      !/https:\/\/docs\.farthershore\.com\/(?:get-started|agents|define|monetize|frontend|backend|operate|cookbook|reference)\/[a-z0-9-]+/.test(
        text,
      )
    ) {
      errors.push(
        `${file.slice(root.length + 1)}: missing exact related docs page URL`,
      );
    }
  }

  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#", 1)[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    const linked = resolve(dirname(file), target);
    if (!existsSync(linked))
      errors.push(`${file.slice(root.length + 1)}: broken link '${match[1]}'`);
  }
}

let bundleInstallCount = 0;
for (const file of guidanceFiles) {
  const text = readFileSync(file, "utf8");
  const installCommands = findSkillsAddCommands(text);
  for (const command of installCommands) {
    if (command === BUNDLE_INSTALL) bundleInstallCount++;
    else
      errors.push(
        `${file.slice(root.length + 1)}: npx skills installation must use '${BUNDLE_INSTALL}'`,
      );
  }
}
if (bundleInstallCount === 0)
  errors.push(
    `active guidance: missing bundle install command '${BUNDLE_INSTALL}'`,
  );

const deviceAuthGuidance = [
  join(root, "README.md"),
  join(skillsDir, "farthershore-overview", "SKILL.md"),
  join(skillsDir, "farthershore-quickstart", "SKILL.md"),
]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const label of findMissingDeviceAuthGuidance(deviceAuthGuidance)) {
  errors.push(`active guidance: missing ${label}`);
}

const businessSdk = readFileSync(
  join(skillsDir, "farthershore-business-sdk", "SKILL.md"),
  "utf8",
);
const plansAndMetering = readFileSync(
  join(skillsDir, "farthershore-plans-and-metering", "SKILL.md"),
  "utf8",
);
const migrationReference = readFileSync(
  join(
    skillsDir,
    "farthershore-plans-and-metering",
    "references",
    "experiments-and-migration.md",
  ),
  "utf8",
);

// Critical invariants live in the skills; exhaustive syntax lives in docs.
for (const [name, source, required] of [
  [
    "business-sdk",
    businessSdk,
    [
      "3.2.x",
      "kind: fs.plan.kind.free",
      "requests.fixed(1)",
      "fs.business()",
      "deterministic",
    ],
  ],
  [
    "plans-and-metering",
    plansAndMetering,
    ["usagePricing", "funding", "pricing.current()", "Nanos", "bill-preview"],
  ],
  [
    "change safety",
    migrationReference,
    ["recurring", "deferred", "subject pins", "private APIs"],
  ],
]) {
  for (const term of required)
    if (!source.includes(term))
      errors.push(`${name}: missing invariant '${term}'`);
}
const backendRuntime = readFileSync(
  join(skillsDir, "farthershore-backends-and-runtime", "SKILL.md"),
  "utf8",
);
for (const required of [
  "@farthershore/backend",
  "0.21.x",
  "FS_RUNTIME_TOKEN",
  "requireMember(ctx)",
  "ctx.principal.org.id",
  "unique constraint",
  "atomic upsert",
  "origin_unavailable",
  "ctx.report",
  "responseSink",
  "single-use",
  "hard cutover",
  "propagation",
]) {
  if (!backendRuntime.includes(required))
    errors.push(
      `farthershore-backends-and-runtime: missing '${required}' guidance`,
    );
}

const releases = readFileSync(
  join(skillsDir, "farthershore-environments-and-releasing", "SKILL.md"),
  "utf8",
);
for (const required of [
  "reviewed-known-good-release-id",
  "Omitting `--env` targets production",
  "pins only",
  "There is no `frontend deploy` command",
  "every repeat `business publish`, including `--dry-run`, returns",
  "git switch main",
  "git pull --ff-only origin main",
  "gh release create <version> --verify-tag",
  "The pin also prevents a later successful production build from auto-activating",
  "Despite the verb name, this operation reactivates any succeeded release",
  "Preview rollback changes the active release but never pins it",
]) {
  if (!releases.includes(required)) {
    errors.push(
      `farthershore-environments-and-releasing: missing '${required}' guidance`,
    );
  }
}

const buildingUis = readFileSync(
  join(skillsDir, "farthershore-building-uis", "SKILL.md"),
  "utf8",
);
for (const required of [
  "<ApiKeysPanel>",
  "useApiKeys()",
  "useResourceLimitUsage()",
]) {
  if (!buildingUis.includes(required)) {
    errors.push(
      `farthershore-building-uis: missing '${required}' current SDK surface`,
    );
  }
}

const overview = readFileSync(
  join(skillsDir, "farthershore-overview", "SKILL.md"),
  "utf8",
);
for (const required of [
  "builder-org membership, or invitations",
  "platform agents, bulletins, or notifications",
  "Configure API-managed webhooks or frontend/runtime variables",
  "Inspect workflows",
]) {
  if (!overview.includes(required)) {
    errors.push(`farthershore-overview: missing '${required}' job routing`);
  }
}
if (buildingUis.includes("<ApiKeys>") || buildingUis.includes("useLimits()")) {
  errors.push(
    "farthershore-building-uis: contains a nonexistent frontend SDK export",
  );
}

const customerOperations = readFileSync(
  join(skillsDir, "farthershore-customer-operations", "SKILL.md"),
  "utf8",
);
for (const required of [
  "consumer block",
  "consumer remove",
  "There is currently no CLI unblock command",
  "generalized commercial rebind",
  "edge",
  "proposal preview",
  "promo-code",
  "audit-log business-list",
]) {
  if (!customerOperations.includes(required)) {
    errors.push(
      `farthershore-customer-operations: missing '${required}' guidance`,
    );
  }
}

const observability = readFileSync(
  join(skillsDir, "farthershore-observability-and-troubleshooting", "SKILL.md"),
  "utf8",
);
for (const required of [
  "denial show",
  "Subscription/payment",
  "SUSPENDED",
  "persona bootstrap",
  "Retry-After",
  "X-FS-Decision-Id",
]) {
  if (!observability.includes(required)) {
    errors.push(
      `farthershore-observability-and-troubleshooting: missing '${required}' guidance`,
    );
  }
}
for (const required of [
  "farthershore agents runs-show <business> <runId> --format json",
  "farthershore notifications preferences <business> --format json",
]) {
  if (!observability.includes(required)) {
    errors.push(
      `farthershore-observability-and-troubleshooting: missing '${required}' current CLI command`,
    );
  }
}
for (const retired of [
  "farthershore agents runs show",
  "farthershore notifications list",
]) {
  if (observability.includes(retired)) {
    errors.push(
      `farthershore-observability-and-troubleshooting: contains nonexistent '${retired}' command`,
    );
  }
}

// 3. marketplace.json
const mkPath = join(root, ".claude-plugin", "marketplace.json");
if (!existsSync(mkPath)) {
  errors.push(".claude-plugin/marketplace.json is missing");
} else {
  try {
    const mk = JSON.parse(readFileSync(mkPath, "utf8"));
    if (!mk.name) errors.push("marketplace.json: missing 'name'");
    if (!mk.owner?.name) errors.push("marketplace.json: missing 'owner.name'");
    if (!Array.isArray(mk.plugins) || mk.plugins.length === 0) {
      errors.push("marketplace.json: 'plugins' must be a non-empty array");
    } else {
      for (const p of mk.plugins) {
        if (!p.name)
          errors.push("marketplace.json: a plugin entry is missing 'name'");
        if (!p.source) {
          errors.push(
            `marketplace.json: plugin '${p.name}' is missing 'source'`,
          );
        } else if (
          typeof p.source === "string" &&
          p.source.startsWith(".") &&
          !existsSync(join(root, p.source))
        ) {
          errors.push(
            `marketplace.json: plugin '${p.name}' source '${p.source}' does not exist`,
          );
        }
      }
    }
  } catch (e) {
    errors.push(`marketplace.json: invalid JSON (${e.message})`);
  }
}

// 4. plugin.json
const plPath = join(root, ".claude-plugin", "plugin.json");
if (!existsSync(plPath)) {
  errors.push(".claude-plugin/plugin.json is missing");
} else {
  try {
    const pl = JSON.parse(readFileSync(plPath, "utf8"));
    if (!pl.name) errors.push("plugin.json: missing 'name'");
  } catch (e) {
    errors.push(`plugin.json: invalid JSON (${e.message})`);
  }
}

if (errors.length) {
  console.error(`✗ skills validation failed (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ ${skillCount} skills + Claude plugin manifests valid`);
