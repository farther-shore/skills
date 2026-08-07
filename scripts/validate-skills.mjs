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
  findObsoleteGuidance,
  findSkillsAddCommands,
} from "./guidance-validation.mjs";

const root = process.cwd();
const errors = [];

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
      errors.push(`skills/${name}/SKILL.md: missing YAML frontmatter (--- block)`);
      continue;
    }
    const keys = [...fm.matchAll(/^([A-Za-z0-9_-]+):/gm)].map((match) => match[1]);
    const unsupportedKeys = keys.filter((key) => !["name", "description"].includes(key));
    if (unsupportedKeys.length) {
      errors.push(`skills/${name}/SKILL.md: unsupported frontmatter fields: ${unsupportedKeys.join(", ")}`);
    }
    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
      errors.push(`skills/${name}/SKILL.md: frontmatter missing 'name'`);
    } else {
      const declared = nameMatch[1].trim().replace(/^["']|["']$/g, "");
      if (declared !== name) {
        errors.push(`skills/${name}/SKILL.md: name '${declared}' does not match folder '${name}'`);
      }
    }
    if (!/^description:\s*\S/m.test(fm) && !/^description:\s*$/m.test(fm)) {
      errors.push(`skills/${name}/SKILL.md: frontmatter missing 'description'`);
    } else if (!/^description:\s*Use when\b[^\n]*$/m.test(fm)) {
      errors.push(`skills/${name}/SKILL.md: description must be one line starting with 'Use when'`);
    }
  }
}
if (skillCount === 0) errors.push("no skills found under skills/");

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

  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#", 1)[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    const linked = resolve(dirname(file), target);
    if (!existsSync(linked)) errors.push(`${file.slice(root.length + 1)}: broken link '${match[1]}'`);
  }
}

let bundleInstallCount = 0;
for (const file of guidanceFiles) {
  const text = readFileSync(file, "utf8");
  const installCommands = findSkillsAddCommands(text);
  for (const command of installCommands) {
    if (command === BUNDLE_INSTALL) bundleInstallCount++;
    else errors.push(`${file.slice(root.length + 1)}: npx skills installation must use '${BUNDLE_INSTALL}'`);
  }
}
if (bundleInstallCount === 0) errors.push(`active guidance: missing bundle install command '${BUNDLE_INSTALL}'`);

const businessSdk = readFileSync(join(skillsDir, "farthershore-business-sdk", "SKILL.md"), "utf8");
const plansAndMetering = readFileSync(
  join(skillsDir, "farthershore-plans-and-metering", "SKILL.md"),
  "utf8",
);
const migrationReference = readFileSync(
  join(skillsDir, "farthershore-plans-and-metering", "references", "experiments-and-migration.md"),
  "utf8",
);

if (!businessSdk.includes("**Current: 2.0.0.**")) {
  errors.push("farthershore-business-sdk: must identify SDK 2.0.0 as current");
}
if (/auto[- ]?attach/i.test(businessSdk) || /auto[- ]?attach/i.test(plansAndMetering)) {
  errors.push("business SDK guidance: SDK 2.0 meters must never be described as auto-attached");
}
if (!/fs\.meterRoutes\(everything,\s*\{\s*costs:\s*\[requests\.fixed\(1\)\]\s*\}\);/s.test(businessSdk)) {
  errors.push("farthershore-business-sdk: primary example must attach requests.fixed(1) as a route cost");
}
if (!/fs\.meterRoutes\(publicRoutes,\s*\{\s*costs:\s*\[requests\.fixed\(1\)\]\s*\}\);/s.test(plansAndMetering)) {
  errors.push("farthershore-plans-and-metering: free-plan example must attach requests.fixed(1) as a route cost");
}
if (!migrationReference.includes("farthershore plan migrate <business> <plan-key> --from <version> --to <version|head> --policy <policy> --format json")) {
  errors.push("plan change reference: missing exact subscriber migration command");
}
if (!migrationReference.includes("data.migration.status")) {
  errors.push("plan change reference: missing migration response status guidance");
}
if (!migrationReference.includes("MIGRATION_SKIPPED")) {
  errors.push("plan change reference: must document MIGRATION_SKIPPED as an error response");
}
if (!businessSdk.includes("onStatusCodes") || !businessSdk.includes("postStreamBilling")) {
  errors.push("farthershore-business-sdk: meterRoutes guidance must cover status policy and post-stream billing");
}
if (!businessSdk.includes("gateway-known fixed costs do not require a signed upstream report")) {
  errors.push("farthershore-business-sdk: must distinguish fixed costs from signed dynamic reports");
}

const escalationReference = readFileSync(
  join(skillsDir, "farthershore-operating-and-escalation", "references", "escalation.md"),
  "utf8",
);
if (/revert manifest/i.test(escalationReference)) {
  errors.push("escalation reference: repository fixes must say to revert the business/ program");
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
        if (!p.name) errors.push("marketplace.json: a plugin entry is missing 'name'");
        if (!p.source) {
          errors.push(`marketplace.json: plugin '${p.name}' is missing 'source'`);
        } else if (typeof p.source === "string" && p.source.startsWith(".") && !existsSync(join(root, p.source))) {
          errors.push(`marketplace.json: plugin '${p.name}' source '${p.source}' does not exist`);
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
