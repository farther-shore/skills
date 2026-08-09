---
name: farthershore-customer-operations
description: Use when inspecting or changing customer access, subscriptions, roles, proposals, promo codes, test personas, builder organization membership, invitations, or related audit evidence.
---

# Operate customer state

Customer records, subscriptions, credentials, role assignments, proposals,
promo codes, and preview personas are platform-owned operating state. Plan
definitions, grants, limits, and RBAC vocabulary remain repository-owned.

## Read current docs first

**Required before acting:** fetch the live machine-readable index:

```bash
curl -fsSL https://docs.farthershore.com/llms.txt
```

Use the pages for the task:

- https://docs.farthershore.com/operate/customer-operations
- https://docs.farthershore.com/operate/migrations
- https://docs.farthershore.com/operate/limits
- https://docs.farthershore.com/monetize/plan-changes
- https://docs.farthershore.com/cookbook/migrate-subscribers
- https://docs.farthershore.com/cookbook/share-with-a-member
- https://docs.farthershore.com/cookbook/diagnose-denied-request

Run the relevant command group's `--help` before a write and use
`--format json`. Read the narrow state back after every mutation.

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

## Migrate a cohort

Resolve and dry-run exact versions first:

```bash
farthershore plan list <business> --format json
farthershore plan migrate <business> <plan-key> \
  --from <version> --to <version|head> \
  --policy next_renewal --dry-run --format json
```

For a deadline, the exact timing form is:

```bash
farthershore plan migrate <business> <plan-key> \
  --from <version> --to <version|head> \
  --policy by_date --complete-by <full-ISO-8601-timestamp> \
  --dry-run --format json
```

Review resolved compiled plan IDs, cohort, timing, proration, and provider impact.
After approval, remove `--dry-run`, add a stable `--idempotency-key`, schedule
once, and record the batch ID. Scheduling is not convergence; verify customer
state at the selected transition time. Never automatically reverse a mistaken
batch.

## Replace customer-member roles

```bash
farthershore business rbac <business> --format json
farthershore consumer rbac assign <business> <subscriberId> <userExternalId> \
  --roles admin,analyst --format json
```

Assignment replaces the complete role set; `--roles ""` clears it. Role keys
must exist in the accepted repository-defined vocabulary. Compare the returned
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
