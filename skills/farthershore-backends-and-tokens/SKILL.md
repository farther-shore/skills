---
name: farthershore-backends-and-tokens
description: Use when connecting a business to the API it fronts — creating backends (production vs environment-scoped), minting and rotating runtime tokens (fsrt_) and maker tokens (mk_), wiring FS_RUNTIME_TOKEN so signed usage reports verify, and diagnosing a call that authorizes but never reaches your API. Load when the task mentions upstream, origin, backend, runtime token, signed metering, or 503 origin_unavailable.
metadata:
  version: 2.0.0
---

# Backends and tokens

A **backend** is the upstream the gateway forwards to. A **runtime token**
(`fsrt_`) is how that upstream proves its usage reports are genuine. Both are
**operate** state — imperative, via the CLI. Read
[farthershore-overview](../farthershore-overview/SKILL.md) first.

## Backends are environment-scoped

The single most common source of lost time.

| Created with | Serves |
| --- | --- |
| `backend create <biz> …` | **production only** |
| `backend create <biz> --env <name> …` | **that environment only** |

A production backend does **not** serve environment hosts. Calling an env host
without an env-scoped backend returns **503 `origin_unavailable`** — *after*
auth and grants have passed, which makes it look like a platform fault.

`backend bind` does not fix this: it looks for a backend **already in** that
environment and 404s when there isn't one. To give an environment an origin,
**create** a backend with `--env`.

```bash
# production
farthershore backend create <biz> --name "Acme API" --slug acme-api \
  --transport direct --origin-url https://api.example.com --default --format json

# every environment needs its own
farthershore backend create <biz> --env test --name "Acme API (test)" \
  --slug acme-api-test --transport direct --origin-url https://staging.example.com \
  --default --format json
```

**Success signal:** `isDefault: true` and the `environmentId` you expected
(`null` for production).

Publishing refuses without one: *"A business origin or declared backend is
required before publishing."*

## Transports

- **`direct`** (default) — the gateway calls a public HTTPS origin. Nothing to
  install; requests are signed so your upstream can verify them.
- **`tunnel`** — for an origin that cannot accept inbound connections. Needs a
  runtime token carrying the `tunnel` operation.

`backend list <biz>` shows transport, status, and last-seen. A default backend
that is unhealthy or long-unseen is worth investigating.

## Runtime tokens (`fsrt_`)

Mint one **per backend scope**:

```bash
farthershore backend tokens create <biz> --backend <backendId> --format json
farthershore backend tokens create <biz> --env test --format json
farthershore backend tokens list   <biz> --format json     # ids + lastFour only
```

**One-time secret.** The full token is shown once at mint/rotate. Capture it
immediately into a `600` file; never echo it, never put it in argv.

### Rotation — order matters

1. `tokens create` (or `rotate`) → capture the new secret.
2. Deploy it to the upstream's `FS_RUNTIME_TOKEN` and **restart** the process.
3. Verify the upstream still works.
4. **Then** `tokens revoke <old> --yes`.

Revoking before step 2 breaks the backend. Do step 4 last.

## What the runtime token is actually for

**Signed usage reports.** The upstream signs
`{ method, path, rawDimsUnits }` with HMAC-SHA256 using the runtime token and
sends `x-fs-metering`, `x-fs-metering-sig`, `x-fs-metering-token`.
`@farthershore/backend`'s `withUsage` / `createUsage` do this for you.

The gateway settles usage **exclusively** from that signed report — which
creates a failure mode worth internalising:

> **A wrong or missing runtime token does not error. It silently degrades.**
> The gateway cannot verify the report, discards it, and falls back to route
> defaults. Requests still count; your custom dimensions vanish. Nothing in the
> response says so.

If `usage summary` shows requests but not your metered dimension, check the
token **before** hunting for a metering bug.

**Corollary:** one upstream can sign for only **one** backend scope at a time,
because `FS_RUNTIME_TOKEN` is a single value. Sharing one deployment across two
businesses — or across production and an environment — means only the currently
set token verifies. Give each scope its own deployment.

## Maker tokens (`mk_`)

Your own credential for the CLI.

```bash
farthershore token list   --format json
farthershore token create --name <label> --scope <scopes...> [--business <id>]
farthershore token revoke <tokenId> --yes
```

Also one-time secrets. Prefer least privilege: business-scoped with only the
scopes the task needs, over broad org-wide tokens. Pass via
`FARTHERSHORE_TOKEN`, never `--token` (argv is world-readable).

## Diagnosing a call that never reaches your API

Each row is a different layer — work down it.

| Symptom | Meaning | Fix |
| --- | --- | --- |
| `401` + `x-fs-decision-id` | Gateway serving the business; no/invalid key | Use a valid `fsk_` key |
| `403 route_not_enabled` | Key fine; plan does not grant that route | Grant it in `business/`, release |
| `503 origin_unavailable` | Auth + grants passed; **no origin for this scope** | Create a backend for **this environment** |
| `404` from your app | Gateway forwarded; upstream lacks the path | Route declared but not implemented |
| Requests metered, custom dims missing | Signed report not verifying | Wrong/missing `FS_RUNTIME_TOKEN` |
| No `x-fs-decision-id` at all | You are not hitting the gateway | Check the host |

## Autonomy

- **auto** — listing; creating backends; minting and rotating runtime tokens
  following the ordered procedure.
- **confirm** — revoking a token that may be in use, and deleting a backend.
  Both break a live business.
