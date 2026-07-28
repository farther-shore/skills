---
name: farthershore-building-uis
description: Use when building the customer-facing application for a FartherShore business — the managed React components (auth, plans, checkout, API keys, usage, billing, docs), what each one guarantees so you never rebuild it, and the rule that matters most — the scaffolded template is ONE example, not the product. Load whenever the task is "build the UI", "make a SaaS app", "design the dashboard/portal", or you are about to accept the starter layout as the answer.
metadata:
  version: 1.0.0
---

# Building the application

**The goal is to build ANY SaaS application that needs plans and metering.** Not
API products — *any* SaaS. If it sells access in tiers and counts something, it
belongs here.

FartherShore gives you **managed components**, not a prescribed application. The
components own the parts that are genuinely hard and genuinely dangerous to get
wrong — authentication, entitlement, metering, billing. Everything else — layout,
information architecture, navigation, visual language, what the product even *is*
— is yours.

The metered thing does not have to be an API call. It can be seats, documents
processed, minutes transcribed, campaigns sent, rows synced, models trained,
storage held, tickets resolved. Wherever a plan grants access and a dimension is
counted, this platform is the substrate — and the application on top can look
like anything.

Concretely, all of these are the same primitives with different applications:

| Product | Primary object | Metered dimension |
| --- | --- | --- |
| Transcription tool | Recordings | Minutes |
| CRM | Contacts | Seats + enriched records |
| Analytics | Dashboards | Events ingested |
| Email platform | Campaigns | Sends |
| Doc processor | Documents | Pages parsed |

None of them should look like a developer portal.

## The rule that matters most

> **The scaffolded template is ONE example, not the product.**

A new business scaffolds with a working portal. That exists so a business is
callable on day one, not because it is the shape your application should take.
You are **free to delete all of it** and build whatever the user actually asked
for.

This matters because it is the single most common failure: an agent scaffolds,
sees a Dashboard/Usage/API-Keys/Billing sidebar, and treats that as the answer.
It then ships the same app every other builder shipped. **Every API product
looking identical is the problem this platform exists to solve** — do not
reintroduce it.

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

| Concern | Component / hook | The guarantee |
| --- | --- | --- |
| Sign-in, session, signed-out state | `<FartherShoreRoot>`, `useFsAuth()` | Session is single-sourced; `/me` is the authority on signed-in state |
| Plans + checkout | plan/pricing components | Prices come from the compiled plan — never hand-typed, never drift from what is enforced |
| API keys | `<ApiKeys>` | Mint/revoke against the real key service; secrets shown once |
| Usage | `useUsage()`, usage card | The SAME settled numbers the edge billed — not a client estimate |
| Billing | billing components | Subscription state, cancel/restore, credit surfaces |
| Docs | product-docs components | Rendered from the published release |
| Entitlement in the UI | `useLimits()`, limit boundaries | Reflects the plan actually granted |

**The frontend is never an authorization boundary.** Hiding a button is a
courtesy; the gateway is what enforces. Never gate on client state and assume
you are safe.

## Composing, not accepting

Prefer the **hooks** when you want your own presentation, and the **components**
when the default presentation is fine:

```tsx
// Your layout, your language, our guarantees.
function Seats() {
  const { data: usage } = useUsage();
  const { data: limits } = useLimits();
  return (
    <YourCard title="Seats in use">
      <YourMeter value={usage?.seats ?? 0} max={limits?.seats ?? 0} />
    </YourCard>
  );
}
```

That is the intended shape: the hook gives you settled, authoritative data; the
markup is entirely yours.

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

- Treat the starter layout as a requirement, or ship it barely modified.
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
