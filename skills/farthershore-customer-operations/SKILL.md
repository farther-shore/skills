---
name: farthershore-customer-operations
description: Use when inspecting or changing live customer or builder membership, access, credentials, subscriptions, agreements, proposals, automation, agents or notifications.
---

# Apply the exact authorized effect once

Resolve organization, immutable business ID, environment, caller and exact
subject before mutation. Builder organization membership, subscriber account
roles, product roles and runtime identities are distinct authority boundaries.
Customer state, credentials, assignments, promos and agreements are operational;
public plans/grants/pricing/vocabulary remain `business/` changes.

## Retrieve the owning operation guide

Search the task, read its full guide with prerequisites/failure recovery and
match installed CLI/package/source versions. Describe methods/types, permission,
side-effect, preview and retry metadata; plain CLI uses current leaf help.
If search is unavailable, read canonical
https://docs.farthershore.com/operate/customer-operations,
https://docs.farthershore.com/agents/platform-agent,
https://docs.farthershore.com/agents/automation or
https://docs.farthershore.com/operate/notifications; index/corpora fallback is
https://docs.farthershore.com/llms.txt. Excerpts/stale/truncated instructions do
not establish prerequisites. Stop dependent authority, money or destructive
changes if current guidance is unavailable. Discover actual installed MCP/CLI
capabilities; no private API workaround or silent environment switch.

Business deletion, organization deletion, organization ownership transfer and
Stripe disconnect are human-only. Hand them to the responsible human through
the currently documented human-only flow; machine CLI credentials, CLI code mode and hosted
MCP cannot perform them. Chat approval or MCP confirmation does not change this
boundary. Do not try raw calls or another agent credential to bypass it.

## Inspect, preview, apply and read back

Read current subject state and relevant policy/catalog, including pagination.
Resolve returned immutable IDs rather than substituting an email, subscription
ID or owner organization for a subscriber. A capped list's absence is not proof
of deletion. Diagnose the first failing access/payment boundary before repair;
repository defects return to [business-sdk](../farthershore-business-sdk/SKILL.md).

Review complete replacement sets, audience, privilege/economic impact and timing
within the user's authorization. Role assignment can replace the whole set;
empty can clear it, and stale keys grant nothing. Do not add authority to make a
request succeed. Preview only when supported; proposal simulation, approval,
application and downstream convergence are separate states. Apply the intended
effect once, retain receipt/audit/request IDs, then obtain a fresh narrow read
and actual downstream proof. A write response is point-in-time state.

For `OUTCOME_UNKNOWN`, follow `retry.reconcile` before repeating. Inspect
`retry.kind`, enforcement and response semantics; no automatic retry means no
write loop. Repeat only when current evidence shows the effect absent and still
wanted; ambiguous outcomes need direction. Webhook tests and messages have real
external effects. Secret issuance/rotation returns once; use secure delivery,
not argv/chat/logs. Hosted MCP redacts one-time secrets even when approved: use
a supported secure CLI/human handoff when the workload needs the actual value.

Containment and removal differ. Customer block revokes keys and currently has
no CLI unblock; removal has no restore command. Confirm exact destructive scope
and preserve audit evidence before proceeding. A suspended control-plane row
is insufficient containment: verify the old credential denied at the gateway
after propagation. Do not promise reversible pauses or successful edge revocation
from a database/status write alone.

For commercial exceptions, preview exact subject/terms and read resulting pins.
Lineage migrate-latest is not generalized commercial rebinding; do not invent
batch migration or claim publication migrated every customer. Current catalogs,
recurring pins and agreements differ. Promo edits can replace provider coupon
state: review complete economic spec and target plans, not only changed fields.
See https://docs.farthershore.com/reference/commercial-releases.

## Govern actors and customer-facing effects

The local coding agent, platform Operator, deterministic automation and customer
approver do not inherit each other's authority. Operator enablement is not
customer messaging permission. Public contract changes are a coding handoff.
Automation uses a closed trigger/condition/action grammar; retrieve current
schemas. Start new rules explicitly disabled for review because creation can
default enabled. Inspect stored scope and effects before enabling.

Automation-created RBAC ChangeSets are proposer-only: human approval and
application remain separate. Do not call a preview, approval, queued execution
or Bulletin acknowledgment applied. Read final proposal/run and customer state.
An internal notification is not delivered email; audience, consent/opt-outs and
permitted transactional/product-update classes still govern outward delivery.
Never use marketing classes or bypass consent. Preserve authorized scope.

Disabling a rule/Operator prevents future work as documented, not already-started
messages, proposals or economic effects. Inspect in-flight state before claiming
stopped/undone. Acknowledge/resolve Bulletin work only after its evidence and
handoff outcome are reviewed. Authorization held by another principal is a
handoff, not permission to emulate it.

## Prove the result

Use [environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)
for preview personas and secure hosted/local sign-in. Reuse compatible personas;
account owner success is insufficient product-role proof. Verify nonowner
allowed/denied actions, exact customer/member/organization scope and actual
gateway/backend effect after propagation. Audit records establish requested
actor/decision, not current state or completion. Report accepted state,
asynchronous convergence and observable outcome separately; escalate an
unsupported platform/provider repair with sanitized evidence.
