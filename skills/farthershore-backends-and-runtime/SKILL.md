---
name: farthershore-backends-and-runtime
description: Use when connecting a backend, verifying gateway requests, storing subscriber data, reporting usage, managing runtime tokens, or diagnosing origin_unavailable.
---

# Verified backend work

Target the installed `@farthershore/backend` version; this guidance describes
0.21.x. Logical backends and route bindings are repository-owned. Concrete
origins, runtime credentials and host secrets are operational state.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree backend-sdk --format json
farthershore docs read backend/metering --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Read https://docs.farthershore.com/backend/overview, then the task's guide:
https://docs.farthershore.com/backend/metering,
https://docs.farthershore.com/backend/user-data,
https://docs.farthershore.com/backend/runtime-tokens, or
https://docs.farthershore.com/backend/transport-modes.

## Environment and verification boundaries

Match the logical slug in `fs.backend("api", ...)` to the environment's backend
binding. Commands asking for backend ID need the resolved row's UUID. A preview
with no concrete override resolves the same stable slug to its production
binding; an explicit preview binding overrides only that slug's origin and
credentials. Plans, pricing, routes, permissions, meters, limits, and policies
never participate in this fallback and always come from the selected
environment's Business SDK branch. Inspect `farthershore backend --help` and
explicitly select the environment. If neither an override nor a usable
production binding exists, routing fails closed with `origin_unavailable` even
when authentication and grants succeed.

Store `FS_RUNTIME_TOKEN`, database URLs, and application secrets in the backend
host's secret manager. Platform variables do not configure an external
backend's process. For hosted UI/edge variables,
https://docs.farthershore.com/frontend/variables documents `FS_PUBLIC_*`
(public) versus other names (secret); delivery policy is separate.

Preserve signed raw request bytes and verify before JSON parsing or application
logic. Use the generated scaffold's middleware order. Never trust inbound
`x-fs-*` headers or caller-supplied tenant IDs. After verification, use
`ctx.principal.org.id` plus the narrowed subject from `requireMember(ctx)`
or `requireService(ctx)`; use verified `ctx.signedContext` when a business,
subscriber or subscription boundary is needed. A signed non-contextual request
does not automatically have a customer principal.

Enforce record ownership in every database query. A unique constraint and
atomic upsert make first-request synchronization race-safe; neither replaces
tenant authorization. Test cross-tenant access and concurrent first requests.

## Measurement, not locally computed bills

There is one reporting verb: `ctx.report({ meter, values, dims?, quote? })`.
Use meter/measure/dimension keys from the served contract. The gateway counts
fixed request costs; do not report those again.

The Express adapter can attach in-band measurements before its response is
sent. By default, Fetch `verifyRequest` has no response sink and uses post-stream
delivery; an explicitly supplied `responseSink` changes that. Do not assume
timing alone selects in-band for every adapter.

A request must use one transport. After any in-band reports, a later
post-stream report is not a second settlement channel. For post-stream work,
batch all meters into one array call: a served request has one callback.
All entries must share one dimensions tuple and one quote; incompatible values
are rejected rather than rated independently.
Preserve the same verified served identity; do not synthesize a subscription,
release, or request identity. Deferred work must belong to that originating
served request and obey its single-use lifecycle. A saved context is not a
reusable reporting credential for independent cron or recurring jobs.

Validate a report before sending; inspect its result for delivery failure.
Do not claim a returned `ok: false` recorded usage or blindly replay an
uncertain billing operation. Only a declared backend-quoted price accepts
`quote`; otherwise report measurements, not money. Monetary admission and
post-stream bounds belong in the Business SDK contract.

## Runtime-token changes

For planned overlap: inspect and preserve the predecessor's stored kind,
operations, meter and route allowlists, and business/environment/backend scope
when creating its replacement. Do not rely on creation defaults. Deploy it
to every replica, verify signed traffic and measurement delivery, then revoke
the predecessor. `backend tokens rotate` revokes the predecessor as part of
rotation; it is a hard cutover, not a grace period. Database revocation and
distributed edge propagation are distinct; verify the actual traffic outcome.

Token issuance returns a one-time secret. Capture it into the secret manager,
not logs or chat. A token's business/environment/backend restrictions must
match the workload. Obtain approval before revoking an in-use credential.

## Verify the customer-visible outcome

Read backend readiness and intended route/environment, send a signed request,
and correlate request identity with application evidence and usage. A created
backend row is not proof of reachability; a successful response is not proof
of measurement delivery or final billing. For failures use
[farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md).
