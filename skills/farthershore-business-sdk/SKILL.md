---
name: farthershore-business-sdk
description: Use when authoring a business/ contract or designing plans, pricing, funding, metering, permissions or commercial changes.
---

# Define and verify the contract

Read AGENTS.md, installed `@farthershore/business` pin, accepted contract and
intended business/environment. Repository authoring owns public contractual
structure; live customer terms/assignments are separate operational state.

## Retrieve the relevant contract guide

Search for the task, read the full matching guide with prerequisites/recovery,
and compare its version with installed declarations before copying syntax.
Describe related operations/types and permissions before operational effects;
use current leaf help for plain CLI. Search excerpts are not instructions.
If installed search is unavailable, read canonical
https://docs.farthershore.com/define/business-class,
https://docs.farthershore.com/define/plans or
https://docs.farthershore.com/reference/business-sdk; use
https://docs.farthershore.com/llms.txt for index/corpora fallback. Stop dependent
economic/authority changes if current guidance cannot be retrieved; do not guess
or switch environments. The `farthershore` CLI is the only agent surface; use
its installed `docs search`/`docs read`, `operations list` and leaf help.

## Choose the offer's shape

Start from how customers will pay, then read the matching cookbook in full:

| Customers…                                  | Shape                        | Read                                                      |
| ------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| try free, then upgrade                      | freemium                     | https://docs.farthershore.com/cookbook/freemium           |
| pay monthly, plus usage above an allowance  | subscription plus overage    | https://docs.farthershore.com/cookbook/subscription-plus-overage |
| buy credits up front and spend them         | prepaid credits              | https://docs.farthershore.com/cookbook/prepaid-credits    |
| pay only for what they call                 | usage-based API              | https://docs.farthershore.com/cookbook/usage-based-api    |

https://docs.farthershore.com/get-started/product-shapes compares them, and
https://docs.farthershore.com/reference/funding-and-allowances separates what a
plan includes (`included`), what customers buy (`credits`, `topUp`) and how each
is spent. https://docs.farthershore.com/monetize/pricing-examples has complete
programs.

A trial needs one decision: what usage does it allow? By default a trial is
capped at the plan's included usage. Priced calls count at list price, and once
the included usage is spent, priced routes return `402 trial_allowance_exhausted`
until the trial ends or the customer starts the plan. Declare
`lifecycle: { trialDays, trialUsage: "unlimited" }` for free, uncapped usage
during the trial; choose it only when giving that usage away is intended. A
capped trial on a plan that includes nothing has nothing to cap, and the build
warns. Read https://docs.farthershore.com/cookbook/add-trial.

## Design independent controls

Resolve what customers may do, what is measured, how it is priced, what funds
usage, structural limits and exhaustion behavior separately. Every plan needs
an explicit supported kind and complete request-rate rule. A resource cap is
inventory, not per-seat pricing. A price/limit/meter declaration does not attach
measurement: bind fixed route costs and actual backend reports explicitly.
Bound monetary admission before forwarding work; estimates are not final usage.

Use deterministic functional declarations and immutable branded refs from one
SDK copy, never fabricated references. Discover all modules under `business/`
and provide one default-exported `fs.business()` result; import declaration
dependencies before sealing so direct and folder execution agree. Avoid clocks,
randomness, environment reads and network/filesystem discovery in declarations.

Choose typed money/rate/funding constructors from installed signatures. Money
wire fields ending in Nanos are decimal strings, not floating-point arithmetic.
Unit allowances and money funding are different; retrieve their display rules.
Action-inferred counts need matching release/delete behavior or an intended
concurrent cap becomes lifetime accumulation. Keep origins, presentation metadata,
variables, credentials and activation out of the contractual program.

## Review customer and permission impact

Recurring-price pins, `pricing.current()` activation, fixed-version catalogs and
customer-specific agreements have different forward effects. Existing customers
can follow current usage pricing without moving a recurring pin. Publication
does not retroactively rerate work or prove all subscriber pins migrated.
Retrieve https://docs.farthershore.com/monetize/plan-changes and
https://docs.farthershore.com/reference/commercial-releases before live economic
changes. General commercial rebinding is not promised by a lineage migration;
if the supported catalog cannot express it, hand off rather than use private
APIs. Review exact terms, affected customers, timing and recovery within the
user's authorization before activation. Customer money displays use server bill
preview and preserve opaque disclosure.

For RBAC, both business and subscriber-organization enablement gates matter.
Account roles, product-role assignments, plan grants, member/service identity
and backend tenant ownership are independent. Runtime write does not imply read
or extra verbs; owners/wildcard keys are insufficient least-privilege proof.
Empty ordinary key restrictions are not deny-all; SERVICE snapshots and live
member roles have different semantics. Read
https://docs.farthershore.com/define/team-rbac before implementation.

Permission vocabulary is business-wide: even preview group/verb removals can
strip grants across environments; recreation does not restore them. Review
roles, keys and UI gates before a vocabulary migration. Do not disable RBAC to
repair a denial. Verify existing credentials after propagation, including a
nonowner allowed/denied matrix and plan-denied/cross-tenant cases.

## Check the candidate and hand off

Run the repository's actual TypeScript checker separately from
`farthershore build`; execution alone is not typechecking. Inspect the build output
for grants, route measurement bindings, estimates and economic behavior. Run
`farthershore validate` against the intended target and inspect checked/skipped
server/docs results; a generated local validate alias may only build.

Use [backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md) for
actual measurement delivery and [environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)
for exact-head feedback, preview, approval and publication. Verify customer pins
and real allowed/denied requests after convergence. Report source/build proof
separately from serving, usage and customer-economic proof. Reconcile uncertain
writes before any repeat; keep secrets out of outputs.
