---
name: farthershore-environments-and-releasing
description: Use when previewing, releasing, verifying, or recovering a Business contract or hosted frontend across FartherShore environments.
---

# Preview, release, and recover

Git selects the artifact. Farther Shore environments and release pointers
operate that artifact. Never assemble production state through ad hoc contract
writes.

## Read current docs first

**Required before acting:** fetch the live machine-readable index:

```bash
curl -fsSL https://docs.farthershore.com/llms.txt
```

Then use the exact pages for the task:

- https://docs.farthershore.com/operate/environments
- https://docs.farthershore.com/operate/releases
- https://docs.farthershore.com/operate/apply
- https://docs.farthershore.com/operate/apply-timeline
- https://docs.farthershore.com/cookbook/preview-environment
- https://docs.farthershore.com/cookbook/release-production
- https://docs.farthershore.com/operate/observability-and-troubleshooting

Follow the managed repository's `AGENTS.md` when it is stricter.

## Preview in an environment

With the default `branch-prefix` policy, the first push of an `env/<name>`
branch creates that isolated environment. Each environment has its own accepted
contract, frontend release, customers, variables, and concrete backend binding.

```bash
git switch -c env/test
farthershore build --format json
git push -u origin env/test
farthershore env list <business> --format json
farthershore apply-timeline list <business> --env test --format json
```

If branch-prefix creation is disabled, create the environment explicitly first:

```bash
farthershore env create <business> --name test --branch env/test --format json
```

Inspect `branchCreated`, and push the exact branch if Core could not create it.
Production's backend origin does not serve the preview; create or bind an origin
for the environment before end-to-end testing. Pass the explicit environment to
every status and test command to avoid comparing preview with production.

## Release production

Production uses the immutable commit selected by a published GitHub Release.
Draft and prerelease releases do not publish. A non-economic default-branch
change may auto-apply when policy allows; an economic or indeterminate change
stays behind the reviewed production Release.

Before any production handoff, require the current commit, GitHub checks,
semantic diff, version, and subscriber impact to be reviewed. Production
release is confirm-gated.

`business publish` is only the one-time transition for a new **DRAFT** business.
Preview that first activation, then run it only after approval:

```bash
farthershore business publish <business> --dry-run --format json
farthershore business publish <business> --format json
```

Once a managed-repository business is **ACTIVE**, the contract is managed by
Git and every repeat `business publish`, including `--dry-run`, returns
`409 MANAGED_BY_CODE`. Build, push the default branch, inspect the exact commit's
Apply Timeline semantic diff, and choose the next version according to
`AGENTS.md` and the repository's published tags:

```bash
farthershore build --format json
git push origin main
farthershore apply-timeline inspect <business> "$(git rev-parse HEAD)" \
  --env production --format json
gh release list --limit 10
```

Then cut a published GitHub Release on the exact approved repository commit:

```bash
git tag -a <version> <full-approved-sha> -m "Release <version>"
git push origin <version>
gh release create <version> --verify-tag --title <version> --generate-notes
```

Do not repoint an existing release tag. The published GitHub Release event is
the production handoff.

There is no `frontend deploy` command. A Git push or published Release starts
the build; the CLI observes it.

## Verify the exact artifact

```bash
farthershore apply-timeline inspect <business> <tag-or-sha> \
  --env production --format json
farthershore business status <business> --format json
farthershore frontend status <business> --wait --timeout 600 --format json
```

Require the expected release tag and full commit SHA, successful publish phase,
`live: true`, and—when frontend source changed—the expected frontend build and
active release. Business apply and frontend build are separate facts.

## Recover the right layer

### Repository contract

The durable recovery is forward: correct or revert `business/`, validate in
preview, merge, and publish a new Release. For urgent compensation of an
eligible prior publish workflow:

```bash
farthershore business rollback <business> <workflowExecutionId> \
  --reason "restore the reviewed serving snapshot" \
  --idempotency-key rollback-<workflowExecutionId> \
  --format json
```

This uses the snapshot captured by that publish workflow. It does not move a
Git tag or change repository source. An `enqueued` response is not convergence;
record the new workflow ID and read status back.

### Hosted frontend only

Use this only when the Business contract is correct and the hosted artifact is
wrong:

```bash
# Omitting --env intentionally targets production.
farthershore frontend status <business> --format json
farthershore frontend rollback <business> \
  --release-id <reviewed-known-good-release-id> \
  --format json
farthershore frontend status <business> --format json
```

Choose the release ID from this target's recent **SUCCEEDED** releases. Prove it
is known-good from the producing build/commit and prior behavior; age alone is
not evidence. For preview, include the same `--env <environmentId>` on status
and rollback. Omitting `--env` targets production. Rollback flips and pins only
that target's frontend pointer; it does not change plans, billing, routes,
backend, or repository source. Verify the exact active release ID and pin state.

The pin also prevents a later successful production build from auto-activating.
After a forward-fix Release builds, inspect status. If the new reviewed
`SUCCEEDED` release is present but the old pin is still active, explicitly
reactivate that new release through the same target-safe pointer operation:

```bash
farthershore frontend rollback <business> \
  --release-id <new-reviewed-succeeded-release-id> \
  --format json
farthershore frontend status <business> --format json
```

Despite the verb name, this operation reactivates any succeeded release in that
same target's build history and leaves the chosen release pinned. Verify the new
active release ID and pin state; never assume the GitHub Release cleared a pin.

## Stop conditions

- Merging to `main`, production publishing, and production rollback require
  explicit confirmation.
- Never retry a release/rollback after a lost response until read-back proves it
  did not complete.
- If publication fails after accepted input, preserve apply/build/workflow IDs
  and use
  [farthershore-observability-and-troubleshooting](../farthershore-observability-and-troubleshooting/SKILL.md).
