---
name: farthershore-quickstart
description: Use when creating a new FartherShore business or taking one from a slug to its first checked repository change.
---

# Create a business

Use one setup flow. Do not invent another bootstrap path.

## 1. Authenticate

Follow the device-login guidance in
[farthershore-overview](../farthershore-overview/SKILL.md). Wait for the human to
approve authority that includes creating the business; a request hint is not a
grant. Do not continue until `farthershore auth login` completes.

## 2. Create

```bash
farthershore business create <slug>
```

The command returns the managed repository URL. That URL is the handoff; do not
infer another lookup path or retry creation through a different surface.

## 3. Clone and read local instructions

```bash
git clone <managed-repository-url>
cd <cloned-repository>
```

Read `AGENTS.md` completely before editing. It is authoritative for the
repository layout, pinned package versions, build commands, branch rules, and
release checks.

## 4. Author the business from scratch

Write the requested structure under `business/` with the current functional
`@farthershore/business` SDK. The repository owns routes, features, plans,
pricing, meters, limits, policies, and surfaces. Do not copy a starter product
shape and do not write any of this state through the CLI or API.

Load [farthershore-business-sdk](../farthershore-business-sdk/SKILL.md) for the
authoring model and
[farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md)
when plans or metering are involved.

## 5. Build

Follow `AGENTS.md` for dependency installation, then run:

```bash
farthershore build
```

Fix build diagnostics in `business/`. A successful build is the local contract
check.

## 6. Push and inspect checks

Commit the coherent change, push it according to `AGENTS.md`, and inspect the
GitHub checks for that pushed commit. Do not declare success from a local build
alone. Fix a failed business check in the repository and push the correction.

## 7. Operate

After repository checks pass, use the `farthershore` CLI for platform operations
that have no code representation. Run `farthershore <command> --help` before
composing an operation, and load the relevant operating skill from
[farthershore-overview](../farthershore-overview/SKILL.md).
