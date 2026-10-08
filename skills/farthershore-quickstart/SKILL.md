---
name: farthershore-quickstart
description: Use when creating a new FartherShore business or taking one from a slug to its first checked repository change.
---

# Create a business

Use one setup flow. Do not invent another bootstrap path.

## 0. Confirm the deployment prerequisite

Before creating anything, confirm the session has somewhere to run a long-lived
HTTP service on a public HTTPS URL, the ability to set environment variables
there for `FS_RUNTIME_TOKEN`, and a way to read that service's logs. Missing any
of the three, STOP and ask the human — FartherShore fronts a service the builder
runs, and going live requires a bound production origin for every declared
backend. See the prerequisite section in
[farthershore-overview](../farthershore-overview/SKILL.md#deployment-is-a-prerequisite).

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree platform --format json
farthershore docs read get-started/quickstart --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Use:

- https://docs.farthershore.com/get-started/quickstart
- https://docs.farthershore.com/get-started/install
- https://docs.farthershore.com/agents/overview
- https://docs.farthershore.com/reference/cli

## 1. Authenticate

Follow the device-login guidance in
[farthershore-overview](../farthershore-overview/SKILL.md). Wait for the human to
allow the CLI to act as them. Normal login follows the user's live platform role
across all current and future organizations and businesses. Do not continue until
`farthershore login` completes.

If the business belongs in a different organization than the saved default,
select that context without logging in again:

```bash
farthershore auth organization list --format json
farthershore auth organization use <id-or-slug>
```

## 2. Create

```bash
farthershore business create <slug> --format json
```

To create outside the saved default organization, note that `--organization` is
a GLOBAL option and must precede the subcommand:
`farthershore --organization <id-or-slug> business create <slug> …`. Placed after
`create`, it is rejected as an unknown option.

The command returns the managed repository URL. That URL is the handoff; do not
infer another lookup path or retry creation through a different surface.

If create fails with `OUTCOME_UNKNOWN`, the business may already exist. Run
`farthershore business list --format json` before creating again; repeating a
create for a slug that now exists returns `CONFLICT`, and the existing business
is usually yours.

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

## 4b. Scaffold the backend service

Declarations alone are not a working application. Scaffold the HTTP service from
the repository root — never hand-write the raw-body capture or the
`fs.middleware()` verification chain:

```bash
farthershore create api --help   # the current language list
farthershore create api --node
```

It lands in `api/` and appends build-output entries to the root `.gitignore`.
`--path <dir>` retargets the repository root and `--force` overwrites an existing
`api/`; nothing binds the service to that directory afterwards, since the
platform only ever sees the deployed origin URL. The template listens on `PORT`
(default **8080**), serves an unsigned `/healthz` BEFORE verification, and uses
`fs.ready` / `fs.start()` to bootstrap against `FS_RUNTIME_TOKEN`. Start the HTTP
listener before bootstrap so `/healthz` answers while bootstrap retries, rather
than crash-looping the deployment.

Load [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md)
to deploy it, register its origin, and mint its runtime token.

## 5. Build

Follow `AGENTS.md` for dependency installation, then run:

```bash
farthershore build
```

Fix build diagnostics in `business/`. A successful build is the local contract
check.

## 6. Push and inspect checks

Commit the coherent change, push it according to `AGENTS.md`, and inspect the
GitHub checks for that pushed commit. A direct branch push reports
`farthershore/build` then `farthershore/apply`. `farthershore/validate` is the
pull-request check and does not appear on a plain push — do not wait for it. Do
not declare success from a local build alone. Fix a failed business check in the
repository and push the correction.

## 7. Operate

After repository checks pass, use the `farthershore` CLI for platform operations
that have no code representation. Run `farthershore <command> --help` before
composing an operation, and load the relevant operating skill from
[farthershore-overview](../farthershore-overview/SKILL.md).

## Skill order for a new business

| Step                                            | Skill                                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Ownership model, prerequisite, docs traversal   | [farthershore-overview](../farthershore-overview/SKILL.md)                                     |
| Slug to first checked commit                    | this skill                                                                                     |
| Authoring `business/`                           | [farthershore-business-sdk](../farthershore-business-sdk/SKILL.md)                             |
| Plans, pricing, included usage, limits, meters  | [farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md)                 |
| `create api`, deploy, origins, runtime tokens   | [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md)             |
| Customer-facing surfaces                        | [farthershore-building-uis](../farthershore-building-uis/SKILL.md)                             |
| Previews, applies, production release           | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md) |
| Personas and RBAC proofs                        | [farthershore-customer-operations](../farthershore-customer-operations/SKILL.md)               |
| Denials, failed applies, missing usage          | [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md) |
