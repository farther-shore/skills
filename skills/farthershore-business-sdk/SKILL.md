---
name: farthershore-business-sdk
description: Use when writing or editing the `business/` program — the 15 functional verbs of @farthershore/business, the branded-ref model that makes cross-references compile-time checked, folder discovery and registry sealing, and the authoring mistakes that only fail at build time. Load whenever you open a file under business/, see `import * as fs from "@farthershore/business"`, or need to add a route, plan, meter, group, or backend.
metadata:
  version: 2.0.0
---

# The Business-as-Code authoring surface

`@farthershore/business` compiles a TypeScript program into a deterministic
**Manifest IR**. The platform consumes the IR — never your source. What you
write here IS the contract: plans, prices, routes, limits.

**Current: 1.2.0.** Check the repo's `business/package.json` pin; behaviour
differs across majors and the pin is what the build actually uses.

## There are no decorators

Decorators and the `define*` helpers were **deleted in 1.0.0**. There is no
`@Business` class and no `experimentalDecorators` anywhere. If you find a
snippet using them, it predates 1.0.0 — discard it.

The surface is **15 functional verbs**:

`business` · `route` · `plan` · `meter` · `requests` · `meterRoutes` ·
`resource` · `backend` · `frontendIntegration` · `group` · `rbac` ·
`money` · `free` · `surfaces` · `scope`

## The shape of a program

```ts
import * as fs from "@farthershore/business";

const requests = fs.requests();

const echo = fs.route("/v1/echo", { get: {}, post: {} });
const cost = fs.route("/v1/cost", { get: {} });
const everything = fs.group("everything", [echo, cost]);

fs.plan("free", {
  name: "Free",
  price: fs.free(),
  grants: [echo],
  limits: [requests.perMinute(60)],
});

fs.plan("pro", {
  name: "Pro",
  price: fs.money.usd(29).monthly(),
  grants: [everything],
  limits: [requests.perMinute(6_000)],
});

export default fs.business({
  visibility: "public",
  authHeader: "x-api-key",
  upstreamAuth: { type: "none" },
  billOn4xx: false,
});
```

Note what is NOT here: no display name, no description, no icon. **Presentation
is platform-owned** — set it with `farthershore business update`. It does not
belong in the repo.

## Refs, not strings

Every declaration returns an **immutable branded ref**, and cross-references use
the ref:

```ts
const echo = fs.route("/v1/echo", { get: {} });
fs.plan("free", { grants: [echo] });          // ✅ compile-checked
fs.plan("free", { grants: ["/v1/echo"] });    // ❌ type error
```

An unmatched reference is a **compile error, not a silent mismatch**. Refs are
forgery-proof at runtime (module-local `WeakSet`s), so a hand-rolled
`{ kind: "route" }` object is rejected rather than trusted. Never construct one
by hand; always hold the value the verb returned.

## Folder discovery and sealing

The compiler imports **every module under `business/`** and compiles the single
`fs.business()` result that is default-exported. Filenames are irrelevant — the
starter is `business/index.ts`, but you may split routes, plans, and meters into
sibling files and import them.

`fs.business()` **seals the registry**. Any declaration evaluated after it
throws. In practice: keep `export default fs.business({...})` last, and never
declare inside a lazily-evaluated callback.

## The verbs

| Verb | Returns | Notes |
| --- | --- | --- |
| `fs.requests(opts?)` | `MeterRef` | The built-in request meter. **Auto-attaches to every route.** |
| `fs.meter(id, opts)` | `MeterRef` | A custom dimension (`{ display, unit }`). **Does NOT auto-attach — see below.** |
| `fs.meterRoutes(target, opts)` | `void` | Declares which meters a route **reports**. |
| `fs.route(path, ops)` | `RouteRef` | `ops` is `{ get: {}, post: {}, … }` — exact method/path pairs, never a cross-product. |
| `fs.group(id, members)` | `GroupRef` | Bundle routes/groups so a plan grants one thing. |
| `fs.plan(id, opts)` | `PlanRef` | `{ name, price, grants, limits, meters, description }`. |
| `fs.money.usd(n).monthly()` | price | Also `.yearly()`. `n` is **major units** (dollars). |
| `fs.free()` | price | A free plan still needs a hard limit. |
| `fs.resource(id, opts?)` | `ResourceRef` | Counted resources (seats, projects). |
| `fs.backend(id, opts?)` | `BackendRef` | Declare a logical upstream. |
| `fs.frontendIntegration(id, opts)` | ref | Edge-injected third-party credentials. |
| `fs.rbac(enabled?)` | `void` | Turn on Managed RBAC. |
| `fs.surfaces` / `fs.scope` | — | Route audience + scoping. |
| `fs.business(opts?)` | sealed | **Last statement. Default-export it.** |

## The mistake that costs a release cycle

**`fs.requests()` auto-attaches to routes. `fs.meter()` does not.**

Pricing a custom meter in a plan is *not* enough to bill it. Without
`fs.meterRoutes`, the route compiles with **no metering block at all**, the
gateway discards the dimension your upstream reported, and the priced meter
**silently never bills** — requests get counted, your meter does not.

```ts
const tokens = fs.meter("tokens", { display: "Tokens", unit: "token" });
const generate = fs.route("/v1/generate", { post: {} });

fs.meterRoutes(generate, { reports: [tokens] });   // ← REQUIRED

fs.plan("payg", {
  price: fs.money.usd(0).monthly(),
  meters: [{ dimension: tokens, kind: "linear", price_per_unit_micros: 2000 }],
  grants: [generate],
});
```

Verify it landed: build the IR and confirm the route carries
`metering.reports: ["tokens"]`. If the route object is just `{ match: {...} }`,
the meter is not wired.

## Failures you will actually hit

| Message | Cause |
| --- | --- |
| `plan "x" meter 0 must be an SDK-created meter ref` | You passed a string where a `MeterRef` belongs. |
| `Free plans must include at least one hard enforced limit` | `fs.free()` with no `limits`. An unlimited free plan is unbounded liability. |
| `PLAN_RATE_LIMIT_REQUIRED` | No `limits[]` **and** no priced meter. Since 1.2.0 a priced meter satisfies this; an unpriced one or a bare `included_units` pool does not. |
| `ROUTE_METER_NOT_ALLOWED_BY_BACKEND` | A backend's `meters` allowlist must include every meter its routes report — including the inherited `requests`. |
| `… is from registry generation N, not M` | Two copies of `@farthershore/business` loaded. Usually a module outside `business/` with its own `node_modules`. |
| `cannot declare after business() sealed the registry` | A declaration ran after `fs.business()`. |

## Determinism

The IR is content-hashed and the build runs **twice**, failing if `irHash`
differs. Never use `Date.now()`, `Math.random()`, environment reads, or
filesystem order in the program. Same source must produce identical bytes.

## Before you push

```bash
farthershore validate --format json   # exactly what the PR check runs
farthershore build --format json
```

`fs.business()` constructing successfully is a weaker guarantee than `validate`
— build-completeness rules live in the build worker, not in the constructor.
