---
name: farthershore-onboarding
description: Use when getting started on FartherShore from scratch — authenticating the CLI with a maker token, connecting GitHub and Stripe, creating or scaffolding a business, and reaching a first deploy. Covers the browser-only connect flows an agent cannot complete alone.
metadata:
  version: 1.1.0
---

# Onboarding: zero to first deploy

Read [farthershore-overview](../farthershore-overview/SKILL.md) first. This skill
gets a brand-new setup to a deployed product.

## 1. Authenticate (auto)

The CLI authenticates with a **maker token** (`mk_…`). The user creates one in
the FartherShore dashboard token settings (browser-only).

```bash
farthershore auth login --token mk_xxx     # stores it in ~/.farthershore
# or, non-interactively / in CI:
export FARTHERSHORE_TOKEN=mk_xxx
farthershore auth whoami --format json     # confirm identity, org, role
```

If `auth whoami` fails, you have no valid token — ask the user to mint one;
you cannot create maker tokens from the CLI.

## 2. Connect GitHub and Stripe (escalate — browser-only)

These are OAuth flows that **only a human can complete in a browser**. You can
check status and surface the link, then poll — you cannot finish them yourself.

```bash
farthershore connect github --format json          # prints status + a URL
farthershore connect stripe <product> --format json
```

- If status is not `connected`, give the user the URL and ask them to complete
  it, then re-check. Do not loop forever — check, report, and wait.
- GitHub must be connected before creating a product (it provisions the repo).
- Stripe must be connected and verified before publishing a **paid** product.

## 3. Create the product (confirm)

Two paths:

- **`farthershore business create`** — provisions a managed GitHub repo with the
  `business/` and `frontend/` scaffold, a generated `README.md` and `AGENTS.md`, and a DRAFT
  product on the platform. This is the agent-first path. It's a confirm action
  (it creates real resources).
- **`farthershore init`** — scaffolds a `business/` definition locally from a
  template, for an existing repo. Safe/auto.

Run `farthershore business create --help` / `farthershore init --help` for the
current flags (name, origin, template, surfaces). Pick a template that matches
the billing model (e.g. free vs paid vs metered).

## 4. First build and deploy

1. Read the new repo's `AGENTS.md`.
2. Run `farthershore skills recommend --format json` in the repo and install the
   recommended SDK-compatible skill files.
3. Edit `business/business.config.ts` as needed — see
   [farthershore-product-as-code](../farthershore-product-as-code/SKILL.md).
4. `farthershore build` to validate locally.
5. Commit and push. Watch the `farthershore/build` check.
6. Test in a preview environment, then release to production — see
   [farthershore-environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md).

## Common stalls

- `GITHUB_NOT_CONNECTED` → step 2; ask the user to connect GitHub.
- `STRIPE_NOT_CONNECTED` / `STRIPE_NOT_VERIFIED` → step 2; the user must finish
  Stripe onboarding before publishing a paid product.
- `AUTH_NO_TOKEN` → step 1; no maker token is available.
