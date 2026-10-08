---
name: farthershore-backends-and-runtime
description: Use when connecting a backend, verifying gateway requests, storing subscriber data, reporting usage, managing runtime tokens, or diagnosing origin_unavailable.
---

# Verified backend work

Target the installed `@farthershore/backend` version; this guidance describes
0.21.x. Logical backends and route bindings are repository-owned. Concrete
origins, runtime credentials and host secrets are operational state.

## Deployment is a prerequisite

FartherShore fronts an HTTP service that the builder runs; it never hosts it.
Confirm before anything else that there is somewhere to run a long-lived HTTP
service on a public HTTPS URL, a way to set `FS_RUNTIME_TOKEN` there, and a way
to read that service's logs. Missing any, STOP and ask the human.

**Quick first-time path** — one service, direct transport: scaffold with
`farthershore create api --node`, deploy with the host's own CLI (`railway up`,
`render deploys create`, `flyctl deploy`, `gcloud run deploy`), give it a public
HTTPS domain, register the origin, then mint the token.

**Long-horizon path** — once a preview and a production environment must stay in
step, describe the hosting declaratively instead: one `tofu` root, a remote state
backend with locking, one workspace per environment, a separate deployment and a
separate `FS_RUNTIME_TOKEN` per environment. Read
[references/infrastructure-opentofu.md](references/infrastructure-opentofu.md)
before writing it.

## Scaffold the service; never hand-write verification

```bash
farthershore create api --help   # the current language list
farthershore create api --node
```

Run it from the managed repository root (the directory containing `business/`).
It writes the service into `api/` and appends build-output entries to the root
`.gitignore`; `--path <dir>` retargets the root and `--force` overwrites an
existing `api/`. The directory is not load-bearing — move or rename it freely,
since the platform only ever sees the deployed origin URL.

The Node template listens on `PORT`, defaulting to **8080**, serves an unsigned
`/healthz` BEFORE verification, and calls `fs.ready` / `fs.start()` to bootstrap
against `FS_RUNTIME_TOKEN`. Start the HTTP listener before bootstrap so
`/healthz` answers while bootstrap is still retrying; a top-level `await
fs.start()` that rejects on a bad token crashes the process and the host marks
the deployment failed. Log the bootstrap failure and retry rather than exiting.
Never reimplement the raw-body capture or the `fs.middleware()` chain: the
gateway signature covers the original request bytes, so any JSON parsing ahead
of verification breaks every request.

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

## Register the origin, then mint the token

Order matters: a runtime token scopes to backend rows, so the row must exist
first.

```bash
farthershore backend create <business> --env <environment> \
  --name api --slug api --transport direct \
  --origin-url <https-url> --default --format json
farthershore backend tokens create <business> --env <environment> --format json
```

Pass `--backend <backend-id>` on the mint when the environment has more than one
backend, so the token resolves to the intended row rather than depending on the
backend set staying singular.

If either write fails with `OUTCOME_UNKNOWN`, do not repeat it blindly: read
`backend list` (or `backend tokens list`) first. A token whose one-time value
was lost is rotated with `backend tokens rotate`, not minted again.

`backend list` and `backend tokens list` accept no `--env`: both are
business-wide reads. Filter on each returned row's environment instead of
expecting a flag.

`--transport tunnel` requires the Scale plan. The `fs.backend()` declaration
accepts `transport: { mode: "tunnel" }` on any plan and the manifest applies, but
the operate surface refuses to create the tunnel backend on a lower plan. Use
`direct` unless the workspace is on Scale.

A production publish fails with `BACKEND_TARGET_REQUIRED` unless EVERY backend
declared in `business/` has a concrete production origin, and with
`DEFAULT_BACKEND_REQUIRED` when several backends exist and none is the default.
Remedy a missing target with `farthershore backend bind <business> --env
production --origin-url <https-url> --format json`, or `backend create` when the
row itself is absent.

Store `FS_RUNTIME_TOKEN`, database URLs, and application secrets in the backend
host's secret manager. Platform variables do not configure an external
backend's process. For hosted UI/edge variables,
https://docs.farthershore.com/frontend/variables documents `FS_PUBLIC_*`
(public) versus other names (secret); delivery policy is separate.

Preserve signed raw request bytes and verify before JSON parsing or application
logic. Use the middleware order produced by `farthershore create api --node`. Never trust inbound
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
of measurement delivery or final billing. When the origin is down, the gateway
may surface the upstream's own failure rather than a typed `origin_unavailable`,
so read the deployment's logs before concluding the binding is wrong. For failures use
[farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md).
