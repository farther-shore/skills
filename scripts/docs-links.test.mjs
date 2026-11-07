import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { docsLinks, headingIds, resolveLink } from "./validate-doc-links.mjs";

test("canonical link collection preserves anchors and ignores other domains", () => {
  assert.deepEqual(
    docsLinks(
      "https://docs.farthershore.com/backend/overview#first-bind https://elsewhere.test/x https://docs.farthershore.com/llms.txt",
    ),
    ["backend/overview#first-bind", "llms.txt"],
  );
});
test("candidate resolution fails closed on missing page or heading", () => {
  const root = mkdtempSync(join(tmpdir(), "skills-links-"));
  try {
    writeFileSync(
      join(root, "guide.mdx"),
      "# A Guide\n\n## First bind\n\nDo prerequisites first.\n",
    );
    assert.equal(resolveLink(root, "guide#first-bind").anchor, "first-bind");
    assert.throws(() => resolveLink(root, "missing"), /missing canonical page/);
    assert.throws(() => resolveLink(root, "guide#missing"), /missing heading/);
    const before = resolveLink(root, "guide").sha256;
    writeFileSync(join(root, "guide.mdx"), "# A Guide\n\nChanged meaning.\n");
    assert.notEqual(resolveLink(root, "guide").sha256, before);
    assert.throws(
      () => resolveLink(root, "guide#first-bind"),
      /missing heading/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("heading resolution recognizes explicit IDs without accepting unknown anchors", () => {
  assert.deepEqual(headingIds('## Connect `api`\n<div id="special-case">\n'), [
    "connect-api",
    "special-case",
  ]);
});
