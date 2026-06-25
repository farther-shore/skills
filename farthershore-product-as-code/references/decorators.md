# Product SDK decorators (reference)

`product/product.config.ts` exports a single default class decorated with
`@Product`. Members are declared with decorators from `@farthershore/product`.
Each decorator declares one part of the product; the `@Product` class decorator
finalizes them into the Manifest IR.

> This is an orientation reference. Always check the installed
> `@farthershore/product` version's own types/README for the authoritative,
> current decorator signatures and options before relying on a specific field.

## Shape

```ts
import { Product, Surface, Meter, Requests, Feature, Plan } from "@farthershore/product";

@Product({
  name: "croncloud",                 // stable identifier (contract)
  origin: "https://api.example.com", // your upstream business logic
  displayName: "CronCloud",          // presentation
  description: "Managed cron jobs",
})
export default class CronCloud {
  @Surface("api") api!: unknown;            // which surfaces the product exposes
  @Surface("frontend") frontend!: unknown;

  @Requests() requests!: unknown;           // the platform request meter
  @Meter("tokens_used", { unit: "token" }) tokensUsed!: unknown;  // a value meter

  @Feature("runs", {                        // a feature = grouped routes + metering
    routes: { "POST /v1/runs": { reports: "tokens_used" } },
  })
  runs!: unknown;

  @Plan("starter", {                        // see farthershore-plans-and-billing
    name: "Starter",
    price: { amount: 2900, currency: "usd", interval: "month" },
    limits: { requests: { rate: 600, interval: "minute", enforcement: "enforce" } },
  })
  starter!: unknown;
}
```

## Decorator families

- **`@Product`** — identity + origin + presentation. `name`/`origin` are contract.
- **`@Surface`** — which surfaces exist (e.g. `api`, `frontend`, `docs`).
- **`@Requests`** — the built-in request meter.
- **`@Meter`** — a value meter (unit, optional estimate) for usage-based pricing.
- **`@Feature`** — a named group of gateway routes, each optionally reporting to
  a meter. Routes are keyed `"<METHOD> /path"`.
- **`@Plan`** — a pricing plan; see the plans skill for the full plan spec.
- **`@Capability` / `@Entitlement`** — reusable access/feature-gate bundles.
- **`@Policy`** — auth / rate-limit / custom policy layers.
- **`@Backend`** — declares a backend (see farthershore-backends-and-tokens).

## Rules

- Keep the module **pure** (no Date/random/network/IO) — builds must be
  deterministic.
- Route order is significant (first match wins at the gateway); collections are
  otherwise sorted deterministically.
- Every plan needs at least one rate limit and a revenue source (or `free`).
- Run `farthershore build` after every edit to validate before pushing.
