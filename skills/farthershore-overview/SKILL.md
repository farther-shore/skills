---
name: farthershore-overview
description: Use when starting a FartherShore task, creating a managed business, discovering supported CLI operations, or locating the first failing boundary.
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

The `farthershore` CLI is the only agent surface: there is no platform-hosted
agent server (MCP) and no `code` command. Run `farthershore --version` and
discover installed capabilities rather than assuming the newest CLI is deployed;
`farthershore outdated` reports whether the repository's packages and the CLI
are behind, without changing files. Search in task language with
`farthershore docs search "<task>" --format json`; read the **full guide** with
`farthershore docs read <path>`, including prerequisites, failure and recovery
sections. Search excerpts only select pages. Check source/package versions
against installed pins; a stale or truncated guide is missing evidence. Describe
the intended operations through `farthershore operations list --format json`
and current leaf `--help`, and inspect their inputs, outputs, permissions,
side effects, preview and retry metadata. Then execute the authorized task and
verify the documented result. Missing capability never authorizes a private API.

If search is unavailable or irrelevant, use canonical docs reads/section reads,
index/corpora or full Markdown retrieval. Start at
https://docs.farthershore.com/agents/overview or
https://docs.farthershore.com/get-started/quickstart; the index is
https://docs.farthershore.com/llms.txt. If current critical prerequisites remain
unavailable, report that gap before a dependent launch, payment, credential or
authority change. Never silently change environment to obtain working docs.

## Principal, secrets and retries

There is one way to sign in. `farthershore login` opens the browser sign-in
(PKCE) and receives the result on this machine; over SSH, in CI or without a
reachable browser use `farthershore login --device` (or
`farthershore login --headless`, which never opens a browser) and enter the
printed code in a browser. A human approves the request; the agent cannot, and
should approve only a code for a sign-in it started. Normal login has no
permission or scope choices: the credential follows the user's live role
across all current and future organizations and businesses. The CLI keeps the
sign-in in the system keychain and renews it; reuse a valid intended session
and verify `farthershore auth whoami --format json` after any login.

Use current organization context as a selector for each command, preserving the
original session authority.
Organization selection changes command context, never credential authority:
`farthershore auth organization list --format json`,
`farthershore auth organization use <id-or-slug>`, or the global option
`farthershore --organization <id-or-slug> business list --format json`.

Unattended automation (CI, headless agents, shared machines) uses an
organization-scoped access token, never a person's own login. A human creates
it in the dashboard or with `farthershore token create` from a signed-in user
session; it holds exactly the listed permissions and business scope. Securely
pipe it into `farthershore login --token-stdin` or set `FARTHERSHORE_TOKEN` as
an ephemeral one-process override. Never place a raw credential in argv,
stdout, stderr, chat or logs; unset overrides after use. `farthershore logout`
signs out and removes the saved credential. A one-time secret is shown once in
the terminal and cannot be read back: capture it directly into secure storage,
because a lost or redacted response is not a usable credential. Choose secure
CLI capture or human secret delivery; do not issue repeatedly hoping to reveal
a secret.

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
Stripe disconnect are human-only. Hand them to the responsible human, who
completes them in the dashboard with fresh sign-in; CLI sign-ins and access
tokens cannot perform them. Chat approval does not change this boundary;
`HUMAN_ONLY_ACTION` is a handoff. Do not try raw calls or another credential to
bypass it.

## First run, in order

The spine of a new product. Each step names its leaf command; read that
command's `--help` and the owning workflow before running it, and stop at the
first step whose result you cannot observe.

1. Confirm the principal with `farthershore auth whoami --format json`, then
   create the business with `farthershore business create <slug>`. Pass the
   global `--secrets-file <path>` on every command that returns a one-time
   secret (creation shows the business's default secret key once): it writes
   the secret to a file you own instead of the terminal.
2. Clone the returned managed repository URL, read its AGENTS.md and author the
   contract in `business/`.
3. `farthershore build`, then `farthershore validate`; add `--transition` to
   see what moving from what is live would block or change.
4. Push a branch and read the checks, commit statuses and impact report on
   that exact commit.
5. Try it before production: `farthershore env create <business> --branch
   <branch>` binds a preview to a branch, and
   `farthershore persona bootstrap <business> --env <env> --plan <planKey>`
   creates a test customer whose keys work on the preview host only.
6. A product with an upstream connects it now: `farthershore backend scaffold
   --node`, deploy on the builder's own host, then `farthershore backend bind
   <business> <backend> --for all --origin <https-url>`
   ([backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md)).
7. First go-live is `farthershore business publish <business>`; every later
   version is `farthershore business release <business>`. Preview each with
   `--dry-run` first and observe the result with
   `farthershore business status <business>`
   ([environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)).

Guides for a non-production platform environment are read with the docs
command's `--stage` option, for example
`farthershore docs read <path> --stage`; never mix one environment's guide
with another environment's target.

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
