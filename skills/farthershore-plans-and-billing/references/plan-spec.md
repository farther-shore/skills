# Plan spec (reference)

A plan is declared with `@Plan` in `business/business.config.ts`. It combines a
small set of knobs. Check the installed `@farthershore/business` version for the
exact, current field names and shapes before relying on a specific one.

## Knobs

- **recurring fee** — the plan's base subscription price (per interval).
- **grants** — credits applied to the subscriber's balance. A grant can be
  one-time (applied at start / on plan change) or recurring (applied each
  billing period, i.e. a monthly credit).
- **trial** — a free trial period in days.
- **monthly spend cap** — an optional ceiling; once a subscriber's metered spend
  in a period exceeds it, the gateway throttles them.
- **meters** — usage dimensions the plan charges for, each priced per unit.
  Prices are expressed in **micros per unit** (fine-grained; verify the exact
  unit and scaling in the SDK/CLI `--help`).
- **limits** — rate limits (e.g. requests per minute) with an enforcement mode.
  **Every plan needs at least one rate limit.**

## The revenue rule

A plan must have a revenue source — a recurring fee, a priced meter, or a
grant-backed paid model — **or** be explicitly marked `free`. A plan that
charges for nothing and isn't marked `free` is rejected at build time
(no-revenue). A `free` plan must not also carry revenue fields.

## Meters and pricing

- A meter is declared with `@Meter` (or the built-in `@Requests`) and referenced
  by routes via a feature's `reports` mapping (see the decorators reference).
- A plan prices a meter by setting a per-unit price for that dimension.
- Request counts vs value-meter ledgers may be surfaced differently by
  `farthershore usage` — read what the command returns rather than assuming.

## Plan lifecycle states (what `plan list` shows)

A plan/version can be in one of several states; you'll see these when reading:

- **ACTIVE** — new subscribers join; renewals charge this price.
- **EXPERIMENTAL** — an A/B variant of an ACTIVE plan; new subs only via rollout.
- **PHASING_OUT** — superseded; existing subs keep renewing, no new subs.
- **SUPERSEDED** — phasing-out with zero remaining subscribers.
- **LEGACY_STABLE** — a frozen prior plan kept for existing subscribers.
- **ARCHIVED** — historical only; no billing activity.

You don't set these directly — they result from publishing plan changes and from
subscriber migration. See `experiments-and-migration.md`.
