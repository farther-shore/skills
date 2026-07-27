---
name: farthershore-quickstart
description: Use when taking a FartherShore business from nothing to a LIVE, callable URL with only the `farthershore` CLI and a maker token — the exact ordered sequence, the success signal to check at each step, and the six traps that each cost a wasted release cycle. Load this before any other FartherShore skill when the task is "create a business", "ship a product", "make an API sellable", or the business is not yet live.
metadata:
  version: 2.0.0
---

# Zero to a live business

Everything here is executable with **one CLI and one token**. No dashboard, no
browser — except the two human gates called out below, which you cannot do and
must not try.

Read [farthershore-overview](../farthershore-overview/SKILL.md) for the
contract-vs-operate rule and the JSON envelope. This skill is the ordered path.

## Setup

```bash
export FARTHERSHORE_TOKEN="mk_…"                     # maker token
export FARTHERSHORE_API_URL="https://core.farthershore.com"   # omit for prod default
```

Never pass the token as `--token` on a command line: argv is world-readable via
`/proc/<pid>/cmdline`. Use the env var, or a `600` file you `cat` into it.

Verify before doing anything else — a bad token wastes every later step:

```bash
farthershore business list --format json
```

**Success signal:** `"ok": true`. Anything else, stop and fix auth.

## The sequence

Nine steps. Each names the field to check. Do not invent extra steps, and do not
re-poll blindly — every step has a terminal signal.

### 1. Create the business

```bash
farthershore business create --name <slug> --display-name "<Name>" \
  --description "<one line>" --meters requests --format json
```

`--name` becomes the subdomain (`<slug>.farthershore.com`). For a custom meter
use `--meter key:Display:unit` (repeatable) instead of `--meters`.

**Success signal:** `data.result.business.id`. Keep it; every later command takes it.

> **Trap 1 — `ok: false` does not mean nothing happened.** Repo provisioning is a
> later stage of the same call. The business can exist while the response reports
> failure. **Always `farthershore business list` before retrying a create**, or
> you will end up with two businesses.

### 2. Write the business program

The repo was provisioned for you (`business show` → `gitRepoFullName`). Clone it
and replace `business/index.ts`. The compiler discovers the program by FOLDER —
it imports every module under `business/` and compiles the single
`fs.business()` result that is default-exported. Filename is irrelevant; split
across files if you like.

See [farthershore-business-sdk](../farthershore-business-sdk/SKILL.md) for the
verbs and [farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md)
for pricing.

> **Trap 2 — declare only routes your upstream actually serves.** A route
> declared here that the backend does not implement is a 404 the gateway will
> happily authorize and meter. Check the upstream first.

### 3. Validate locally, before pushing

```bash
farthershore validate --format json     # runs exactly what the PR check runs
farthershore build --format json        # compiles business/ → Manifest IR
```

**Success signal:** `ok: true`.

> **Trap 3 — `fs.business()` succeeding is NOT the build passing.** Registry
> validation (`fs.business()`) and BUILD completeness are different gates.
> Rules like "every plan needs a rate limit or a priced meter" run in the build
> worker, so a program can construct fine in a REPL and still fail on push.
> `farthershore validate` is what closes that gap. Run it.

### 4. Push

```bash
git push origin main
```

This triggers a manifest build. Watch it:

```bash
farthershore apply-timeline list <businessId> --format json
```

**Success signal:** an entry whose `checks` show `Build business: passed`.

> **Trap 4 — a push alone will NOT make a DRAFT business live.** You will see
> `status: "deferred"` with `accept` and `edgePublish` **skipped**. That is
> correct, not an error. A DRAFT business defers the apply until there is a
> release. Go to step 5 — do not debug this.

### 5. Cut a GitHub Release on the business repo

```bash
gh release create v0.1.0 --repo <owner>/<repo> --target main \
  --title "v0.1.0" --notes "First contractual release."
```

A **tag alone is not enough** — it must be a published Release.

**Success signal:** `farthershore plan list <businessId>` now returns
`count > 0`. Plans only exist after a release is accepted.

### 6. Attach a backend

Publishing refuses without one: *"A business origin or declared backend is
required before publishing."*

```bash
farthershore backend create <businessId> --name "<Name> API" --slug <slug>-api \
  --transport direct --origin-url https://<your-upstream> --default --format json
```

**Success signal:** `data.result.isDefault: true`.

### 7. Publish

```bash
farthershore business publish <businessId> --format json
```

**Success signal:** `status: "ACTIVE"`.

### 8. Wait for the edge

```bash
farthershore business status <businessId> --format json
```

**Success signal:** `"live": true`. Poll ~every 20s; it lands in about a minute.
If it stays false, read `apply-timeline list` — `accept` and `edgePublish` must
both be `succeeded`.

### 9. Prove it — do not trust `live: true` alone

```bash
curl -s -i https://<slug>.farthershore.com/<a-granted-route>
```

**Success signal:** **401** with an `x-fs-decision-id` header. That header is the
proof the gateway resolved your host, loaded the config, and made a typed
admission decision. A 404 or a Cloudflare error page means the business is not
actually being served.

Then call it authenticated (see below) and expect **200**.

## Getting a key to call it with

Production subscribers arrive through checkout. To test it yourself, use a
**test-environment persona**, which mints a real `fsk_` key:

```bash
# 1. env needs a branch to track — create the branch FIRST
git push origin env/test

# 2. create the environment
farthershore env create <businessId> --name test --branch env/test --format json
#    → note runtimeHostname, e.g. <hash>-test-<slug>.farthershore.com

# 3. push the branch AGAIN so an apply fires for the new environment
git commit --allow-empty -m "trigger env apply" && git push origin env/test

# 4. environments need their OWN backend — the production one does not apply
farthershore backend create <businessId> --env test --name "<Name> API (test)" \
  --slug <slug>-api-test --transport direct --origin-url https://<upstream> --default

# 5. mint a key
farthershore persona bootstrap <businessId> --env test --plan <planKey> --format json
```

> **Trap 5 — a branch push before the environment exists triggers nothing.** The
> apply is matched to an environment; if the env did not exist at push time
> there is no apply and `persona bootstrap` fails with a 500. Push again after
> creating the env.

> **Trap 6 — backends are environment-scoped.** A backend created without
> `--env` serves production only. Calling an env host without an env-scoped
> backend returns **503 `origin_unavailable`** even though auth and grants
> passed. `backend bind` will not help: it looks for a backend already *in* that
> environment and 404s.

Now call it:

```bash
curl -s -w '%{http_code}\n' https://<env-host>/<granted-route> -H "x-api-key: $KEY"
```

**Success signal:** `200`, and the response carries `x-fs-*` context headers the
gateway injected. A route the plan does **not** grant returns **403
`route_not_enabled`** — that is enforcement working, not a bug.

## The two human gates

You cannot do these. If a step needs one, stop and ask.

- **GitHub connect** — OAuth, browser-only. Without it repo provisioning fails.
- **Stripe connect** — browser-only. Needed before real paid checkout, but
  **not** needed to go live or to test with personas.

## Verifying you actually succeeded

Do not report success off `live: true`. Check all four:

| Claim | Command | Expected |
| --- | --- | --- |
| business is ACTIVE | `business status` | `status: ACTIVE` |
| edge serves the host | `curl` unauthenticated | `401` + `x-fs-decision-id` |
| a granted route works | `curl` with key | `200` |
| enforcement is real | `curl` an ungranted route | `403 route_not_enabled` |

## When something fails

`apply-timeline list <businessId> --format json` is the single best diagnostic.
Read `apply.phases`: `build → compile → accept → edgePublish`. The first phase
that is not `succeeded` carries the `error`, and the phase tells you where to
look — `build` is your program, `compile` is the platform, `accept`/`edgePublish`
is the release path.
