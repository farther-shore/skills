import assert from "node:assert/strict";
import test from "node:test";

import {
  BUNDLE_INSTALL,
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
