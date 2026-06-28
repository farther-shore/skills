# Price experiments & subscriber migration (reference)

All of this has direct revenue impact. Treat every step as **confirm** — get
human sign-off first.

## A/B price experiments (variants)

A variant is an `EXPERIMENTAL` alternative to an `ACTIVE` plan, rolled out to a
fraction of new subscribers (sticky assignment). You evaluate it, then either
promote it (it becomes the new ACTIVE; the old one starts PHASING_OUT) or roll
it back (it's archived; affected subscribers return to the parent).

**Preferred path (code):** express/adjust the variant in
`business/business.config.ts` and push. The platform schedules the transition.
Subscribers already on the variant's price feel no change on promotion.

**Emergency path (API/CLI):** when a variant is actively hurting revenue and you
need it gone immediately, use the imperative experimental promote/rollback
operation, then run the follow-up subscriber migration if the response says one
is required. Run the relevant `farthershore plan ... --help` to see the exact
command and flags. After a transition there is a brief window (≈ a couple of
seconds) where cached entitlements may be stale.

## Migrating subscribers between plans

Some plan changes leave subscribers pinned to an old plan/version that won't
migrate on its own (e.g. a frozen legacy plan). Moving them is an explicit
operation — `farthershore plan migrate …` (check `--help` for the current
signature: source/target version, migration policy). This is **confirm**:
state which subscribers move, from what to what, and when they're billed.

## Decision checklist before any of this

1. How many subscribers are affected, and what do they pay now vs after?
2. Is the change reversible, and how?
3. Does it require Stripe to be connected/verified?
4. Have you presented this to the human and gotten an explicit yes?

If you can't answer all four, stop and ask.
