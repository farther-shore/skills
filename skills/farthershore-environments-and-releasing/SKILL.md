---
name: farthershore-environments-and-releasing
description: Use when testing a FartherShore change in an environment or releasing it to production.
---

# Environments and releasing

How a change goes from a branch to live. Read
[farthershore-overview](../farthershore-overview/SKILL.md) and
[farthershore-business-sdk](../farthershore-business-sdk/SKILL.md) first.

## Branch → environment

- **`env/<name>` branches** map to isolated **preview environments**, each with
  its own subdomain, its own plans, and its **own backend**. Pushing `business/`
  changes there compiles and publishes to that environment — no release gate.
  This is where you test.
- **`main`** is the production source. Follow the repository's release rules;
  do not assume that a push alone publishes to production.

Confirm the business's exact branch prefix in its `AGENTS.md` — it can be
customised.

## Creating an environment — order matters

```bash
# 1. the branch must EXIST first (env create requires a branch to track)
git push origin env/test

# 2. create the environment
farthershore env create <biz> --name test --branch env/test --format json
#    → note runtimeHostname: <hash>-test-<slug>.farthershore.com

# 3. push AGAIN so an apply fires for the now-existing environment
git commit --allow-empty -m "trigger env apply" && git push origin env/test

# 4. give the environment its own backend — production's does not serve it
farthershore backend create <biz> --env test --name "… (test)" --slug …-test \
  --transport direct --origin-url https://… --default
```

> **A branch push before the environment exists triggers nothing.** The apply is
> matched to an environment; if none existed at push time, no apply is recorded
> and downstream operations (like `persona bootstrap`) fail with an opaque 500.
> Push again after creating the env.

**Success signal:** `apply-timeline list <biz>` shows an entry with
`branch: env/test` at `status: applied`.

## Production release gate

Production release is confirm-gated. Read `AGENTS.md`, present the exact commit
and business changes, and get approval before following the repository's release
procedure. A local build is not release evidence: inspect the GitHub checks for
the pushed commit and require them to pass.

## Reading the apply timeline

`farthershore apply-timeline list <biz> --format json` is the best diagnostic on
the platform. Phases run in order:

```
build → compile → accept → edgePublish
```

The first phase that is not `succeeded` carries the `error`, and **which** phase
tells you where to look:

| Phase failed | It is |
| --- | --- |
| `build` | **your program** — read the diagnostics, fix `business/`, re-release |
| `compile` | the platform turning IR into edge config |
| `accept` / `edgePublish` | the release/publish path, not your code |

## The preview → production flow

1. Change `business/` on an `env/<name>` branch; push.
2. It applies to that environment. Test with a persona key —
   [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md).
3. Merge to `main`.
4. Inspect the GitHub checks and follow the approved production release procedure
   from `AGENTS.md`.

## Rollback

- **Frontend** — roll back to a prior release:
  [farthershore-frontend-hosting](../farthershore-frontend-hosting/SKILL.md).
- **Business structure** — revert the change in the repo and release again. There
  is no out-of-band contract-write path.

Before shipping a plan change, preview who moves:

```bash
farthershore plan diff <biz> --format json
```

## Autonomy

- **auto** — creating and using preview environments, pushing to `env/*`,
  testing there.
- **confirm** — merging to `main`, and cutting a **production Release**. That is
  a human-meaningful boundary: present what is shipping and get sign-off.
