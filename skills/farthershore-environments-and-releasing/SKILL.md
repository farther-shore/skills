---
name: farthershore-environments-and-releasing
description: Use when validating managed repository changes, exercising preview personas, launching a first paid product, publishing or recovering exact artifacts.
---

# Take the reviewed product to an observed outcome

Read AGENTS.md and installed tool/package pins. Resolve business/organization,
principal, DRAFT versus ACTIVE state, managed repository, full commit SHA,
preview policy/environment and product shape. Builder-repo release rules differ
from the platform monorepo. Git selects artifacts; supported operations publish
and observe them. Preserve the user's scope and authorization for exact effects.

## Retrieve the current journey

Search the task and read the complete guide including prerequisites, failure
and recovery. Match source/package versions and inspect described methods,
types, permissions, preview/retry metadata or current CLI leaf help. Hosted MCP
search → describe → run/run_writes does not imply deployed availability;
describe already includes types. If search fails, use canonical
https://docs.farthershore.com/cookbook/preview-environment,
https://docs.farthershore.com/cookbook/release-production,
https://docs.farthershore.com/operate/apply-timeline and
https://docs.farthershore.com/get-started/quickstart, with index/corpora fallback
at https://docs.farthershore.com/llms.txt. Do not execute from excerpts, stale or
truncated guides; stop dependent launch/payment/credential changes if full
current prerequisites remain unavailable. Never silently switch environments.

## Managed repository and preview loop

1. Typecheck with the repository's actual checker, run `farthershore build`, then
   authenticated `farthershore validate` against the intended target. Inspect
   checked/skipped server/docs results; generated local validate aliases can be
   only a build. Validation is a dry-run, not activation or a promise of zero
   diagnostic writes. Invalid authored docs can block apply; absent docs are
   allowed, and warnings/notes differ from errors.
2. Review semantic/economic/subscriber and route-retirement impact, then push the
   coherent candidate. Inspect exact full-SHA check runs **and commit statuses**,
   Business SDK/Docs sticky feedback and impact report. Fix diagnostics and
   push corrections; mutable comments or old green checks are insufficient.
   Build, frontend, validate and apply are different verdicts; read descriptions
   and timeline for deferred/failed/superseded publication.
3. Inspect branch-prefix, pull-request or disabled preview policy before selecting
   or creating an environment. Existing admitted environment branches rebuild on
   compatible pushes; do not change policy merely to test. Wait for that
   environment's own contract and serving state before personas. Preview plans,
   grants/pricing and customer state are its own; origins may inherit production
   by slug. Bind isolated deployments/storage before writes requiring isolation.
4. Compatible pushes preserve personas, subscriptions, API keys and live usage.
   Reuse valid state after checking the new apply; incompatible changes can fail
   while prior state serves. Explicit destructive reset is a separate action.
   Select an existing persona or create the intended plan-bound owner, then
   member/product-role variants in that owned workspace. Keep builder, account
   and product-role authority distinct; never join an unrelated customer.
5. Use supported hosted persona login or a terminal-owned `frontend dev --live`
   / `frontend preview --live` session with current discovered flags. MCP does
   not run local servers, tunnels, browser processes or private lease operations.
   Keep bootstrap/rotation output, keys, handoffs, cookies and leases out of logs,
   app code and storage. CLI readiness/opened output is not observed sign-in.
   Check identity/org, sign-in/plan/core task, owner/member and product-role
   allowed/denied requests, org switching and usage/billing. Mock layout checks
   are narrower. Check provider-mode support; do not assume production personas.
6. Finish browser observations, close/logout, stop the local process and verify
   lease cleanup. Remove only owned temporary personas/environment when asked;
   check teardown and track external backend data separately. Localhost cookies
   can collide across ports, so switch personas sequentially or use separate
   profiles and recheck identity.

## First go-live and first payment

Confirm valid plan/rate limits, accepted contract and all declared backend targets
(default selected when several exist). An explicitly zero-backend hosted product
needs no artificial origin/token; an API/hybrid product must complete
[backend verification](../farthershore-backends-and-runtime/SKILL.md).
A separate hosted frontend needs its own artifact and browser evidence.

Resolve payment prerequisites with the responsible human: connected account,
charges enabled, active card-payments capability and active Tax setup are
production gates even for free-only publication. A connection ID is insufficient;
platform-side payment configuration faults need an operator, not repeated
customer onboarding. Do not invent tax/legal choices or automate human consent.
Documentation syntax, legal documents/versions, browser consent and server-side
legal authorization are separate facts; missing Terms/Privacy is not an invented
universal publish blocker.

First DRAFT `business publish` may be previewed where supported, then initiated
once within approval. It creates a release and may return PENDING while business
is still DRAFT. Observe asynchronous acceptance/publication rather than declare
it live. For code-managed ACTIVE businesses, repeat publish (including dry-run)
is guarded; use a reviewed published non-draft/non-prerelease GitHub Release for
an economic or unknown change, pinned to the exact immutable commit. Bare tags,
merges and green builds are not activation. Provably non-economic default-branch
changes may auto-publish; DRAFT default pushes only stage initial definition.
Never repoint release tags.

Review concrete SHA/version, terms/customer impact, production action and
recovery within authorization. Verify expected tag/full SHA, successful publish
phase, active contract/live state, conditional frontend artifact and actual
backend response separately. Then verify sign-in, intended organization and
self-serve plan, checkout outcome, durable subscription/access and purchased
capability. Metered/prepaid paths additionally need usage/funding evidence.
Use preview/test-provider billing first; persona issuance alone is not checkout
or provider fulfillment. Never initiate a real purchase solely to complete a
checklist. Real charges require explicit authorization covering the purchase.

Report release serving, checkout created, preview payment simulated, authorized
real payment observed, subscription active, usage/balance correct and
settlement/payout observed as separate milestones. A browser checkout return,
zero-price activation or pending refill proves no collected payment/funds.

## Recover the right layer

After uncertain publish/checkout/rollback, reconcile IDs and current state before
repeat. Pending acceptance/in-flight work means observe existing execution.
Keep sanitized target, full SHA/tag, apply/build/workflow/request identifiers and
structured errors. Do not repair via SQL, private APIs or verification bypass.

Contract recovery uses reviewed forward/revert source plus a new release; an
eligible business rollback is a workflow snapshot, not a Git revert. Frontend
rollback changes only a same-target succeeded artifact: production can pin the
pointer and prevent later autoactivation, while preview rollback is unpinned
and temporary. Verify active artifact and pin after recovery and after the
forward fix; do not assume a new release cleared the pin. Neither rollback
undoes payments, settled usage or customer commercial pins. Accepted/enqueued
work is not convergence. Escalate platform-owned publication/provider failure
with evidence when the supported surface cannot repair it.
