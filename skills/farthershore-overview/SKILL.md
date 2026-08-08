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
