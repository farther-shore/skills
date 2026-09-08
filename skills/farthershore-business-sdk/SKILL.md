---
name: farthershore-business-sdk
description: Use when writing or editing a business/ program with @farthershore/business, including routes, grants, meters, resources, providers, and policies.
---

# Author the business contract

Use the repository's pinned `@farthershore/business` version. This guidance
targets **3.2.x**; an older pin does not gain newer capabilities by reading newer
docs. Read the repository's `AGENTS.md` and dependency lockfile first.

## Read current docs first

**Required before acting:** fetch the live machine-readable index and read the
task's pages. Prefer CLI traversal when supported; `docs ls` fetches that index,
so no separate `curl` is needed:

```bash
farthershore docs --help
farthershore docs ls --format json
farthershore docs tree business-sdk --format json
farthershore docs read define/business-class --format json
```

Collections are root folders; expand section folders with `docs ls <path>`.
Use returned paths rather than guessing. Read the [overview's traversal guide](../farthershore-overview/SKILL.md#traverse-docs-as-a-filesystem)
for heading reads, search, and provenance. Docs need no login. If the CLI lacks
`docs` or its artifacts are unavailable, fetch
https://docs.farthershore.com/llms.txt and follow its page links; do not silently
switch to stage or assume guidance was retrieved.

Start with https://docs.farthershore.com/define/business-class and
https://docs.farthershore.com/reference/business-sdk. Use the Business SDK
collection for routes, meters, resources, authentication, and complete export
signatures. If the live docs target a different version, inspect the installed
declarations and matching release documentation before writing code.

## A minimal bounded product

```ts
import * as fs from "@farthershore/business";

const requests = fs.requests();
const status = fs.route("/v1/status", {
  get: { costs: [requests.fixed(1)] },
});
fs.plan("free", {
  kind: fs.plan.kind.free,
  grants: [status],
  limits: [requests.perMinute(60)],
});
export default fs.business();
```

Every plan declares `kind: fs.plan.kind.*`. For paid products, load
[farthershore-plans-and-metering](../farthershore-plans-and-metering/SKILL.md).
Keep measurement, pricing catalogs, funding, grants, and structural limits
separate. Do not transplant older plan or meter shapes.

## Rules that change how you implement

- The compiler discovers all source modules under `business/`, not one required
  filename. Exactly one default-exported `fs.business()` seals the registry;
  evaluate every declaration before that call. Use sibling modules for growth.
- Declarations return immutable branded refs. Pass those refs, not strings or
  hand-built reference objects. Use one installed SDK copy.
- Declaring a meter does not attach it. Bind route `costs` for gateway-known
  fixed units and `reports` for actual backend measurements. Verify the built
  route bindings. Pricing or limiting a meter is not itself a measurement.
- Monetary admission uses a named `fs.meterRoutes` declaration on an exact
  route, with bounded estimates and optional `postStream` settings. Structural
  group/path overlays are a different overload. Read
  https://docs.farthershore.com/reference/monetary-admission before choosing.
- Counted resources use `resource.max(n)` inside plan `limits`; they are not
  per-seat pricing. Read https://docs.farthershore.com/define/resources.
- Keep declarations deterministic: no clocks, random values, environment reads,
  filesystem discovery, or network requests. The build compares two runs.
- Business presentation metadata, concrete backend origins, variables, and
  release activation are platform operations, not declarations. Confirm their
  current CLI surface with `--help`.

## Verify and hand off

Run `farthershore build --format json` and inspect failures and the generated
IR. Constructor success is not proof of a valid build. Push only the reviewed
repository change, then inspect validation/apply checks in the intended
environment. Existing subscriptions can retain commercial pins; a successful
compile does not prove a customer received the new terms.

For authorization or unsupported operations, use
https://docs.farthershore.com/agents/operation-classes; do not bypass an ownership
boundary with a private API.
