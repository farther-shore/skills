# Contributing

Treat this repository as one versioned bundle. Preserve the ownership model in
[README.md](README.md), direct invocation and critical decision-point guards.

- Keep the declared names/retirement destinations in `bundle.json`; skill folder,
  frontmatter name and discovered name must agree exactly.
- Use only name and a one-line trigger description beginning `Use when` in YAML.
- Preserve prerequisites/order, principal/environment scope, secure secret
  delivery, reconcile-before-repeat and observed-outcome evidence.
- Search → full guide → describe inputs/outputs/permissions/safety → execute →
  verify must work through installed capabilities. Include canonical retrieval
  fallback; all-retrieval failure must stop dependent sensitive work.
- Keep exact SDK/CLI syntax, catalogs and host recipes in canonical current docs;
  verify example signatures against source/help. Never invent a minimum version.
- Resolve every public docs slug/redirect/anchor against an explicit candidate
  docs tree with `node scripts/validate-doc-links.mjs --docs-root <docs-directory>`.
  Commit regenerated link evidence when links change, identifying the docs SHA.
- Run `node --test scripts/*.test.mjs` and `node scripts/validate-skills.mjs`.
  Discovery parity checks exact names; preserve strict plugin validation.
- Run independent baseline/candidate task evaluations for substantial rewrites.
  Test backend-free/first binding/secrets/rotation/tenant/report failure; first
  launch/Stripe/docs/pending checkout; preview reuse; custom UI scope/denials;
  governance/uncertain writes and retrieval outages/version mismatch. Record what
  agents actually did and close observed gaps before distribution.
- Keep installation complete and tag-pinned:
  `npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y`.
  Install successfully before explicit retired entries move to recoverable
  backups. Preserve custom entries and failure rollback; do not edit global installs.

A rewritten source bundle is not a published skill release. Coordinate compatible
docs/search, installer/onboarding retirement, real release archive integrity and
owner-approved pin changes. No tag, release or pin bump follows implicitly from
a contribution.
