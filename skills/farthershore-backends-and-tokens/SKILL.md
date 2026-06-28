---
name: farthershore-backends-and-tokens
description: Use when wiring a bring-your-own backend to a FartherShore business, minting/rotating/revoking runtime tokens (fsrt_) for that backend, or managing maker tokens (mk_). Operate state — done via the farthershore CLI / MCP. Covers transports, the rotation procedure, and one-time-secret handling.
metadata:
  version: 1.0.0
---

# Backends & tokens

Backends and tokens are **operate** state — managed imperatively via the
CLI/MCP. Read [farthershore-overview](../farthershore-overview/SKILL.md) first.

## Backends (bring-your-own)

```bash
farthershore backend list   <product> --format json
farthershore backend create <product> --name <name> [--transport direct|tunnel] ...
farthershore backend delete <product> <backendId> --yes
```

- **direct** — your backend is reachable over HTTPS; FartherShore calls it
  directly (requests are signed so your backend can verify them).
- **tunnel** — for backends that can't accept inbound connections; a tunnel is
  established instead.

Run `farthershore backend --help` (and `... create --help`) for current flags,
including capabilities and origin configuration.

`backend list` shows each backend's transport, status, and last-seen time. A
default backend that's unhealthy or hasn't been seen in a while is a signal to
investigate (and possibly [escalate](../farthershore-operating-and-escalation/SKILL.md)).

## Runtime tokens (`fsrt_`)

Runtime tokens authenticate your backend to the platform (e.g. for gateway
verification, metering, health). They are **one-time secrets**: the full token
is shown **once** at mint/rotate — capture and store it immediately; you cannot
retrieve it again.

```bash
farthershore backend tokens list   <product> --format json
farthershore backend tokens create <product> --backend <id>     # shows secret once
farthershore backend tokens rotate <product> <tokenId>          # shows secret once
farthershore backend tokens revoke <product> <tokenId> --yes
```

### Rotation procedure (auto, but in this order)

1. `... tokens create` (or `rotate`) → capture the new secret.
2. Deploy the new secret to your backend (e.g. its `FS_RUNTIME_TOKEN` env).
3. Verify the backend works with the new token.
4. **Then** `... tokens revoke` the old one with `--yes`.

Revoking before the upstream is updated breaks the backend — do step 4 last.

## Maker tokens (`mk_`)

```bash
farthershore token list   --format json
farthershore token create --name <label> --scope <scopes...> [--product <id>]
farthershore token revoke <tokenId> --yes
```

Maker tokens are also one-time secrets. Prefer **least privilege**: create
product-scoped tokens with only the scopes a task needs rather than broad
org-wide tokens. (Run `farthershore token create --help` for the scope list.)

## Autonomy

- **auto**: listing; minting and **rotating** runtime tokens (following the
  ordered procedure).
- **confirm**: **revoking** a token that may be in active use, and **deleting** a
  backend — both can break a live business.
