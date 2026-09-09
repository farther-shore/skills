---
name: farthershore-observability-and-troubleshooting
description: Use when diagnosing a denied request, failed apply, wrong release, missing usage, unhealthy backend, customer access problem, or suspected platform fault.
---

# Observe first, then repair the owning layer

Preserve correlation IDs and identify the first wrong boundary before mutating
state. A denial, apply, frontend build, backend call, and subscription workflow
are separate facts.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree operations --format json
farthershore docs read operate/observability-and-troubleshooting --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Use the pages for the symptom:

- https://docs.farthershore.com/operate/observability-and-troubleshooting
- https://docs.farthershore.com/operate/limits
- https://docs.farthershore.com/operate/apply-timeline
- https://docs.farthershore.com/operate/releases
- https://docs.farthershore.com/operate/usage-billing-policy
- https://docs.farthershore.com/cookbook/diagnose-denied-request
- https://docs.farthershore.com/cookbook/diagnose-billing-usage
- https://docs.farthershore.com/reference/response-codes

## Inspect platform agents and communications

Treat platform-agent state, bulletin posts, and notifications as separate
operational signals:

```bash
farthershore agents list <business> --format json
farthershore agents status <business> --format json
farthershore agents runs-show <business> <runId> --format json
farthershore bulletin list <business> --format json
farthershore notifications preferences <business> --format json
```

Use `agents runs-show` for one run's paper trail. Notification preferences show
email opt-outs; they are not an inbox or delivery log. Enabling or disabling an
operator changes live behavior and billing, so inspect status and run `--help`
before the write. A bulletin acknowledgment is a handoff marker; it does not
prove the requested change was applied.

## Establish target and serving state

Record organization, business, environment, UTC time, full commit SHA or
release tag, apply/build/workflow IDs, request ID, and CLI version.

```bash
farthershore business show <business> --format json
farthershore business status <business> --format json
farthershore apply-timeline list <business> --env all --format json
farthershore frontend status <business> --format json
farthershore backend list <business> --format json
```

For a preview, pass its explicit environment everywhere. A successful contract
apply does not prove the frontend built; an active frontend does not prove the
backend origin or customer subscription is healthy.

## Diagnose one denied request in order

Capture the response status, error code, `_fs`, `Retry-After`,
`X-FS-Decision-Id`, and request ID. Do not retry yet.

```bash
farthershore denial show <business> <requestId> --format json
farthershore business routes <business> --env <environment> --format json
farthershore business contract <business> --env <environment> --format json
farthershore consumer list <business> --env <environment> --format json
```

Walk these boundaries in order and report the first failure:

1. **Environment/host:** request reached the intended business environment.
2. **Credential:** API key, customer session, service identity, or preview
   persona is valid for that environment and customer.
3. **Customer:** customer exists, is not removed, and is not `SUSPENDED`/blocked.
4. **Subscription/payment:** subscription is active for the intended compiled
   plan version; checkout/provider reconciliation is not pending or failed.
5. **Route:** exact method/path matches the accepted contract.
6. **Plan grant:** the customer's active plan grants that route.
7. **Member permission:** verified role vocabulary grants the required RBAC
   permission when the route is member-scoped.
8. **Limit:** quota, rate, concurrency, resource, spend, or provider capacity has
   not denied the request. Follow `Retry-After` only for retryable rate or
   concurrency decisions.
9. **Backend:** only after admission passed, inspect per-environment origin,
   gateway verification, application logs, and upstream response.

For preview persona reproduction, use the same environment and plan:

```bash
farthershore persona list <business> --env <environment> --format json
farthershore persona bootstrap <business> --env <environment> \
  --plan <plan> \
  --idempotency-key <persisted-persona-bootstrap-attempt-key> --format json
```

The returned persona key is one-time secret output. Keep it out of logs and use
it for one controlled reproduction. Do not broaden a role, plan, or limit merely
to make a test pass.

## Correlate usage and latency

```bash
farthershore usage summary <business> --format json
farthershore analytics log <business> --range 1h --domain usage --format json
farthershore analytics timeseries <business> --range 24h --domain usage --format json
farthershore analytics latency <business> --range 1h --format json
```

Analytics defaults to production; pass `--env <environmentId>` for preview.
End-to-end latency includes the business backend. If fixed requests count but a
dynamic dimension is missing, inspect runtime-token scope and signed report
verification. Correlate one request ID end to end before changing metering.

## Diagnose release and workflow failures

```bash
farthershore apply-timeline inspect <business> <id-or-tag-or-sha> \
  --env <environment> --format json
farthershore frontend status <business> --env <environmentId> \
  --wait --timeout 600 --format json
```

For agent-operable workflows, the Apply Timeline is the authoritative
inspection surface. Do not invent an internal workflow-admin credential or use
an undocumented replay command.

- `build`/`compile`: inspect repository input and diagnostics; fix and push a new
  commit when the source is wrong.
- accepted input with failed publication/convergence: preserve IDs and avoid
  speculative contract changes.
- failed frontend build: inspect its producing commit, error, and variables;
  fix and push, or roll back only to a reviewed known-good release.

## Use audit evidence

```bash
farthershore audit-log business-list <organizationId> <businessId> \
  --from <ISO-8601> --format json
```

Audit rows prove who requested and authorized an operation. They do not replace
current-state read-back or prove an asynchronous workflow converged.

## Repair or escalate

| Evidence                                                            | Owner                      | Safe next action                                          |
| ------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------- |
| Wrong route, grant, plan, limit, meter, policy                      | Repository                 | Fix `business/`, preview, push, release                   |
| Wrong customer status, role assignment, promo, persona              | Platform operation         | Use the narrow customer operation, then read back         |
| Missing/wrong preview origin                                        | Environment backend        | Create/bind the exact environment backend                 |
| Wrong hosted frontend only                                          | Frontend pointer           | Roll back to a reviewed known-good target and verify pin  |
| Accepted apply repeatedly fails publication                         | Platform workflow          | Preserve evidence and escalate                            |
| Payment succeeded but subscription never activates                  | Platform/provider workflow | Preserve customer/provider/workflow evidence and escalate |
| Equivalent targets behave differently for the same artifact/request | Platform/runtime           | Preserve both traces and escalate                         |

Stop mutating when the failure lies in a platform-owned provider, queue,
workflow, edge publication, or retained state that the CLI cannot safely repair;
when a destructive action lacks an exact target and restore path; or when a
secret may have leaked. Report the smallest reproduction, UTC time, target,
exact command, structured error, correlation IDs, and the last known change.
