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

If subscriber movement requires an operation with no code representation, read
the current CLI help, describe the affected population and billing timing, and
request confirmation before running it. Do not use that operation to redefine
the plan itself.
