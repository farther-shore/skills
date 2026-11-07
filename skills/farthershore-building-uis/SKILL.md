---
name: farthershore-building-uis
description: Use when building customer-facing product surfaces, composing managed components with custom hooks, or verifying customer journeys and permissions.
---

# Compose the requested product

Read repository instructions and installed frontend SDK/CLI pins. Resolve the
intended business, environment and principal. Identify users,
primary objects, tasks, navigation and pricing model before choosing components.
A document product should lead with documents; account/usage/billing capabilities
support the product journey. A generic portal sidebar is not a product brief.
Derive model-appropriate consumption, allowance, cost, funding and recovery UX;
no universal billing component tag is required.

## Retrieve composition contracts

Search the task, read the full matching guide with prerequisites/failure recovery,
and compare version evidence with installed declarations. Describe operational
methods/types/permissions before effects; use current leaf CLI help. If search is
unavailable, read canonical https://docs.farthershore.com/frontend/overview,
https://docs.farthershore.com/frontend/components and
https://docs.farthershore.com/frontend/custom-components; use
https://docs.farthershore.com/llms.txt for index/corpora fallback. Excerpts are
selection aids; stale or truncated guidance is insufficient. Stop dependent
payment/authority changes if complete current instructions are unavailable.
Discover installed MCP/CLI capabilities; never invent methods or switch targets.

## Choose composition and preserve authority

Managed components, public hooks with bespoke presentation, or a deliberate mix
are valid. Retrieve exact exports/required props and provider ordering. One stable
client with `FartherShoreRoot` supplies managed auth, boot/readiness and recovery;
a lower-level provider does not automatically reproduce all root behavior.
Self-fetching components differ from hook-fed renderers and pure presenters.
Host CSS, layout and routing remain the application's responsibility. There is
no `BillingPanel` export; find real billing capabilities rather than inventing it.

Wait for authentication and authorization readiness. Scope data, mutation,
authorization and cache keys to the same business/organization. Organization
switches and request-local overrides must not leak prior data or retain the
wrong permission context. Gate each custom action with the same policy as the
managed surface and preserve actual server denial. The frontend is never an
authorization boundary: hidden controls do not prove gateway/backend enforcement.
Account roles, product roles and plan grants are distinct.

Use authoritative APIs/hooks for auth, credentials, plans, usage and billing;
custom presentation must preserve their behavior. Never paste runtime/customer/
persona credentials into frontend files, browser storage or logs. Secret-bearing
handoffs belong only in the documented auth bridge. Show newly issued API secrets
once through the supported transient flow. Retrieve public-versus-secret variable
rules before configuring a browser build.

## Keep the product truthful and usable

Handle loading, error, empty, denied and mutation-pending/recovery states
separately; unavailable usage is not zero. Preserve period/billing basis, exact
versus bounded/sample results, and partial failures. Server bill preview owns
money: preserve transparent versus opaque disclosure, decimal-string Nanos and
permission checks. Do not reconstruct invoices from local rates/usage or expose
hidden monetary detail in the DOM/exports.

Distinguish stored subscriber spend preferences from enforced plan/funding
controls. Inventory caps are not automatically pricing. A permission denial
requires access remediation, not an upgrade upsell. Offer applicable actions
with observable results; avoid empty shells and controls that cannot act.
Checkout return is pending until durable subscription/access or funds reconcile.

## Prove the customer journey

Use [environments-and-releasing](../farthershore-environments-and-releasing/SKILL.md)
for preview selection, persona creation/reuse and secure hosted/local sign-in.
Mock mode proves layout only. A terminal-owned live preview process and browser
are required for a local signed-in journey; hosted MCP is not a local server or
browser manager. Verify rendered identity and organization after sign-in and
every switch; browser-opened output alone is not authentication proof.

Exercise sign-in → organization/plan/access → primary object/action → visible
result → consumption and applicable billing/funding. Test owner and nonowner
product-role differences, denied/empty/error states, organization switching and
actual constrained requests. Include cross-tenant rejection when records exist.
Verify permission-denied requests at the gateway/backend rather than only hiding
a button. Reuse compatible preview state; do not remint credentials on every push.

Build/typecheck and inspect the composed UI as well as the real journey. Report
mock, local-live, hosted-artifact, permission and billing evidence separately;
hand off exact artifact publication to the release workflow. Reconcile uncertain
writes before repeats and keep real charges within explicit authorization.
