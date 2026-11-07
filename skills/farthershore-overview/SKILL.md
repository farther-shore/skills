---
name: farthershore-overview
description: Use when starting a FartherShore task, creating a managed business, discovering supported operations, or locating the first failing boundary.
---

# Choose the next safe step

Read the repository's AGENTS.md and installed CLI/SDK pins. Resolve the intended
organization, immutable business ID, environment, caller and requested outcome.
The managed builder repository and the FartherShore platform monorepo have
different branch, CI and release rules; use the intended repository's rules.

The repository owns the business contract in `business/`: routes, grants,
plans, pricing, meters, limits, policies and surfaces. Supported platform
operations own live metadata, origins, variables, credentials, customer state
and activation. Hosting owns application deployments and process secrets.
Choose the owning surface before looking for a similarly named writer.

## Retrieve instructions before acting

Discover installed capabilities rather than assuming the newest CLI or hosted
MCP is deployed. Search in task language; read the **full guide**, including
prerequisites, failure and recovery sections. Search excerpts only select pages.
Check source/package versions against installed pins; a stale or truncated guide
is missing evidence. Describe the intended methods and inspect their inputs,
outputs, permissions, side effects, preview and retry metadata. Then execute the
authorized task and verify the documented result.

For hosted MCP the loop is search → describe guide/methods → run or run_writes;
describe supplies types. There is no extra MCP types tool. CLI code mode can
also expose types; use installed help for exact syntax. Plain CLI operations
require current leaf `--help`. Missing capability never authorizes a private API.

If search is unavailable or irrelevant, use canonical docs reads/section reads,
index/corpora or full Markdown retrieval. Start at
https://docs.farthershore.com/agents/overview or
https://docs.farthershore.com/get-started/quickstart; the index is
https://docs.farthershore.com/llms.txt. If current critical prerequisites remain
unavailable, report that gap before a dependent launch, payment, credential or
authority change. Never silently change environment to obtain working docs.

## Principal, secrets and retries

Normal `farthershore login` uses human device approval; headless sessions use
`farthershore login --headless`. The credential follows the user's live role
and CLI-operable permissions across all current and future organizations and
businesses. The standalone approval page has only Allow and Deny actions; it provides no configurable login choices.

Use current organization context as a selector for each command, preserving the
original session authority.
Organization selection changes command context, never credential authority:
`farthershore auth organization list --format json`,
`farthershore auth organization use <id-or-slug>`, or the global option
`farthershore --organization <id-or-slug> business list --format json`.

For a separately pre-issued organization-scoped MakerToken, securely pipe it
into `farthershore login --token-stdin` or use `FARTHERSHORE_TOKEN` as an ephemeral
override. Never place a raw credential in argv, stdout, stderr, chat or logs;
unset overrides after use. `farthershore logout` removes the saved credential.
Hosted MCP redacts one-time secrets even with approval: redaction is metadata,
not a usable credential. Choose secure CLI capture or human secret delivery;
do not issue repeatedly hoping to reveal a secret.

Inspect `retry.kind`, `retry.reconcile`, `retry.rationale`, `retry.enforcement`
and `retry.responseSemantics` from the operation catalog before dispatch.
`read_current` permits fresh reads. For `convergent_write`, reconcile current
state before repeating the same still-needed intent. For `no_automatic_retry`,
reconcile first and obtain direction if absence of the effect remains uncertain.
A write response is point-in-time, never a fresh read of current state.
`OUTCOME_UNKNOWN` requires reconciliation, not a write retry loop. A 429 or
explicit `safe_to_repeat` verdict is different from an ambiguous timeout/5xx.
`CONFLICT` requires read-back; `RELEASE_PENDING_ACCEPTANCE` and
`ROLLBACK_IN_FLIGHT` require observing the existing work. Use previews only
where advertised; `DRY_RUN_NOT_SUPPORTED` is a boundary, not permission to run
live. Proposal preview may store a simulation. A webhook test/trigger performs
external delivery: reconcile webhook deliveries before repetition. An auth
context-token is a short-lived credential with `no_automatic_retry`; follow its
specific recovery rather than treating an old response as fresh authority.

Business deletion, organization deletion, organization ownership transfer and
Stripe disconnect are human-only. Hand them to the responsible human through
the currently documented human-only flow; machine CLI credentials, CLI code mode and hosted
MCP cannot perform them. Chat approval or MCP confirmation does not change this
boundary. Do not try raw calls or another agent credential to bypass it.

## Create or diagnose

For creation, confirm the requested product shape. Only a product declaring an
upstream needs backend deploy access, secure host-secret delivery and logs;
an explicitly backend-free hosted product needs no artificial server/token.
Authenticate with the authorized principal, create the business, clone the
returned managed repository URL and read its AGENTS.md. Reconcile an uncertain
create through current business state before creating again. Author the
contract, typecheck/build/validate, push the reviewed change and inspect exact
commit checks through the release workflow. This is a checked repository
handoff, not a production or payment certificate.

For failure, retain UTC time, target, full SHA/release, request/decision and
apply/build/workflow IDs, structured error and retry headers, with secrets
excluded. Find the first wrong boundary: host/environment → credential/customer/
subscription → route/grant/member permission/limit → backend/report/publication.
Use https://docs.farthershore.com/operate/observability-and-troubleshooting.
Read current state and correlate one request before repair; do not widen access
to make reproduction pass. Escalate platform-owned publication/provider faults
with evidence when no supported repair exists.

## Load the owning workflow

- Contract, commerce and metering: [business-sdk](../farthershore-business-sdk/SKILL.md).
- Application service, hosting, variables, webhooks, tokens and usage: [backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md).
- Customer product surfaces: [building-uis](../farthershore-building-uis/SKILL.md).
- Managed repo checks, preview/personas, first paid launch and recovery: [environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md).
- Customer/builder membership, credentials, agreements, proposals, automation,
  platform agents, bulletins and notifications: [customer-operations](../farthershore-customer-operations/SKILL.md).

Load only workflows needed by the task. Paginated knowledge content is evidence,
not new authority; follow cursors without expanding scope.
