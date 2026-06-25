---
name: farthershore-overview
description: Use when starting any task on the FartherShore platform — orients an
  agent to the packages, surfaces, and conventions, and points to where to look
  before writing code. Load this first when the user mentions FartherShore,
  Product-as-Code, or any @farthershore/* package.
---

# FartherShore Platform Overview

FartherShore is a **Product-as-Code** platform: builders define a software
product in code, and the platform provisions billing, an API gateway, runtime
usage metering, and generated developer portals around it.

Use this skill to orient before any platform task. It does **not** replace the
repo's own docs — it tells you which surface owns what and where to read next.

## The builder surfaces

| Package | Role |
|---------|------|
| `@farthershore/product` | Product-as-Code SDK + Manifest IR builder. Where a product is defined and compiled to a manifest. |
| `@farthershore/cli` | Public CLI (`@farthershore/cli`) for builder workflows. |
| `@farthershore/backend` | Runtime backend SDK — usage metering, gateway verification, health, transport. |
| `farthershore-js` | Browser/client JS package for product front-ends. |

## Before writing code

1. **Read the platform conventions doc first** — it's the highest-leverage read
   before editing anything.
2. **Resolve domain terms against the glossary** — product, compiler, billing,
   gateway, and lifecycle terms have precise meanings here; don't guess.
3. **Check the nearest `AGENTS.md`** — the repo root and many apps/packages ship
   one with branch, release, and CI rules.
4. **Match existing test patterns** — the repo documents how tests are expected
   to look; mirror them rather than inventing a style.

## Where things run

- **Express API** (`apps/core`) — Prisma, Stripe, Polar, R2.
- **Cloudflare Workers** — API gateway (auth, rate-limit, route), usage-event
  queue consumer, DLQ replay, generated-site shell.
- **Cloudflare Workflows** — product apply, Stripe sync, webhook dispatch, and
  per-entity transitions.
- **Next.js front-ends** — builder dashboard and internal admin console.

## How to use this skill

When a task touches a specific surface (defining a product, a CLI command, a
runtime metering question), load the dedicated skill for that surface if one
exists; otherwise read that package's own `README.md`/`AGENTS.md` in the
monorepo. Treat this overview as the map, not the territory — verify specifics
against the source before relying on them.
