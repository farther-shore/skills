---
name: farthershore-product-as-code
description: Use when defining or changing the STRUCTURE of a FartherShore business — routes, features, meters, limits, capabilities, policies, or surfaces — i.e. anything in business/business.config.ts. Covers the edit→build→push→checks change loop, determinism rules, and the compiler's allowed/blocked changes. This is contract state — change it in code, never via the API.
metadata:
  version: 1.1.0
---

# Business-as-Code: the build/change loop

Business _structure_ is **contract** state: it lives in
`business/business.config.ts` and changes only by editing that file and pushing.
The API/CLI/MCP will reject these writes on a live business (`MANAGED_BY_CODE`).
Read [farthershore-overview](../farthershore-overview/SKILL.md) first.

For pricing/plan specifics see
[farthershore-plans-and-billing](../farthershore-plans-and-billing/SKILL.md);
for releasing the change see
[farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md).

## The repo

```
business/
  business.config.ts    ← the business definition (a decorated class). Source of truth.
  package.json          ← pins @farthershore/business
brand.yaml              ← mutable presentation (name, logo, color) — no release needed
docs/                   ← customer-facing .mdx + _index.yaml navigation
frontend/               ← the generated frontend app (customizable)
AGENTS.md               ← per-business rules — READ THIS
```

`business/business.config.ts` exports one decorated `@Business` class. Members are
declared with decorators (`@Plan`, `@Meter`, `@Feature`, `@Surface`,
`@Capability`, `@Policy`, `@Backend`, `@Requests`, …). See
[references/decorators.md](references/decorators.md).

## The change loop

1. **Edit** `business/business.config.ts` (or a module it imports).
2. **Build locally** — `farthershore build` compiles the decorated class to the
   Manifest IR and validates it. Fix any error before pushing.
3. **Commit and push** to the right branch (`env/<name>` for a preview, `main`
   for production source — see the environments skill).
4. **Watch the GitHub checks**: `farthershore/build` (compiled + validated) and,
   on accepted changes, `farthershore/apply`. A failed check posts a comment
   with the reason — read it and fix.
5. Production source on `main` does **not** go live until you cut a release.

## Determinism is mandatory

The product module must be **pure**: no `Date.now()`, no `Math.random()`, no
network calls, no file I/O, no environment reads. The platform builds twice and
**rejects the push if the two builds differ**. If `farthershore/build` fails on a
hash mismatch, you have non-determinism — see
[references/determinism-and-build.md](references/determinism-and-build.md).

## What the compiler allows vs blocks

**Allowed** (deploys, sometimes with a warning):

- Raising a plan's price (existing subscribers migrate at their next cycle)
- **Increasing** a limit's capacity (applies immediately)
- Adding plans, meters, features, routes, or details

**Blocked** (the build fails — you must rework):

- **Decreasing** a limit's capacity or **removing** a limit
- A plan with no revenue source unless explicitly marked `free`
- Duplicate plan or meter keys
- Exceeding per-product caps (read the repo's `AGENTS.md` for current caps,
  e.g. plans / meters / limits-per-plan)

Confirm with the business repo's `AGENTS.md` — caps and rules can be
business-specific.

## Autonomy

- **auto**: editing the manifest, `farthershore build`, pushing to a **preview**
  (`env/*`) branch and iterating there.
- **confirm**: changes that alter subscriber-visible structure or pricing, and
  any push that leads to a **production release** (see the releasing skill).

## When a change is rejected

Read the check comment / CLI error `code`. Common ones:

- hash mismatch → non-determinism ([references/determinism-and-build.md](references/determinism-and-build.md))
- a blocked change (capacity decrease, no-revenue plan, duplicate key) → rework
  the manifest per the rules above
- `MANAGED_BY_CODE` from an API/CLI call → you used the wrong surface; edit the
  manifest and push instead.
