# Release and change safety

Read https://docs.farthershore.com/monetize/plan-changes and
https://docs.farthershore.com/reference/commercial-releases before changing a
live product.

1. Identify business, environment, installed SDK, current accepted release, and
   affected subscribers. Separate recurring-price changes from live-catalog
   changes and customer-specific agreements.
2. Author public product changes in `business/`. Build and compare the exact
   release artifacts with `farthershore commercial-release diff --help`.
3. Verify preview behavior and GitHub checks for the exact proposed commit.
4. Present impact, activation timing, existing-customer behavior, and recovery
   to the user. Obtain approval before the production release.
5. Inspect apply timeline, active release, subject pins, and bill preview.
   A successful publication is not proof that an existing subscription moved.

## Customer-specific terms

Economic agreements and amendments are operational writes. Preview their exact
subject and terms before applying, retain the agreement identity, and read the
subject's pins afterward. Fixed agreements do not silently follow catalog
changes.

## Migration boundary

The existing `farthershore consumer migrate-latest` command is not a promise
of generalized commercial rebinding. The post-launch operation that refreshes
recurring and non-current usage-pricing pins is deferred. Do not invent a
plan-version batch migration command or claim release activation migrates
every customer.

Inspect the current operation catalog, exact command help, structured response,
and resulting subject pins. If the desired rebind is unavailable, report the
unsupported outcome and request a platform handoff; never emulate it through
private APIs or database writes.

Rollback changes the active release forward through the release log. It does
not undo settled usage, reverse payments, or rewrite existing subscriber pins.
