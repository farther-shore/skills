---
name: farthershore-frontend-hosting
description: Use when deploying, checking the status of, or rolling back a FartherShore product's managed (hosted) frontend. This is operate state — done imperatively via the farthershore CLI / MCP, not via the manifest.
metadata:
  version: 1.0.0
---

# Frontend hosting

The product's hosted frontend is **operate** state — you act on it directly with
the CLI/MCP, not through `product/product.config.ts`. Read
[farthershore-overview](../farthershore-overview/SKILL.md) first.

## Commands

```bash
farthershore frontend status   <product> [--env <env>] --format json
farthershore frontend deploy   <product> [--env <env>] [--ref <git-ref>]
farthershore frontend rollback <product> <releaseHash> [--env <env>]
```

Run `farthershore frontend --help` for the current flags (build command,
environment targeting, ref selection).

## Reading status

`frontend status` returns the current live release (hash, timestamp, whether
it's **pinned**, and the UI mode), any in-flight build, and recent successful
releases (your rollback targets). Interpreting it:

- An in-flight build that hasn't progressed for a long time is likely **stuck** —
  re-trigger a deploy; if it keeps failing, this may be platform-side
  ([escalate](../farthershore-operating-and-escalation/SKILL.md)).
- A **pinned** release won't be replaced by a normal deploy until unpinned (a
  rollback pins; that's expected).

## Deploy & rollback

- `deploy` builds from the connected repo (default ref = the environment's
  branch) and, on success, publishes a new release. It's deterministic and
  idempotent — the same inputs produce the same release.
- `rollback` flips the live pointer to a prior successful release hash and pins
  it. Idempotent.

## Autonomy

- **auto**: `status`, deploying to a **preview** environment, and **rollback**
  (it's reversible and recovers a known-good state).
- **confirm**: deploying a new frontend to **production** if it's a substantive,
  subscriber-visible change — fold it into the production release decision
  ([farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)).
