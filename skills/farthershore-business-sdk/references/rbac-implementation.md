# Product RBAC implementation checklist

Use for route permissions, subscriber roles, restricted keys, or permission-group
migrations. This is implementation guidance, not authority to change production.
Read the live docs index and the task's RBAC pages before acting.

## Keep the authorization layers separate

- The Business program declares route/group vocabulary and plan grants.
- Business RBAC enablement and subscriber-organization RBAC enablement are
  operational settings. **Both must be enabled.** Either being off can produce
  wildcard permission claims, even on otherwise restricted credentials.
- Product roles and assignments are operational subscriber state. Account roles
  administer the organization; they are not interchangeable with CUSTOM product
  roles. API-key bindings resolve CUSTOM roles.
- Plan access, route permission, member/service identity, and backend row/tenant
  authorization are independent requirements. RBAC never widens a plan grant.

## Declare and grant exact permissions

Place report routes in a permission group, for example
`fs.group("reports", [list, write, generate], { permission: { verbs: ["generate"] } })`.
Declare the generator operation with `permission: "generate"` and grant the
group from the plan. Include the plan's required request-rate limit.

GET/HEAD/OPTIONS derive `reports:read`; other methods derive `reports:write`.
An extra-verb override must exist in the containing permission group. Do not
override with `read` or `write`; those are method-derived defaults. A custom
subject wildcard is not grantable through the permission catalog.

| Product role | Exact grants | Expected calls |
| --- | --- | --- |
| Reader | `reports:read` | GET only |
| Writer | `reports:read`, `reports:write` | GET and ordinary writes, not generate |
| Generator | `reports:read`, `reports:generate` | GET and generate, not other writes |

Runtime `write` does not imply `read` or extra verbs. The seeded Member role
includes route writes; never treat it as the reader role. Templates seed once,
not as a continuous reconciliation of later route changes.

## Resolve the caller, not just the role name

- Member roles union with direct grants. A default role applies only when there
  are zero explicit role keys. Stale explicit keys do not fall back to default.
- Owners resolve wildcard access. Owner success is not least-privilege proof.
- Organization keys are also permission-checked. `requireMember: true` is a
  separate identity requirement, not a substitute for RBAC.
- Ordinary keys with no bindings/restrictions are wildcard. Nonempty key
  restrictions intersect live role grants; an empty restriction list is not
  deny-all. Restriction-only keys narrow from wildcard access.
- SERVICE credentials use frozen grant snapshots, not live role bindings.
  An empty SERVICE snapshot denies when both RBAC flags are enabled.

Role edits republish live key claims and member overlays asynchronously. Test
existing credentials after propagation; do not assume a successful write or a
new token proves all old credentials were updated.

## Preview is not permission-vocabulary isolation

Every apply, including preview, reconciles the business-wide permission
vocabulary. Group deletion/rename or verb removal can strip grants across
environments. Moving a route into a group changes its required subject and can
strand old per-route grants. Inspect affected roles, keys, and UI gates before
applying; recreating a deleted group does not restore stripped grants.

Test role assignments in preview with stable vocabulary. Do not disable either
RBAC flag to repair a denied request or perform an unapproved permission migration.

## Verification

Run TypeScript typecheck and the real CLI build separately. Test nonowner reader,
writer, and generator calls; denied plan access despite correct permissions;
restricted organization keys; missing member identity; stale roles; existing
credentials after narrowing; and cross-tenant record access. Frontend visibility
is not an authorization test. Backend checks use verified-context
`hasPermission`/`requirePermission`; the lower-level missing-claim-tolerant raw
predicate is not a request-authorization boundary. Require concrete permission
keys, not a wildcard requirement intended to mean all verbs.
