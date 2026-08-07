---
name: farthershore-plans-and-metering
description: Use when designing or changing plans, pricing, limits, quotas, or usage-based metering for a FartherShore business.
---

# Plans, limits, and metering

A plan answers three questions: **what can they call** (`grants`), **how much
can they consume** (`limits` / `meters`), and **what does it cost** (`price`).

## Every plan needs a control on consumption

A plan must either **ration** or **bill**. One of:

- a `limits[]` rate rule — ration it, or
- a **priced** meter — bill it.

The rule exists because an unlimited flat-fee plan is unbounded liability
against your own upstream: a runaway consumer costs you money and you have no
lever. Usage-based billing does not have that problem — consumption *is* the
lever, because every extra unit is revenue.

An **unpriced** meter does **not** satisfy this. A meter with no rate, or a bare
`included_units` pool with nothing charged beyond it, is *tracking*, not
billing: past the pool, consumption is both unbounded and unbilled. That still
needs a limit.

> Requires business SDK **≥ 1.2.0**. On earlier versions every plan needed a
> literal `limits[]`, so pay-as-you-go was not expressible.

## The four shapes

### Free — rationed

```ts
fs.plan("free", {
  name: "Free",
  price: fs.free(),
  grants: [publicRoutes],
  limits: [requests.perMinute(60)],   // required: free + unlimited is a liability
});
```

### Flat subscription — rationed

```ts
fs.plan("pro", {
  name: "Pro",
  price: fs.money.usd(29).monthly(),   // major units — 29 = $29.00
  grants: [everything],
  limits: [requests.perMinute(6_000)],
});
```

### Pay-as-you-go — billed, no rate limit

```ts
const tokens = fs.meter("tokens", { display: "Tokens", unit: "token" });
fs.meterRoutes(generate, { reports: [tokens] });   // ← without this it never bills

fs.plan("payg", {
  name: "Pay as you go",
  price: fs.money.usd(0).monthly(),    // no base fee
  meters: [{
    dimension: tokens,
    kind: "linear",
    price_per_unit_micros: 2000,       // $0.002 per token
    included_units: 10_000,            // first 10k free each cycle
  }],
  grants: [generate],
  // no limits — the meter is the control
});
```

### Hybrid — base fee plus overage

Same as above but with a real `price` and a smaller `included_units`. This is
the most common commercial shape.

## Pricing units — get these right

| Field | Unit | Example |
| --- | --- | --- |
| `fs.money.usd(n)` | **major** units (dollars) | `usd(29)` = $29.00 |
| `price_per_unit_micros` | **micros** (1e-6 of a unit) | `2000` = $0.002 |
| `included_units` | meter units | `10_000` tokens |

Micros exist so sub-cent rates are exact. `$0.002` is `2000`, not `0.002`.

## Tiered pricing

```ts
meters: [{
  dimension: tokens,
  tiered: {
    strategy: "graduated",   // or "volume"
    tiers: [
      { up_to: 100_000, price_per_unit_micros: 2000 },
      { up_to: null,    price_per_unit_micros: 1000 },  // null = final open tier
    ],
  },
}]
```

- **`graduated`** — each tier's rate applies only to units *within* that
  bracket. Bill = Σ (units in tier × tier rate).
- **`volume`** — the tier the **total** falls into sets one rate applied to
  **every** unit.

They differ a lot at scale. `tiered` and a non-zero `price_per_unit_micros` are
mutually exclusive. Model a free pool as a zero-priced first tier rather than
combining `tiered` with `included_units`.

## Metering only works if three things line up

A dimension bills **only** when all three are true. Miss one and it silently
does nothing.

1. **The meter is declared** — `fs.meter("tokens", …)`, or `fs.requests()`.
2. **The route reports it** — `fs.meterRoutes(route, { reports: [tokens] })`.
   `fs.requests()` auto-attaches; **custom meters do not**.
3. **The upstream reports units** — a **signed** metering report, using the
   backend's runtime token. See
   [farthershore-backends-and-tokens](../farthershore-backends-and-tokens/SKILL.md).

If units never appear in `farthershore usage summary`, walk those three in
order. The most common miss is (2), and the second is (3) with the wrong
runtime token — the gateway rejects the unverifiable report and silently falls
back to route defaults, so requests still count and your dimension does not.

## Limits

```ts
requests.perMinute(600)
requests.perHour(10_000)
requests.perDay(100_000)
```

Limits are **enforced at the edge** — a plan over its limit is denied before it
reaches your upstream, which is the point: your origin never sees the traffic.

## Changing a live plan

Prices, limits, grants, and meters are **contract**. Once the business is live
and repo-linked, the API/CLI refuses those writes with `MANAGED_BY_CODE` —
that is the platform telling you to edit `business/` and push, not to retry.

Existing subscribers are **pinned to the compiled plan they bought**. Editing a
plan does not silently move them; it mints a new version and the platform
decides who moves and when. Preview it before you ship:

```bash
farthershore plan diff <businessId> --format json
```

Read [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)
for how a change reaches existing customers.
Before a subscriber-impacting plan release, read the
[plan change safety reference](references/experiments-and-migration.md).
