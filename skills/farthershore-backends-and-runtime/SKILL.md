---
name: farthershore-backends-and-runtime
description: Use when connecting or operating a backend, hosting, runtime credentials, verified customer data, usage delivery, variables or webhooks.
---

# Connect the workload in dependency order

Read AGENTS.md and installed backend SDK/CLI pins. Resolve business, environment,
logical backend slug, concrete row, direct/tunnel transport and effective origin.
Logical backends/route bindings belong in `business/`; origins/tokens are
operational, process secrets and deployments belong to the external host.
Explicitly backend-free hosted products need no backend, runtime token or host.

## Retrieve the connection or repair guide

Search for the actual task and read the complete guide, prerequisites, failure
and recovery sections. Compare version/source evidence with installed pins.
Describe intended operations, types, permissions, preview and retry metadata;
plain CLI uses current leaf help. If search is unavailable, use canonical
https://docs.farthershore.com/backend/overview,
https://docs.farthershore.com/backend/runtime-tokens or
https://docs.farthershore.com/backend/metering and index/corpora at
https://docs.farthershore.com/llms.txt. A search excerpt, stale/truncated guide or
missing capability does not justify guessing. Stop dependent credential or
production changes if authoritative retrieval fails; never switch environment
or use a private endpoint. MCP describe supplies types; discover its actual
installed capabilities before use.

## First connection

1. For an upstream, establish deploy access, secure host-secret delivery and
   application logs. Integrate an existing server or start with
   `farthershore backend scaffold --node` from the managed repo root. Adapt the
   example route, meter, dimensions and entitlement to the actual contract;
   inspect the retrieved template/ref/pins. Overwriting an existing API folder
   is a separate deliberate action, not a routine scaffold flag.
2. Declare the logical backend and route refs; allocate the direct host/domain
   before starting a token-dependent process. Read scoped rows first, create an
   absent concrete row or bind an existing one, then mint a correctly scoped
   credential. A first production apply may require bindings before acceptance;
   do not wait for that apply to create its own required targets. Every declared
   production backend needs a target, with a default when several exist.
3. Capture the credential once into the host secret store as `FS_RUNTIME_TOKEN`,
   configure other process secrets, then deploy/start the SDK-integrated service.
   Hosted MCP always redacts one-time secrets, including approved writes: its
   redacted result cannot configure a host. Use supported secure CLI capture or
   human delivery. Do not mint repeatedly after a lost/redacted response.
4. For tunnels, retrieve the distinct eligibility, provisioning, embedded/sidecar
   and token-operation requirements; do not mechanically reuse direct ordering.
   For repeatable multi-environment hosting, retrieve the infrastructure guide;
   review the plan and protect remote locked state because it can contain secrets.

## Scope, identity and measurement

Preview origins can inherit a production binding by stable slug; this never
imports production plans, grants, pricing or customer state. A concrete preview
override changes that target. Isolation requires deliberately separate deployment
and storage where customer writes matter. Before an explicitly bound preview
credential, establish a concrete row in that scope and verify bootstrap/effective
target agree; do not silently broaden token scope to repair a mismatch. Discover
per-command environment defaults: list scope and mutation scope can differ.

Preserve SDK raw-byte capture and fail-closed verification **before JSON parsing**
or application logic, with open health outside protected middleware. Never trust
unsigned identity headers or a supplied tenant ID. Use verified
`ctx.principal.org.id`, `requireMember`/`requireService` and permission checks
appropriate to the actual subject. Signed traffic alone is not customer identity
or record authorization. Scope every storage query; unique constraints/atomic
upsert prevent concurrent first-write races but do not replace tenant predicates.

Use `ctx.report` with the original verified served identity and contract keys.
Do not report gateway-counted fixed costs again. One served request uses one
reporting channel and one post-stream callback: batch late meters with compatible
dimensions/quote; do not mix in-band and later post-stream settlement. Adapter
response-sink capability, not timing alone, chooses delivery. Deferred work must
belong to that request; saved context is not an independent cron credential.
Quotes require a declared backend-quoted contract. Inspect delivery results:
`ok: false`, queued work or a successful application response is not observed
usage. Reconcile uncertain delivery before repeating billing-affecting work.

## Verify, rotate or diagnose

Verify separately: bootstrap/health; real signed protected success; unsigned
origin rejection; wrong-principal/permission/cross-tenant denial; observed usage.
A resolved ready promise or healthy row proves none of the complete journey.
Correlate host deployment, effective row, exact contract/apply, request and usage
identities. For origin_unavailable or upstream failures, inspect logs and actual
binding before changing routing. For webhooks/variables retrieve current ownership,
delivery and secret visibility rules rather than treating them as host process
configuration; webhook tests cause external delivery.

Token rotation is a hard cutover: predecessor revocation and distributed successor
propagation can be separated in time. Obtain authorization covering disruption.
For planned overlap, separately mint the same kind, operations, allowlists and
business/environment/backend scope, securely deploy every replica, verify traffic
and reporting, then revoke the predecessor. Do not rely on creation defaults.
After a lost create/rotate result, reconcile metadata and lineage first; the old
secret is not readable. Choose a deliberate recovery and secure delivery path.
Never print tokens in argv, chat or logs, and never wrap writes in blind retries.

Use [environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)
for publication evidence. Report each verified fact and gap separately; a
reachable backend is not final billing or production-release proof.
