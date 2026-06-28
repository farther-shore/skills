---
name: farthershore-overview
description: Use FIRST when starting any task on the FartherShore platform — establishes the Business-as-Code mental model, the contract-vs-operate boundary that determines HOW every change is made, the confirm-gated autonomy posture, and routes to the right FartherShore skill. Load whenever the user mentions FartherShore, a @farthershore/* package, a business repo, or the `farthershore` CLI/MCP.
metadata:
  version: 1.1.0
---

# Operating on FartherShore

FartherShore is a **Business-as-Code** platform. You define a software product in
code in its GitHub repo; FartherShore provisions the API gateway, billing,
usage metering, and a hosted developer portal around it. Your job as an agent is
to build and operate that product through **two surfaces**: the **repo** and the
**`farthershore` CLI / MCP tools**.

Read this skill first. It tells you the one rule that governs every change, how
much autonomy to take, and which skill to load next.

## The one rule: contract vs operate

Every change is one of two kinds. Using the wrong surface fails every time.

| Kind         | What it covers                                                                                                                     | How you change it                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **contract** | Anything that defines the business: plans, pricing, meters, routes, features, limits, capabilities, policies                       | **Edit `business/business.config.ts` and push.** The CLI/MCP/API will **refuse** these writes once the business is live (you'll see `MANAGED_BY_CODE`). |
| **operate**  | Runtime actions with no code representation: frontend deploys/rollbacks, runtime tokens, test personas, environments, brand fields | **Imperative** via the `farthershore` CLI or the matching MCP tool.                                                                                     |

> If you ever try to change a price, plan, route, or limit through the API/CLI
> and get `MANAGED_BY_CODE`, that is the platform telling you: **edit the
> manifest and push instead.** Do not retry the call.

A few things are **dual** (environments, publishing) — reconcilable from either
side. When in doubt, treat business _definition_ as contract and business
_actions_ as operate.

## The two loops

- **Build / Change loop** (contract, via the repo): edit `business/` → run
  `farthershore build` to validate locally → commit → push → watch the
  `farthershore/build` and `farthershore/apply` GitHub checks → fix on failure.
- **Operate loop** (operate, via CLI/MCP): inspect status/usage, deploy or roll
  back the frontend, rotate tokens, manage environments and test personas.

## Autonomy posture (confirm-gated)

Operate autonomously on safe, reversible work. Stop and get a human's sign-off
before anything that touches money or production. Every skill tags its actions:

- **auto** — just do it: reads/status, preview-environment deploys, frontend
  rollback, token rotation, local builds, scaffolding.
- **confirm** — present a short plan and wait for explicit human approval:
  pricing/plan changes (they hit real subscribers), any destructive `--yes`
  operation, and **production releases**.
- **escalate** — report and stop: platform-side failures you cannot fix from the
  public surface (see [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md)).

## Always read the business repo's own AGENTS.md

Every FartherShore business repo ships an `AGENTS.md` with **per-business
facts** this skill can't know: the live URL, which files are watched, and the
business's specific compiler rules. Read it before changing that repo. These
skills are the portable _how_; the repo's `AGENTS.md` is the local _what_.

## Where to go next

| If you're…                                                         | Load                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| setting up auth, connecting GitHub/Stripe, or creating a business  | [farthershore-onboarding](../farthershore-onboarding/SKILL.md)                                 |
| deciding which SDK-specific skills match this repo                 | run `farthershore skills recommend --format json`, then load the recommended skill files       |
| coordinating Business, Frontend, and Backend SDK work              | [farthershore-sdk-operating-model](../farthershore-sdk-operating-model/SKILL.md)               |
| defining or changing business structure (routes, features, limits) | [farthershore-product-as-code](../farthershore-product-as-code/SKILL.md)                       |
| changing pricing, plans, grants, or running price experiments      | [farthershore-plans-and-billing](../farthershore-plans-and-billing/SKILL.md)                   |
| creating preview environments or releasing to production           | [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md) |
| deploying, checking, or rolling back the hosted frontend           | [farthershore-frontend-hosting](../farthershore-frontend-hosting/SKILL.md)                     |
| wiring a backend or managing runtime/maker tokens                  | [farthershore-backends-and-tokens](../farthershore-backends-and-tokens/SKILL.md)               |
| monitoring a live business or deciding whether to escalate         | [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md)     |

## Conventions that hold everywhere

- Pass `--format json` (or run in a non-TTY) for machine-readable output:
  `{ ok, op, data }` on success, `{ ok:false, error:{ code, message, hint } }`
  on failure. Branch on `error.code`; the `hint` is your next step.
- Destructive operations require an explicit `--yes`. That is a deliberate gate
  — treat it as a **confirm** action.
- Run `farthershore <command> --help` to see the exact, current flags before
  composing a call. The surface evolves; the `--help` output is authoritative.
