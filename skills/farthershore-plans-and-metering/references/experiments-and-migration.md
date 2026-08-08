# Plan change safety reference

Plan changes can affect revenue and subscribers. Treat them as **confirm**
actions.

## Ownership

Plans, variants, prices, grants, limits, and meters are repository-owned. Make
the complete change in `business/`, run `farthershore build`, push it, and
inspect the GitHub checks. Never use a CLI or API write as a second contract
editing surface.

## Before releasing

1. Identify which subscribers and environments the change can affect.
2. Compare current and proposed pricing, grants, limits, and meters.
3. Decide how to reverse the repository change.
4. Test on the repository's preview path when available.
5. Present the exact pushed commit and impact to the human.
6. Release only after explicit approval and passing GitHub checks.

## Migrate subscribers between released versions

Subscriber migration changes live subscription state; it does not redefine a
plan. Use this operate workflow only after both source and target versions were
created from repository changes and released.

1. Inspect the current signature and policies:

   ```bash
   farthershore plan migrate --help
   ```

2. Identify the business, plan key, source and target versions, affected
   subscribers, timing policy, and any proration impact. Supported policies are
   `next_renewal`, `immediate`, `by_date`, and `opt_in`; `by_date` also requires
   `--complete-by <iso8601>`, while `--proration none|prorate|credit` is
   optional where relevant.
3. Present that exact impact and command to the human and obtain explicit
   approval. The command has no interactive confirmation or `--yes` flag, so
   human approval is the confirmation gate.
4. Run the approved command:

   ```bash
   farthershore plan migrate <business> <plan-key> --from <version> --to <version|head> --policy <policy> --format json
   ```

5. Require `ok: true`, then record `data.migration.status`. The only success
   statuses are `PENDING`, `RUNNING`, and `COMPLETED`; the response also returns
   `batchId` and `transitionsScheduled`.
6. An inapplicable migration returns HTTP 409 with `ok: false` and error code
   `MIGRATION_SKIPPED`. No batch was created. Report the error message and stop;
   do not describe this as a successful migration status.

The CLI currently exposes scheduling status in the create response, not a
separate migration-status command; do not invent a polling command.

This verb is only for moving subscribers between released plan versions. Plan
shape, pricing, grants, limits, and meters remain repository-owned.
