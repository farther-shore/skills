---
name: farthershore-overview
description: Use when starting any FartherShore task or working in a FartherShore business repository.
---

# FartherShore ownership model

FartherShore is Business-as-Code. Start with the repository, and read its
`AGENTS.md` before acting.

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

On a new machine, run `farthershore auth login`. The CLI prints a verification
URL and user code, may open the browser, and waits while a human signs in and
reviews the request. A human approves the exact permissions and business scope;
request hints do not grant authority and the human may change them.

On a machine without a browser, use `farthershore auth login --headless`. Add
the known narrow boundary rather than omitting it:

```bash
farthershore operations list --format json # find the operation's exact permission
farthershore auth login --headless \
  --access read-only \
  --business <business-hint> \
  --permission <exact-permission> \
  --name <credential-name>
```

Repeat `--business` and `--permission` as needed; never invent a permission.
The URL and user code may be shown, but the issued credential must not be.

If a human provides a pre-issued credential, pipe it directly from the secret
provider to `farthershore auth login --token-stdin`. Never place a raw
credential in argv, environment variables, stdout, or stderr. Do not invent a
`--token` flag.

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
| Operate backends or runtime tokens | [farthershore-backends-and-tokens](../farthershore-backends-and-tokens/SKILL.md) |
| Operate hosted frontend releases | [farthershore-frontend-hosting](../farthershore-frontend-hosting/SKILL.md) |
| Monitor or escalate | [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md) |
