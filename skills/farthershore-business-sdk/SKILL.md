---
name: farthershore-business-sdk
description: Use when writing or editing a `business/` program with `@farthershore/business`.
---

# The Business-as-Code authoring surface

`@farthershore/business` compiles a TypeScript program into a deterministic
contract artifact. What you write here is the business structure: routes,
features, plans, pricing, meters, limits, policies, and surfaces.

**Current: 2.0.0.** Check the repo's `business/package.json` pin; behaviour
differs across majors and the pin is what the build actually uses.

## Functional authoring surface

Use the current functional surface of **15 verbs**:

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

fs.meterRoutes(everything, { costs: [requests.fixed(1)] });

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

Only put fields accepted by the pinned SDK in `business/`. For a platform
operation with no code representation, confirm the current CLI surface with
`farthershore <command> --help`.

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
| `fs.requests(opts?)` | `MeterRef` | Declares the request meter. For per-call counting, explicitly attach `requests.fixed(1)` as a route cost. |
| `fs.meter(id, opts)` | `MeterRef` | Declares a custom dimension (`{ display, unit }`). Attach it explicitly. |
| `fs.meterRoutes(target, opts)` | `void` | Declares which meters a route **reports**. |
| `fs.route(path, ops)` | `RouteRef` | `ops` is `{ get: {}, post: {}, … }` — exact method/path pairs, never a cross-product. |
| `fs.group(id, members)` | `GroupRef` | Bundle routes/groups so a plan grants one thing. |
| `fs.plan(id, opts)` | `PlanRef` | `{ name, price, grants, limits, meters, description }`. |
| `fs.money.usd(n).monthly()` | price | Also `.yearly()`. `n` is **major units** (dollars). |
| `fs.free()` | price | A free plan still needs a hard limit. |
| `fs.resource(id, opts?)` | `ResourceRef` | Counted resources. Cap it with `ref.max(n)` **inside `limits[]`** — see below. |
| `fs.backend(id, opts?)` | `BackendRef` | Declare a logical upstream. |
| `fs.frontendIntegration(id, opts)` | ref | Edge-injected third-party credentials. |
| `fs.rbac(enabled?)` | `void` | Turn on Managed RBAC. |
| `fs.surfaces` / `fs.scope` | — | Route audience + scoping. |
| `fs.business(opts?)` | sealed | **Last statement. Default-export it.** |

## Counted resources are a LIMIT, not a plan field

`fs.resource()` returns a ref whose `.max(n)` builds a limit. It goes in
`limits[]` alongside rate limits — there is no `resourceLimits` plan option, and
passing one fails the build with `unsupported option "resourceLimits"`.

```ts
const seats = fs.resource("seats", { display: "Seats" });
fs.meterRoutes(everything, { costs: [requests.fixed(1)] });

fs.plan("team", {
  name: "Team",
  price: fs.money.usd(99).monthly(),
  grants: [everything],
  limits: [requests.perMinute(1_200), seats.max(10)],   // ← both are limits
});
```

The primitive is a GENERIC counted resource — there is nothing seat-specific in
the SDK. "Seats" is just an id. A flat price plus a cap gives seat-style
packaging without per-seat pricing; the price does not scale with the count.

## Declaring a meter does not attach it

In SDK 2.0, every meter is explicit. Calling `fs.requests()` or `fs.meter()`
only declares a ref; it does not attach that meter to any route.

Pricing a meter or using its limit helper in a plan is not enough to count it.
Without a route-local `reports`/`costs` binding or `fs.meterRoutes`, the route
compiles with no metering block for that dimension.

```ts
const requests = fs.requests();
const tokens = fs.meter("tokens", { display: "Tokens", unit: "token" });
const generate = fs.route("/v1/generate", { post: {} });

fs.meterRoutes(generate, {
  costs: [requests.fixed(1)],
  reports: [tokens],
});

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
| `PLAN_RATE_LIMIT_REQUIRED` | No `limits[]` **and** no priced meter. In SDK 2.0.0 a priced meter satisfies this; an unpriced one or a bare `included_units` pool does not. |
| `ROUTE_METER_NOT_ALLOWED_BY_BACKEND` | A backend's `meters` allowlist must include every meter explicitly attached to its routes, including `requests` when used. |
| `… is from registry generation N, not M` | Two copies of `@farthershore/business` loaded. Usually a module outside `business/` with its own `node_modules`. |
| `cannot declare after business() sealed the registry` | A declaration ran after `fs.business()`. |

## Determinism

The IR is content-hashed and the build runs **twice**, failing if `irHash`
differs. Never use `Date.now()`, `Math.random()`, environment reads, or
filesystem order in the program. Same source must produce identical bytes.

## Before you push

```bash
farthershore build --format json
```

`fs.business()` constructing successfully is a weaker guarantee than the build;
build-completeness rules do not all live in the constructor.
