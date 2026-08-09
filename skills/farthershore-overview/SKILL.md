---
name: farthershore-overview
description: Use when starting any FartherShore task or working in a FartherShore business repository.
---

# FartherShore ownership model

FartherShore is Business-as-Code. Start with the repository, and read its
`AGENTS.md` before acting.

## Read current docs first

**Required before acting:** fetch the live machine-readable index:

```bash
curl -fsSL https://docs.farthershore.com/llms.txt
```

Start with these exact pages, then follow the task-specific links from the
selected skill:

- https://docs.farthershore.com/agents/overview
- https://docs.farthershore.com/agents/operation-classes
- https://docs.farthershore.com/get-started/overview
- https://docs.farthershore.com/reference/cli

## One owner for each kind of state

| State | Owner | Change surface |
| --- | --- | --- |
| Business structure: routes, features, plans, pricing, meters, limits, policies, surfaces | Repository | Edit `business/`, build, commit, and push |
| Platform operations with no code representation | Platform | Use the `farthershore` CLI |

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

## Load next

| Task | Skill |
| --- | --- |
| Create a business | [farthershore-quickstart](../farthershore-quickstart/SKILL.md) |
| Author routes, features, or other structure | [farthershore-business-sdk](../farthershore-business-sdk/SKILL.md) |
| Design plans, pricing, limits, or meters | [farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md) |
| Build a customer-facing surface | [farthershore-building-uis](../farthershore-building-uis/SKILL.md) |
| Test or release a repository change | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md) |
| Build or operate a backend | [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md) |
| Configure API-managed webhooks or frontend/runtime variables | [farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md) |
| Preview, release, or recover | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md) |
| Operate customer state, builder-org membership, or invitations | [farthershore-customer-operations](../farthershore-customer-operations/SKILL.md) |
| Operate platform agents, bulletins, or notifications | [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md) |
| Inspect workflows or diagnose a request, release, usage, or platform problem | [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md) |
