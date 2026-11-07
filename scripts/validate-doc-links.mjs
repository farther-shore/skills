#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function docsLinks(text) {
  return [
    ...new Set(
      [
        ...text.matchAll(
          /https:\/\/docs\.farthershore\.com\/([a-z0-9-]+(?:\/[a-z0-9-]+)*(?:\.[a-z]+)?)(#[a-z0-9-]+)?/g,
        ),
      ].map((m) => m[1] + (m[2] ?? "")),
    ),
  ].sort();
}
export function headingIds(text) {
  return [...text.matchAll(/^#{1,6}\s+(.+)$/gm)]
    .map((m) =>
      m[1]
        .replace(/\{#[^}]+\}/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/[`*_]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-"),
    )
    .concat(
      [...text.matchAll(/(?:id=["']|\{#)([a-z0-9-]+)/g)].map((m) => m[1]),
    );
}
export function resolveLink(docsRoot, link) {
  const [slug, anchor] = link.split("#");
  if (slug === "llms.txt") return { slug, generatedIndex: true };
  let file = [join(docsRoot, slug + ".mdx"), join(docsRoot, slug + ".md")].find(
    existsSync,
  );
  if (!file) throw new Error(`missing canonical page: ${slug}`);
  const text = readFileSync(file, "utf8");
  if (anchor && !headingIds(text).includes(anchor))
    throw new Error(`missing heading: ${link}`);
  return {
    slug,
    anchor: anchor ?? null,
    sha256: createHash("sha256").update(text).digest("hex"),
  };
}
export function collectLinks(root) {
  return [
    ...new Set(
      [
        "README.md",
        "CONTRIBUTING.md",
        ...readdirSync(join(root, "skills")).map(
          (name) => `skills/${name}/SKILL.md`,
        ),
      ].flatMap((file) => docsLinks(readFileSync(join(root, file), "utf8"))),
    ),
  ].sort();
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const links = collectLinks(root);
  const args = process.argv.slice(2);
  const docsArg = args.indexOf("--docs-root");
  const evidencePath = join(root, "scripts/docs-link-evidence.json");
  try {
    if (docsArg >= 0) {
      if (!args[docsArg + 1])
        throw new Error(
          "--docs-root needs an explicit candidate docs directory",
        );
      const docsRoot = resolve(args[docsArg + 1]);
      const pages = links.map((link) => ({
        link,
        ...resolveLink(docsRoot, link),
      }));
      const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: docsRoot,
        encoding: "utf8",
      }).trim();
      if (args.includes("--write-evidence")) {
        writeFileSync(
          evidencePath,
          JSON.stringify(
            {
              schemaVersion: 1,
              source: "farther-shore/fs-turbo",
              sourceCommit,
              boundary:
                "Candidate authored MDX presence/heading resolution only; no live HTTP/search or deployment certificate.",
              pages,
            },
            null,
            2,
          ) + "\n",
        );
      }
    } else {
      const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
      if (!/^[a-f0-9]{40}$/.test(evidence.sourceCommit))
        throw new Error("missing exact candidate docs source identity");
      if (
        JSON.stringify(evidence.pages.map((p) => p.link).sort()) !==
        JSON.stringify(links)
      )
        throw new Error(
          "docs links differ from candidate evidence; resolve against explicit --docs-root and regenerate evidence",
        );
      for (const page of evidence.pages)
        if (!page.generatedIndex && !/^[a-f0-9]{64}$/.test(page.sha256))
          throw new Error(`missing page evidence: ${page.link}`);
    }
    console.log(
      `✓ ${links.length} canonical docs links match explicit candidate evidence`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
