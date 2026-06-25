---
name: farthershore-plans-and-billing
description: Use when changing pricing, plans, grants, trials, spend caps, or meters on a FartherShore product; running A/B price experiments; or migrating subscribers between plans. Plans are contract state — change them in product.config.ts and push, not via the API. These changes hit real subscribers, so they are confirm-gated.
metadata:
  version: 1.0.0
---

# Plans & billing

Plans, pricing, meters, grants, trials, and spend caps are **contract** state.
Once a product is live, the API/CLI/MCP will **reject** plan writes with
`MANAGED_BY_CODE` — you change them by editing `product/product.config.ts` and
pushing (see [farthershore-product-as-code](../farthershore-product-as-code/SKILL.md)).
`farthershore plan list` is for **reading**.

> **These changes affect real subscribers and real money.** Every pricing or
> plan-shape change is a **confirm** action: present the change and its
> subscriber impact, and get explicit human sign-off before pushing/releasing it.

## The plan spec

A plan is defined by a small set of knobs: a recurring fee, grants (credits),
a trial, an optional monthly spend cap, metered dimensions, and rate limits.
See [references/plan-spec.md](references/plan-spec.md) for the fields, the
free-vs-paid revenue rule, and how meters price usage.

## Safe vs unsafe changes (subscriber impact)

- **Raising price** — allowed; existing subscribers move to the new price at
  their **next billing cycle**, not immediately.
- **Increasing a limit's capacity** — allowed; applies immediately.
- **Adding** a plan / meter / grant — allowed.
- **Decreasing a limit's capacity or removing a limit** — **blocked** by the
  compiler. To reduce what a plan offers, create a *new* plan and migrate
  subscribers rather than shrinking the existing one.
- A plan with no revenue source is rejected unless marked `free`.

## Publishing a paid product

Publishing a paid plan requires the product's **Stripe** connection to be
connected and verified. If you hit `STRIPE_NOT_CONNECTED` / `STRIPE_NOT_VERIFIED`,
that is a human step (browser) — see
[farthershore-onboarding](../farthershore-onboarding/SKILL.md). Surface it and
wait; don't try to work around it.

## Price experiments and migrating subscribers

Running an A/B price variant, promoting/rolling one back, or moving subscribers
between plans has real revenue impact and specific mechanics. See
[references/experiments-and-migration.md](references/experiments-and-migration.md).
Prefer the code path (edit the manifest + push) over imperative API calls; keep
the emergency API path for when a variant is actively hurting revenue.

## Autonomy

- **auto**: reading plans/usage; modelling a proposed change locally with
  `farthershore build`.
- **confirm**: any change to pricing, grants, trials, caps, or plan shape on a
  live product; promoting/rolling back a variant; migrating subscribers.
- **escalate**: billing looks wrong in a way you can't explain from plan
  config (e.g. subscribers not activating after payment) — that's likely
  platform-side; see
  [farthershore-operating-and-escalation](../farthershore-operating-and-escalation/SKILL.md).
