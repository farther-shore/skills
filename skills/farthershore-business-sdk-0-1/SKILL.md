---
name: farthershore-business-sdk-0-1
description: Use when editing a repo that depends on @farthershore/business 0.1.x, especially business/business.config.ts, @Business, @Plan, @Feature, @Meter, @Requests, @Backend, @Frontend, or @Workflow declarations.
metadata:
  version: 1.1.0
  sdk: "@farthershore/business"
  supportedSdk: "0.1.x"
---

# Business SDK 0.1.x

This skill is version-specific. Use it only when the repo's
`business/package.json` depends on `@farthershore/business` `0.1.x`.

## Contract file

Edit `business/business.config.ts` and modules it imports. Export one decorated
class:

```ts
import {
  Business,
  Requests,
  Meter,
  Feature,
  Plan,
} from "@farthershore/business";

@Business({ name: "weather-api", origin: "https://api.example.com" })
export default class WeatherApi {
  @Requests()
  requests!: unknown;

  @Meter("tokens_used", { display: "Tokens", unit: "token" })
  tokensUsed!: unknown;

  @Feature("forecast", {
    routes: { "GET /v1/forecast": { reports: "tokens_used" } },
  })
  forecast!: unknown;

  @Plan("starter", {
    name: "Starter",
    price: { amount: 2900, currency: "usd", interval: "month" },
    limits: {
      requests: { rate: 600, interval: "minute", enforcement: "enforce" },
    },
  })
  starter!: unknown;
}
```

## Rules

- Keep builds deterministic: no `Date`, random, network, filesystem, or
  `process.env` reads at module load.
- Change plans, meters, routes, limits, capabilities, workflows, and backend
  definitions in code, not through live CLI mutation.
- Run `farthershore build --entry business/business.config.ts --format json`
  before pushing.
- If an operation returns `MANAGED_BY_CODE`, edit this repo and push.

## Pair with

- `farthershore-product-as-code` for the edit/build/push loop.
- `farthershore-plans-and-billing` before changing prices, grants, trials, caps,
  or subscriber-impacting plan shape.
