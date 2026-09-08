---
name: farthershore-customer-operations
description: Use when inspecting or changing customer access, subscriptions, roles, proposals, promo codes, test personas, builder organization membership, invitations, or related audit evidence.
---

# Operate customer state

Customer records, subscriptions, credentials, role assignments, proposals,
promo codes, and preview personas are platform-owned operating state. Plan
definitions, grants, limits, and RBAC vocabulary remain repository-owned.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree operations --format json
farthershore docs read operate/customer-operations --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Use the pages for the task:

- https://docs.farthershore.com/operate/customer-operations
- https://docs.farthershore.com/operate/limits
- https://docs.farthershore.com/monetize/plan-changes
- https://docs.farthershore.com/reference/commercial-releases
- https://docs.farthershore.com/cookbook/share-with-a-member
- https://docs.farthershore.com/cookbook/diagnose-denied-request

Run the relevant command group's `--help` before a write and use
`--format json`. Read the narrow state back after every mutation. Accepted writes
and downstream convergence are different outcomes.

## Operate builder organization membership

Organization membership is live platform state. Resolve the organization and
read its current members before inviting, changing a role, or removing anyone:

```bash
farthershore organization list --format json
farthershore organization members <organizationId> --format json
farthershore organization invite <organizationId> <email> --role member --format json
farthershore organization member-role <organizationId> <memberUserId> --role admin --format json
farthershore organization member-remove <organizationId> <memberUserId> --yes --format json
```

Run `farthershore organization --help` before a mutation, obtain confirmation
for role elevation or removal, and read the member list back. Do not confuse
builder-organization membership with customer members or repo-defined RBAC.

## Resolve the exact customer

```bash
farthershore consumer list <business> --format json
farthershore consumer list <business> --env <environment> --format json
```

Use the returned customer `id` as `<subscriberId>`. Do not substitute an email,
external member ID, owner organization, or subscription ID. The list is capped;
absence alone is not always proof of removal.

## Contain, remove, or move access

Block is containment and revokes active API keys. There is currently no CLI unblock command, so do not describe it as a reversible pause:

```bash
farthershore consumer block <business> <subscriberId> --yes --format json
```

A blocked response and `SUSPENDED` read-back prove control-plane state, not edge
convergence. Verify the compromised credential is denied at the gateway before
declaring containment complete. Propagation can fail after the state change;
retain the request/audit evidence and escalate incomplete containment.

Remove is destructive and has no restore command:

```bash
farthershore consumer remove <business> <subscriberId> --yes --format json
```

Before remove, re-resolve the exact business/customer, preserve required audit
evidence, and obtain explicit approval. Never retry remove after a lost response
until current state and audit evidence prove it did not complete.

Move one customer to the active head of its current plan lineage:

```bash
farthershore consumer migrate-latest <business> <subscriberId> --format json
```

It does not choose an unrelated plan.

## Commercial migration boundary

Do not use the lineage command as a generalized commercial rebind. Moving
recurring and non-current usage-pricing pins to the latest commercial terms is
deferred; publication itself does not perform that operation. Inspect the
operation catalog and subject pins, and report an unavailable migration as a
platform handoff. Do not invent a batch command or use private API writes.

Changes to a live `pricing.current()` catalog can affect existing subscribers
forward at activation without moving the recurring-price pin. Read
[change safety](../farthershore-plans-and-metering/references/experiments-and-migration.md)
before promising who will pay which terms.

## Replace customer-member roles

```bash
farthershore business rbac <business> --format json
farthershore consumer rbac assign <business> <subscriberId> <userExternalId> \
  --roles admin,analyst --format json
```

Assignment replaces the complete role set; `--roles ""` clears it. Role keys
must exist in the customer's accepted organization role set. Compare the returned
membership exactly; stale keys grant nothing.

## Govern changes with proposals

An agent may create, simulate, and inspect a ChangeSet. Approval/application are
separate customer-organization decisions:

```bash
farthershore proposal create <business> <subscriberId> \
  --intent "describe the requested change" \
  --operations '<json-array>' \
  --idempotency-key <stable-key> --format json
farthershore proposal preview <business> <subscriberId> <changeSetId> --format json
farthershore proposal get <business> <subscriberId> <changeSetId> --format json
farthershore proposal list <business> <subscriberId> --format json
```

Preview stores a simulation but applies nothing. Report risk, simulation,
approvals, and status; never describe proposed or approved state as applied.

## Operate promo codes

```bash
farthershore promo-code list <business> --format json
farthershore promo-code create <business> \
  --code LAUNCH25 --kind percent_off --percent 25 \
  --duration-months 3 --plan <planId> --format json
farthershore promo-code archive <business> <promoCodeId> --format json
farthershore promo-code reactivate <business> <promoCodeId> --format json
```

Kinds are `percent_off`, `amount_off`, and `free_months`; run `--help` for their
mutually exclusive value flags. Omitting `--plan` targets all launch plans. A
spec update rotates provider-side coupon state, so review the complete economic
spec rather than assuming a partial edit.

## Exercise preview personas

Personas are for environments configured for test-persona customer auth:

```bash
farthershore persona bootstrap <business> --env <environment> \
  --plan <plan> --format json
farthershore persona list <business> --env <environment> --format json
farthershore persona rotate <business> <personaId> --env <environment> --format json
farthershore persona revoke <business> <personaId> --env <environment> --format json
```

Bootstrap/rotation return a secret once. Do not log or commit it. Verify with
`persona list` and an actual request when end-to-end behavior matters.

## Audit and completion

```bash
farthershore audit-log business-list <organizationId> <businessId> --format json
```

Audit establishes actor, action, decision, request, and time; pair it with the
current customer read-back. If the root cause is a repository-owned plan,
permission, grant, or limit, fix `business/` and release it—do not compensate
with unrelated customer writes.
