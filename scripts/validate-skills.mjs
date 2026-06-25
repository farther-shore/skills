#!/usr/bin/env node
// Self-contained guard: the skills repo is correctly set up for every
// distribution channel (npx skills, Claude Code plugin, Codex).
//
// Checks, with zero dependencies:
//   - every skills/<name>/SKILL.md has `name` + `description` frontmatter, and
//     `name` matches its folder (folder name is the install path / namespace)
//   - .claude-plugin/marketplace.json and plugin.json are well-formed
//
// The faithful end-to-end discovery-parity check (`npx skills … --list`) and
// the authoritative `claude plugin validate` run as separate CI steps; run
// `node scripts/validate-skills.mjs` locally for the fast version.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function frontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? null : text.slice(3, end);
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
    }
  }
}
if (skillCount === 0) errors.push("no skills found under skills/");

// 2. marketplace.json
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

// 3. plugin.json
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
