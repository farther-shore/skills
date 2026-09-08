---
name: farthershore-plans-and-metering
description: Use when designing or changing plans, pricing catalogs, funding, trials, spend controls, economic agreements, or metering for a FartherShore business.
---

# Commerce and measurement

Target the repository's installed Business SDK version; this guide describes
3.2.x. Money-impacting changes need the user's approval of the affected
customers, environment, terms, and timing before publication or application.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree commerce --format json
farthershore docs read define/plans --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Read https://docs.farthershore.com/define/plans and
https://docs.farthershore.com/define/meters. For this task, also read the relevant
pricing, funding, admission, or agreement page:

- https://docs.farthershore.com/reference/pricing-catalogs
- https://docs.farthershore.com/reference/funding-and-allowances
- https://docs.farthershore.com/reference/monetary-admission
- https://docs.farthershore.com/reference/economic-agreements
- https://docs.farthershore.com/monetize/plan-changes

## Choose each control independently

Every plan declares `kind: fs.plan.kind.free | flat | usage | prepaid | hybrid |
trial | custom`. The compiler validates the allowed combination; it does not
infer a kind from money fields.

| Concern                     | Source of truth                                             |
| --------------------------- | ----------------------------------------------------------- |
| What can be called          | Route/group refs under grants                               |
| Structural bounds           | Typed rate/resource limits and per-request capacity         |
| What was measured           | Meter measures/dimensions and explicit route bindings       |
| How measurements are priced | `fs.pricing` catalog and a plan's `usagePricing` binding    |
| What funds usage            | Included, prepaid, promo, or referral funding buckets       |
| What happens at exhaustion  | Plan spend policy and bounded monetary admission            |
| Negotiated terms            | Confirm-gated economic agreement, not a public catalog edit |

Use SDK constructors for money, rates, kinds, funding and exhaustion policies.
`fs.money.usd(n)` takes major dollars; use `fs.rate.per(...)` or
`perMillion(...)` for sub-cent rates. Monetary wire values ending in
`Nanos` are decimal strings; do not turn them into JavaScript floating-point
arithmetic.

A meter declaration, price, or limit does not bind measurements to a route.
Attach fixed costs and dynamic reports explicitly; actual backend work reports
through `ctx.report`. Metered admission must bound the work before forwarding;
do not treat an estimate as final usage. Use
[farthershore-backends-and-runtime](../farthershore-backends-and-runtime/SKILL.md).

## Prices, pins, and customer impact

Recurring-price pins and usage-pricing bindings are different.
`pricing.current()` follows activated catalogs forward even for existing
subscriptions. `fixedVersion(n)` does not. Agreement-bound pricing follows
its terms and amendment rules. No release retroactively rerates admitted work.

Read [change safety](references/experiments-and-migration.md) before release.
A build, release, checkout, payment, funding issuance, and customer migration
are separate outcomes. Verify each relevant state; do not promise that a
successful repository build changed an existing customer's commercial pins.

Use server bill-preview results for customer money displays and preserve opaque
disclosure. Usage summaries can be approximate and are not a locally
reconstructable invoice.
