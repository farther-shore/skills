---
name: farthershore-backend-sdk-0-8
description: Use when editing a backend that depends on @farthershore/backend 0.8.x, especially FS_RUNTIME_TOKEN bootstrap, gateway request verification, withUsage response metering, Express middleware, or runtime-token setup.
metadata:
  version: 1.1.0
  sdk: "@farthershore/backend"
  supportedSdk: "0.8.x"
---

# Backend SDK 0.8.x

This skill is version-specific. Use it only when the backend depends on
`@farthershore/backend` `0.8.x`.

## Runtime config

Normal stage/prod backends need one secret:

```bash
farthershore backend tokens create "$BUSINESS" --backend <backendId> --format json
# Store the plaintext fsrt_... once as FS_RUNTIME_TOKEN.
```

Do not set `FS_CORE_URL` for normal deployments. `FS_RUNTIME_TOKEN` bootstraps
Core URL, business id, backend id, JWKS, verification, and metering config.

## Fetch handler

```ts
import { fartherShore, withUsage } from "@farthershore/backend";

const fs = fartherShore.initFromEnv();

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = new Uint8Array(await request.clone().arrayBuffer());

  await fs.verifyRequest({
    method: request.method,
    path: url.pathname,
    query: url.search,
    headers: request.headers,
    body,
  });

  const result = await runAction(await request.json());
  return withUsage(request, Response.json(result), {
    tokens_used: result.tokensUsed,
  });
}
```

Verification must fail closed. Report only dynamic meter keys declared in the
Business SDK route as `reports`.
