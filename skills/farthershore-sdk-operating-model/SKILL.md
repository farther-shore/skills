---
name: farthershore-sdk-operating-model
description: Use when deciding how an agent should use the Farther Shore Business SDK, Frontend SDK, and Backend SDK together, or when a task spans business.config.ts, hosted frontend code, backend verification, runtime tokens, or frontend env variables.
metadata:
  version: 1.1.0
---

# SDK Operating Model

Read [farthershore-overview](../farthershore-overview/SKILL.md) first. This
skill explains how the three SDKs fit together for an autonomous agent.

## One boundary

- **Author business behavior in the repo.** Edit `business/business.config.ts`,
  `frontend/`, and backend source. Push a branch/PR.
- **Operate platform state through the CLI/MCP.** Status, change sets,
  frontend env vars, runtime tokens, preview environments, publish, rollback,
  usage, and diagnostics are operations.
- **Never create a second product editor.** Plans, routes, meters, limits,
  capabilities, backend definitions, and workflows are repo-backed.

## SDK map

| SDK                             | Where                         | Agent use                                                                                                                                  |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `@farthershore/business`        | `business/business.config.ts` | Declare `@Business`, `@Plan`, `@Feature`, `@Meter`, `@Requests`, `@Backend`, `@Frontend`, `@Workflow`. Validate with `farthershore build`. |
| `@farthershore/farthershore-js` | `frontend/`                   | Build hosted customer UI. On platform-hosted portals, use injected config and mount `FartherShoreRoot` / managed components.               |
| `@farthershore/backend`         | builder upstream              | Verify gateway-signed requests and report dynamic usage. Deploy only `FS_RUNTIME_TOKEN` for normal stage/prod backends.                    |

## Agent loop

```bash
BUSINESS=<slug>
farthershore business status "$BUSINESS" --format json
farthershore change-set list "$BUSINESS" --format json
farthershore frontend status "$BUSINESS" --format json
farthershore build --entry business/business.config.ts --format json
```

Then branch, edit, commit, push, open a PR, inspect change sets/checks, test the
preview, and release.

## Frontend variables

Use frontend env operations for public browser-visible values that are not part
of the repo contract, such as PostHog keys:

```bash
farthershore frontend env set "$BUSINESS" POSTHOG_KEY phc_xxx --target BOTH --format json
farthershore frontend env list "$BUSINESS" --format json
```

`BUILD` feeds managed build time, `RUNTIME` feeds served runtime injection, and
`BOTH` covers both.

## Backend runtime tokens

```bash
farthershore backend create "$BUSINESS" --name "Production API" \
  --origin-url https://api.example.com --transport direct --default --format json
farthershore backend tokens create "$BUSINESS" --backend <backendId> --format json
```

Store the returned `fsrt_...` once as `FS_RUNTIME_TOKEN`. Do not add `FS_CORE_URL`
for normal stage/prod backends; token bootstrap supplies the correct runtime
configuration.

## Red flags

- Asking for GitHub owner/repo on business create. The connected GitHub account
  determines repo provisioning.
- Using UUIDs in prompts when the business slug works.
- Editing live plans with `plan create/update/delete` instead of `@Plan`.
- Coupling SDK releases unnecessarily; the SDKs version independently.
