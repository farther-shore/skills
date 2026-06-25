---
name: farthershore-environments-and-releasing
description: Use when creating preview environments, testing a change before production, or shipping to production on FartherShore. Covers the branch→environment mapping, the env/* preview workflow, and the production Release gate (main never auto-deploys). Production releases are confirm-gated.
metadata:
  version: 1.0.0
---

# Environments & releasing

How a change goes from a branch to live. Read
[farthershore-overview](../farthershore-overview/SKILL.md) and
[farthershore-product-as-code](../farthershore-product-as-code/SKILL.md) first.

## Branch → environment

- **`env/<name>` branches** map to **isolated preview environments**, each with
  its own subdomain and its own plans. Pushing `product/` changes to an `env/*`
  branch compiles and publishes **immediately** to that preview environment —
  no release gate. This is where you test.
- **`main`** is the **production source** branch. Pushing to `main` compiles and
  validates, but does **not** publish to production on its own.

Confirm the product's exact branch prefix in its `AGENTS.md` (it can be
customized).

## Creating / listing environments

```bash
farthershore env list <product> --format json
farthershore env create <product> --name <name> --branch <branch>
```

Creating the `env/<name>` branch and pushing is the other half — the
environment and the branch reconcile to the same state. Run
`farthershore env --help` for current flags.

## The preview → production flow

1. Make the change in `product/` on an `env/<name>` branch; push.
2. It goes live in that preview environment. Test it there (use a test persona —
   see [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md)
   and the personas commands).
3. Merge the change to `main`.
4. **Cut a production release** to publish it (below).

## The production Release gate (confirm)

`main` never auto-deploys to production. To publish production, **cut a GitHub
Release** (a `v*` tag). The release triggers a fresh build+validate at the
release commit and, if green, publishes to production.

- This is a deliberate human-meaningful boundary. Treat cutting a production
  release as a **confirm** action — present what's shipping and get sign-off.
- Some purely runtime changes (no pricing/economic change) on an already-live
  product may publish without a new release; do not rely on this for anything
  subscriber-visible — when in doubt, release explicitly.

## Rollback

- **Frontend**: roll back to a prior release —
  [farthershore-frontend-hosting](../farthershore-frontend-hosting/SKILL.md).
- **Product/contract**: revert the manifest change in the repo and release
  again (the same forward path, in reverse). There is no out-of-band API to
  rewrite contract state.

## Autonomy

- **auto**: creating/using preview environments, pushing to `env/*`, testing
  there.
- **confirm**: merging to `main` and cutting a **production release**.
