---
name: farthershore-building-uis
description: Use when building customer-facing application surfaces for a FartherShore business.
---

# Building the application

Target the installed `@farthershore/farthershore-js` version; this guide
describes 0.28.x. Match docs to the dependency pin before selecting APIs.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree frontend-sdk --format json
farthershore docs read frontend/overview --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Use:

- https://docs.farthershore.com/frontend/overview
- https://docs.farthershore.com/frontend/auth
- https://docs.farthershore.com/frontend/components
- https://docs.farthershore.com/frontend/access-aware-ui
- https://docs.farthershore.com/frontend/permission-gates
- https://docs.farthershore.com/frontend/custom-components
- https://docs.farthershore.com/frontend/variables
- https://docs.farthershore.com/reference/frontend-sdk

**The goal is to build ANY SaaS application that needs plans and metering.** Not
API products — _any_ SaaS. If it sells access in tiers and counts something, it
belongs here.

FartherShore gives you **managed components**, not a prescribed application. The
components own the parts that are genuinely hard and genuinely dangerous to get
wrong — authentication, entitlement, metering, billing. Everything else — layout,
information architecture, navigation, visual language, what the product even _is_
— is yours.

The metered thing does not have to be an API call. It can be seats, documents
processed, minutes transcribed, campaigns sent, rows synced, models trained,
storage held, tickets resolved. Wherever a plan grants access and a dimension is
counted, this platform is the substrate — and the application on top can look
like anything.

Concretely, all of these are the same primitives with different applications:

| Product            | Primary object | Metered dimension        |
| ------------------ | -------------- | ------------------------ |
| Transcription tool | Recordings     | Minutes                  |
| CRM                | Contacts       | Seats + enriched records |
| Analytics          | Dashboards     | Events ingested          |
| Email platform     | Campaigns      | Sends                    |
| Doc processor      | Documents      | Pages parsed             |

Counted resources such as seats are inventory caps, not automatically per-seat
charges. Usage pricing is a separate meter/catalog decision.

None of them should look like a developer portal.

## Start from the requested product

Design the application from the user's goals and primary objects. Do not infer a
default information architecture from the platform. A Dashboard/Usage/API
Keys/Billing sidebar is not a product brief, and repeated generic layouts are
not a substitute for product design.

So:

- A team-analytics product should be organised around **teams and reports**, not
  around "API Keys".
- A document-workflow product should be organised around **documents**, with
  billing tucked into settings where it belongs.
- An internal tool may have **no marketing surface, no plan picker, no docs** at
  all.

Ask what the product IS, design for that, and reach for a managed component only
where it earns its place.

## What you get for free — and must not rebuild

Each of these is a real boundary, not a widget. Reimplementing one means
reimplementing a security or billing control.

| Concern                            | Component / hook                                                      | The guarantee                                                                               |
| ---------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Sign-in, session, signed-out state | `<FartherShoreRoot>`, `useFsAuth()`                                   | Session is single-sourced; `/me` is the authority on signed-in state                        |
| Plans + checkout                   | plan/pricing components                                               | Prices come from the compiled plan — never hand-typed, never drift from what is enforced    |
| API keys                           | `<ApiKeysPanel>`, `useApiKeys()`                                      | Mint/revoke against the real key service; secrets shown once                                |
| Usage                              | `useUsage()`, usage card                                              | Server-observed usage with `exact` and `billingBasis`; label bounded samples as approximate |
| Billing                            | billing components                                                    | Subscription state, cancel/restore, credit surfaces                                         |
| Docs                               | product-docs components                                               | Rendered from the published release                                                         |
| Entitlement in the UI              | `useEntitlements()`, `useResourceLimitUsage()`, `useRouteRateLimit()` | Reflects the plan actually granted and the latest observed route budget                     |

**The frontend is never an authorization boundary.** Hiding a button is a
courtesy; the gateway is what enforces. Never gate on client state and assume
you are safe.

## Composing, not accepting

Prefer the **hooks** when you want your own presentation, and the **components**
when the default presentation is fine:

```tsx
import { useResourceLimitUsage } from "@farthershore/farthershore-js/react";

// Your layout, your language, our guarantees.
function Seats() {
  const { data: limits, isLoading, error } = useResourceLimitUsage();
  if (isLoading) return <p>Loading capacity…</p>;
  if (error) return <p>Capacity unavailable.</p>;
  const seats = limits?.seats;
  if (!seats) return null;
  return (
    <YourCard title="Seats in use">
      <YourMeter value={seats.current} max={seats.limit} />
    </YourCard>
  );
}
```

The hook gives you observed platform data; the markup is yours. Preserve
loading, error, missing-data and exactness states. Do not turn an unavailable
count into a factual zero or describe a sampled usage result as settled billing.

Customer money comes from `useBillPreview()` / the server bill-preview API.
Honor `transparent` versus `opaque` disclosure; opaque responses intentionally
omit monetary detail. Do not recompute a bill from usage charts, multiply local
rates, or coerce decimal-string nanodollars into floating-point arithmetic.

## Empty states are a design decision

A managed component that has nothing to say should render **nothing** — not a
titled card around "No data". Most plans declare no resource limits; most
products have no credit balance. A panel that exists only to say it is empty
costs the reader attention and teaches them nothing.

The same applies to actions: **never offer a control that cannot do anything.**
An "upgrade to the latest plan" button on a plan with no newer version is a
no-op the user can only discover by clicking.

## Before you build

1. **Ask what the product is.** "A SaaS app" is not a brief. What is the primary
   object — documents, teams, campaigns, runs? The IA follows from that.
2. **Choose the surfaces it needs.** Not every product needs docs, a plan
   picker, or a public marketing page.
3. **Design the layout yourself.** Then place managed components inside it.
4. **Never rebuild** anything in the table above.

## Do not

- Infer the product's layout from generic platform controls.
- Rebuild auth, key minting, usage math, or billing — you will get them subtly
  wrong, and they are the parts that cost real money.
- Hand-type a price. It will drift from the compiled plan that is actually
  enforced.
- Gate access on client state.
- Render an empty shell, or an action that cannot act.

Read [farthershore-quickstart](../farthershore-quickstart/SKILL.md) for getting a
business live, and
[farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md)
for what the plan surfaces actually mean.
