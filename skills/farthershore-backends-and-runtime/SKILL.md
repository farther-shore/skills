---
name: farthershore-backends-and-runtime
description: Use when connecting a backend, verifying gateway requests, storing subscriber data, reporting usage, managing runtime tokens, or diagnosing origin_unavailable.
---

# Build and operate a backend

Treat a logical backend and its route/meter relationships as repository-owned
contract state. Treat each environment's concrete origin, runtime token, and
host secrets as operational state.

## Read current docs first

**Required before acting:** fetch the live machine-readable index:

```bash
curl -fsSL https://docs.farthershore.com/llms.txt
```

Use the pages for the task:

- https://docs.farthershore.com/backend/overview
- https://docs.farthershore.com/backend/scaffold
- https://docs.farthershore.com/backend/consume
- https://docs.farthershore.com/backend/user-data
- https://docs.farthershore.com/backend/metering
- https://docs.farthershore.com/backend/runtime-tokens
- https://docs.farthershore.com/backend/transport-modes
- https://docs.farthershore.com/frontend/variables
- https://docs.farthershore.com/cookbook/add-backend

If a command or SDK call differs, follow the current docs and the repository's
pinned package version. Run `farthershore backend --help` before a write.

## Pair contract and environment state

Declare the logical backend in `business/`, attach routes and allowed meters,
then build and push. The string passed to `fs.backend("api", ...)` is the
logical slug; use that same `api` slug for the concrete row in each environment.
Use the row's UUID returned by `backend list` when a command asks for a backend
ID. Create or bind an origin separately for every environment that should serve
traffic:

```bash
farthershore backend create <business> \
  --name "Production API" --slug api --transport direct \
  --origin-url https://api.example.com --default --format json

farthershore backend create <business> --env preview \
  --name "Preview API" --slug api --transport direct \
  --origin-url https://preview-api.example.com --default --format json
```

A production origin does not serve a preview. `backend bind` changes an
existing direct backend row; it does not create a missing environment backend
and it does not convert a tunnel. If the selected environment has no resolvable
origin, the gateway returns `503 origin_unavailable` after auth and grants pass.

With zero configured backends there is no target. With one, it is the implicit
default. With multiple, the route must resolve one explicitly.

## Install and initialize the backend SDK

Use Node 22 or newer. **Current: 0.20.0.** Prefer the version pinned by the
application when it differs:

```bash
pnpm add @farthershore/backend
```

```ts
import { fartherShore } from "@farthershore/backend";

const fs = fartherShore.initFromEnv();
```

Store `FS_RUNTIME_TOKEN`, database URLs, and server secrets in the backend
host's secret manager. Farther Shore `PUBLIC`, `BUILD`, and `RUNTIME` Variables
configure hosted frontends and edge integrations; they never become process
environment variables in your backend.

## Verify identity before business logic

Install strict verification before parsing or handling signed requests. The
gateway signs the raw-body hash; preserve the exact raw bytes as the current
backend docs show. Use `fs.middleware()` or `fs.handler()` and fail closed.
Never trust caller-supplied `x-fs-*`, user-id, organization-id, plan, role, or
permission headers.

Inside a verified handler, derive identity from signed context:

```ts
import { requireMember, requirePermission } from "@farthershore/backend";

app.post("/v1/projects", fs.handler(async (ctx, req, res) => {
  const { memberId } = requireMember(ctx);
  requirePermission(ctx, "projects:create");
  const identity = {
    businessId: ctx.businessId,
    orgId: ctx.principal.org.id,
    subscriberId: ctx.signedContext!.subscriberId,
    subscriptionId: ctx.signedContext!.subscriptionId,
    memberId,
  };
  // Use these verified ids as tenant keys; never accept them from req.body.
  res.status(201).json(identity);
}));
```

The gateway is the route/plan boundary. The backend must still enforce
record-level ownership using the verified business, subscription, customer,
member, and service context appropriate to the route.

## Use a race-safe find-or-create pattern

For member-owned application data, key rows by the verified stable member ID
and the business/customer boundary required by the schema. Put a database
unique constraint on that identity and use an atomic upsert or insert-on-
conflict. A read followed by an insert is racy under concurrent first requests.

Test at least:

- two concurrent first requests create one row;
- one member cannot read or update another member's row;
- the same external email or body-supplied ID cannot cross tenant boundaries;
- a request with missing or invalid signed context fails before data access.

## Runtime tokens and rotation

Runtime tokens are one-time secrets used for gateway verification, signed
dynamic usage reports, and tunnels. Their scope can be business, environment,
backend, meter, route, and operation. Empty meter/route restrictions mean
unrestricted within the token's remaining scope; they do not mean no access.
A business-scoped token can bootstrap that business's backend rows across all
environments; use `--env` or `--backend` when isolation requires a narrower
deployment. It never crosses businesses.

```bash
farthershore backend tokens create <business> --backend <backendId> --format json
farthershore backend tokens list <business> --format json
```

Capture the secret once without logging it. For a planned zero-downtime change,
create a second token with the same explicit scope:

1. Create the replacement.
2. Store it in the host and restart every replica.
3. Verify signed requests and usage from the new deployment.
4. Revoke the old token only after verification:

   ```bash
   farthershore backend tokens revoke <business> <old-token-id> --yes --format json
   ```

Revocation is immediate. Never revoke first.

`backend tokens rotate` is a hard cutover: it creates a successor and revokes
the old token immediately, with no overlap window. Reserve it for a compromise
or a coordinated restart where interruption is acceptable.

## Meter through the correct channel

- Fixed route costs such as `requests.fixed(1)` are gateway-counted and need no
  backend report.
- Use response-bound signed usage when units are known before the response ends;
  this can settle the current request's estimated lease.
- Use post-stream reporting only on a route compiled with
  `postStreamBilling: true`; it is billing-only.
- Use `fs.meter()` for background work with a stable durable event ID and an
  attributable subscription; delivery is at-least-once.

A backend cannot invent a meter. Define it, attach it to the route, allow it on
the logical backend, build, and push before reporting it.

For an Express response whose exact units are known before it finishes, use the
verified request ID and copy the signed response headers back to Express:

```ts
import { withUsage } from "@farthershore/backend";

const metered = await withUsage(
  new Request(`https://backend.local${req.originalUrl}`, {
    method: req.method,
    body: req.rawBody,
  }),
  Response.json({ text: result.text }),
  { output_tokens: result.outputTokens },
  { requestId: ctx.requestId },
);
metered.headers.forEach((value, name) => res.setHeader(name, value));
res.status(metered.status).json({ text: result.text });
```

## Verify and recover

```bash
farthershore backend list <business> --format json
farthershore business routes <business> --env <environment> --format json
farthershore usage summary <business> --format json
```

Verify one signed request through the gateway and correlate its request ID with
the application log and intended meter dimensions. If requests count but custom
dimensions do not, verify runtime-token scope and signature handling. For a
systematic denial or routing diagnosis, load
[farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md).

Creating/binding backends and rotating tokens are reversible operating work.
Deleting a backend or revoking a token in use requires explicit confirmation.
