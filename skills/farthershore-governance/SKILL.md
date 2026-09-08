---
name: farthershore-governance
description: Use when configuring governed ChangeSets, platform Operator actions, event-driven automation, or customer-facing agent effects on FartherShore.
---

# Govern platform effects

Distinguish the local coding agent, platform Operator, deterministic automation
rule, and customer approver. Enabling one does not grant another's authority.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree agents --format json
farthershore docs read agents/automation --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Read https://docs.farthershore.com/agents/platform-agent and
https://docs.farthershore.com/operate/customer-operations. For automation, read
the Agents collection's event-driven automation guide and generated closed
rule schemas. For delivery, read
https://docs.farthershore.com/operate/notifications and
https://docs.farthershore.com/define/webhooks.

## Choose the actor and effect

The Operator analyzes a bounded business view and posts findings to the
Bulletin. Outward actions have separate gates, permissions, audience and
governance checks. Enabling the Operator alone does not enable customer
messaging. Repository-owned price, plan, route and meter changes are handoffs
to a coding agent, not imperative Operator writes.

Automation is a closed trigger-condition-action grammar, not arbitrary code.
All conditions are ANDed; use only allowed fields/operators. The create body
defaults to enabled, so explicitly start disabled when reviewing a rule.
Inspect its stored business/environment scope and effects before enabling.
An internal notification fact is not an email. Audience delivery additionally
checks consent and permitted message classes (`product_update` or
`transactional`, not marketing); never bypass opt-outs.

## A proposal is not an applied change

Use the supported proposal command to create, simulate and inspect a ChangeSet.
Preview stores a simulation; approval and application remain separate states.
Automation-created RBAC ChangeSets require human approval and application:
automation is proposer-only. Do not claim success from a draft,
preview, approval, or queued execution. Read final status and the affected
customer state.

Review the whole replacement permission set, audience and economic impact with
the user. Preserve their requested scope and obtain approval before relevant
customer-facing or privileged effects. Do not grant broader permissions merely
to make an action pass.

## Evidence and recovery

Retain rule, run, proposal, request, receipt and audit identifiers. Reconcile
uncertain actions before retrying with the original idempotency identity where
supported. Acknowledge or resolve Bulletin work only after reviewing its
evidence and actual handoff outcome.

Disabling a rule or Operator prevents future work as documented; it is not an
undo for messages, proposals, billing or already-started effects. Inspect
in-flight state before declaring everything stopped. If authorization or
required approval belongs to someone else, report that handoff rather than
emulating it through private APIs.
