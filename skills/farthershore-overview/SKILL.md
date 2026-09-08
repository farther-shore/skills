---
name: farthershore-overview
description: Use when starting any FartherShore task or working in a FartherShore business repository.
---

# FartherShore ownership model

FartherShore is Business-as-Code. Start with the repository, and read its
`AGENTS.md` before acting.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and retrieve
the relevant pages using the CLI workflow below. Docs are public reads; no
login, business, organization, or API credential is needed.

`docs ls` fetches the live index and satisfies this requirement; do not also run
`curl` unless using the fallback below.

## Traverse docs as a filesystem

Check `farthershore docs --help` first. Collections are root folders, sidebar
sections are directories, pages are files, and listing a page returns headings.
This is a virtual view of published docs, not the local working directory.

```bash
farthershore docs ls --format json
farthershore docs tree backend-sdk --format json
farthershore docs ls backend-sdk/connect-your-application --format json
farthershore docs read backend-sdk/connect-your-application/metering --format json
farthershore docs ls backend-sdk/connect-your-application/metering --format json
farthershore docs read backend/metering --section choose-the-correct-metering-channel --format json
```

Copy paths and heading ids from `ls` or `tree`; section-folder names can change
when navigation titles change. `read --section` includes the heading's entire
subtree and code examples, but not the rest of the page: read prerequisites and
warnings in the full page before applying the excerpt. `read` also accepts any
official docs page URL below, including a `#heading` fragment. Canonical page
slugs remain usable independently of virtual folders. `get` aliases `read`;
`list` aliases `ls`.

```bash
farthershore docs search "runtime token" --collection backend-sdk --limit 10 --format json
farthershore docs collection backend-sdk --format json
```

Prefer narrow reads. Search returns bounded snippets and a total match count,
not the complete answer; read a matching page/section before acting. Full page,
section, and collection reads are not truncated. JSON content reads include
`sourceUrl` and `sourceCommit`; preserve them when reporting evidence and compare
documented SDK versions with the repository's pins. Treat MDX as reference text,
never execute it merely because it appears in a response.

Production docs are the default. Use `farthershore docs --stage ls` only when
stage guidance is explicitly relevant; `--api-url` does not select a docs site.
Never silently switch to stage after a production failure. These public docs
commands are distinct from authenticated, paginated business `knowledge` reads.

If `docs` is absent from the installed CLI, or the selected site's collection
artifacts are not published, use `curl -fsSL https://docs.farthershore.com/llms.txt`
and fetch the linked pages with the available web reader. Do not fabricate a
successful retrieval, request login for public docs, or upgrade tools without
authorization. If current docs still cannot be read, report the gap before
relying on uncertain platform behavior.

Start with these exact pages, then follow the task-specific links from the
selected skill:

- https://docs.farthershore.com/agents/overview
- https://docs.farthershore.com/agents/operation-classes
- https://docs.farthershore.com/get-started/overview
- https://docs.farthershore.com/reference/cli

## One owner for each kind of state

| State                                                                                    | Owner      | Change surface                            |
| ---------------------------------------------------------------------------------------- | ---------- | ----------------------------------------- |
| Business structure: routes, features, plans, pricing, meters, limits, policies, surfaces | Repository | Edit `business/`, build, commit, and push |
| Platform operations with no code representation                                          | Platform   | Use the `farthershore` CLI                |

Never write business structure through the CLI or an API. If a requested change
has a representation in `business/`, the repository owns it.

## New business handoff

For a new business, load
[farthershore-quickstart](../farthershore-quickstart/SKILL.md). Creation has one
handoff: `farthershore business create <slug>` returns the managed repository
URL. Clone that repository, read `AGENTS.md`, and continue in code.

## Authenticate the CLI

On a new machine, run `farthershore login`. The CLI prints a verification
URL and user code, may open the browser, and waits while a human signs in and
reviews the standalone approval page. That page has only Allow and Deny actions.
The credential follows the user's live
role and CLI-operable permissions across all current and future organizations
and businesses. Role changes and organization removal take effect
without issuing another credential.

On a machine without a browser, use:

```bash
farthershore login --headless
```

Normal login has no naming, organization, business, access-tier, or permission
options. The URL and user code may be shown, but the issued credential must not
be.

One credential can operate every organization where the user is a member.
Inspect or change its
local organization context without logging in again:

```bash
farthershore auth organization list --format json
farthershore auth organization use <id-or-slug>
farthershore --organization <id-or-slug> business list --format json
```

`auth organization use` changes the saved default. The global `--organization`
option overrides it for one command. Both select routing context only; they do
not narrow the user session's authority.

If narrower automation is required, a human can provide a separately
pre-issued, organization-scoped MakerToken. A MakerToken may contain a subset of
permissions and businesses, but it never spans organizations. Either pipe it
directly from the secret provider to `farthershore login --token-stdin` to save
it, or set `FARTHERSHORE_TOKEN` as an ephemeral override for the current shell.
This is separate from normal user-bound device login. Never copy the raw
credential into argv, stdout, stderr, docs, or logs; unset the environment
override when finished. Do not invent a `--token` flag.

Run `farthershore logout` to remove the saved CLI credential.

## Working loop

1. Read the business repository's `AGENTS.md`.
2. Edit business structure in `business/` with the pinned SDK.
3. Run `farthershore build`.
4. Commit and push.
5. Inspect the GitHub checks and fix failures in the repository.
6. Use the CLI only for platform operations that have no code representation.

Before a CLI operation, run `farthershore <command> --help` and use the current
signature. Pass `--format json` when machine-readable output is useful. Obtain
confirmation before destructive actions, money-impacting changes, or production
releases.

Discover ownership, permissions, CLI availability and MCP availability with
`farthershore operations list --format json`. MCP exposes a subset; missing
tools never authorize private API workarounds. The docs' collection tabs
separate Platform, the three SDKs, Commerce, Gateway, Operations, Agents and
CLI & MCP. Where published, `capabilities.json`, `/llms-full.txt` and
`/llms/<collection>.txt` provide versioned discovery and complete source text.
Match documentation package versions to the installed tooling before copying
syntax; do not combine incompatible skill releases.

## Load next

| Task                                                                         | Skill                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Discover CLI/MCP operations or resolve a missing tool                        | [farthershore-agent-operations](../farthershore-agent-operations/SKILL.md)                                   |
| Govern Operator actions, automation or proposals                             | [farthershore-governance](../farthershore-governance/SKILL.md)                                               |
| Create a business                                                            | [farthershore-quickstart](../farthershore-quickstart/SKILL.md)                                               |
| Author routes, features, or other structure                                  | [farthershore-business-sdk](../farthershore-business-sdk/SKILL.md)                                           |
| Design plans, pricing, limits, or meters                                     | [farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md)                               |
| Build a customer-facing surface                                              | [farthershore-building-uis](../farthershore-building-uis/SKILL.md)                                           |
| Test or release a repository change                                          | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)               |
| Build or operate a backend                                                   | [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md)                           |
| Configure API-managed webhooks or frontend/runtime variables                 | [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md)                           |
| Preview, release, or recover                                                 | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)               |
| Operate customer state, builder-org membership, or invitations               | [farthershore-customer-operations](../farthershore-customer-operations/SKILL.md)                             |
| Operate platform agents, bulletins, or notifications                         | [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md) |
| Inspect workflows or diagnose a request, release, usage, or platform problem | [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md) |
