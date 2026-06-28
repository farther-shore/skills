---
name: farthershore-frontend-sdk-0-8
description: Use when editing a repo that depends on @farthershore/farthershore-js 0.8.x, especially hosted frontend code, FartherShoreRoot, managed components, hooks, local preview, or frontend build/runtime variables.
metadata:
  version: 1.1.0
  sdk: "@farthershore/farthershore-js"
  supportedSdk: "0.8.x"
---

# Frontend SDK 0.8.x

This skill is version-specific. Use it only when `frontend/package.json`
depends on `@farthershore/farthershore-js` `0.8.x`.

## Hosted portal default

On Farther Shore-hosted portals, create the client with injected platform config
by using the managed root/components:

```tsx
import {
  FartherShoreRoot,
  PlansTable,
  UsageCard,
} from "@farthershore/farthershore-js/components";
import "@farthershore/farthershore-js/components/styles.css";

export function App() {
  return (
    <FartherShoreRoot>
      <PlansTable />
      <UsageCard />
    </FartherShoreRoot>
  );
}
```

Use hooks/components from `@farthershore/farthershore-js/react` and
`/components` before writing custom platform calls.

## Local preview

```bash
farthershore frontend preview --core-url http://localhost:8787
```

The preview command injects the runtime config that the hosted platform injects
in production.

## Frontend variables

Public browser-visible values that are not repo contract belong in platform
frontend env state:

```bash
farthershore frontend env set "$BUSINESS" POSTHOG_KEY phc_xxx --target BOTH --format json
farthershore frontend env list "$BUSINESS" --format json
```

Use `BUILD` for build-time values, `RUNTIME` for serve-time injection, and
`BOTH` when either path may need it.
