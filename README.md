# FartherShore Skills

Six workflows for building and operating a FartherShore business. Skills retain
critical decisions, dependency order, authority and evidence boundaries. Current
versioned documentation owns syntax, catalogs, provider recipes and recovery
detail. Load only workflows needed for the task; each works when invoked directly.

| Skill                                                                                 | Use for                                                                        |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [overview](skills/farthershore-overview/SKILL.md)                                     | Ownership, installed capability discovery, creation and diagnostic routing     |
| [business-sdk](skills/farthershore-business-sdk/SKILL.md)                             | Contract design, commerce, metering and permission vocabulary                  |
| [backends-and-runtime](skills/farthershore-backends-and-runtime/SKILL.md)             | Host/binding/token/start order, verified identity and observed usage           |
| [building-uis](skills/farthershore-building-uis/SKILL.md)                             | Product-led managed/custom composition and customer journey proof              |
| [environments-and-releasing](skills/farthershore-environments-and-releasing/SKILL.md) | Managed repo checks, preview/personas, first paid launch and recovery          |
| [customer-operations](skills/farthershore-customer-operations/SKILL.md)               | Live customer/builder state, governed proposals, automation and communications |

The repository owns contractual structure in `business/`. Supported platform
operations own live metadata, origins, credentials, customers and activation;
external hosts own application deployment and process secrets. Hosting is a
prerequisite only for products with an upstream. Explicitly backend-free hosted
products are valid. Builder repositories and the platform monorepo have different
branch/release rules.

## Documentation and tooling

Resolve target, principal and installed pins → search in task language → read the
full guide including prerequisites/recovery → describe methods/types, permissions
and safety metadata → execute the authorized effect → verify its actual outcome.
Search excerpts select guides; they do not replace them. Hosted MCP describe
returns types; CLI code mode may expose a separate types command. Discover what
is installed rather than assume the newest source is deployed.

If search is unavailable, use canonical reads, section reads, index/corpora or
full Markdown retrieval through https://docs.farthershore.com/llms.txt. If current
critical instructions cannot be read, report the gap before dependent launches,
payment, credential or authority changes. Do not guess or silently change target.
Repository changes still use edits/builds/Git, even if a similarly named operation
appears in search. No private API workaround.

The candidate targets the search-aware source at platform commit
`52fdd15a22b5f04b45f6a72636d908effddd6077`; source support is not deployed capability
or live retrieval evidence. Match documentation source/package versions to actual
CLI/SDK pins. There is no universal SDK version implied by the skill version.

## Install or update

Install the complete immutable tagged bundle:

```bash
npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y
```

Use the release required by the business repository; do not mix bundle tags.
Source commits do not publish a release or update existing clients. This rewrite
does not create a tag or change the platform's pinned archive/hash.

After successful complete installation, move only recognized retired bundle
entries to a recoverable backup outside discovered skill roots. Preserve unrelated
and customized skills, prior working installation on failure, and rollback
protections. Never remove old entries before candidate installation succeeds.
Verify the installed CLI supports this retirement mapping before rollout; older
installers may know a different name set. No minimum version is invented here.

| Retired name                                   | Retained destination             |
| ---------------------------------------------- | -------------------------------- |
| [farthershore-agent-operations](skills/farthershore-overview/SKILL.md) | [farthershore-overview](skills/farthershore-overview/SKILL.md) |
| [farthershore-quickstart](skills/farthershore-overview/SKILL.md) | [farthershore-overview](skills/farthershore-overview/SKILL.md) |
| [farthershore-observability-and-troubleshooting](skills/farthershore-overview/SKILL.md) | [farthershore-overview](skills/farthershore-overview/SKILL.md) |
| [farthershore-plans-and-metering](skills/farthershore-business-sdk/SKILL.md) | [farthershore-business-sdk](skills/farthershore-business-sdk/SKILL.md) |
| [farthershore-governance](skills/farthershore-customer-operations/SKILL.md) | [farthershore-customer-operations](skills/farthershore-customer-operations/SKILL.md) |

There are no active alias/shim skills. `bundle.json` is the declared active and
retired inventory; discovery must match names exactly. The paragraph accounting
in `scripts/paragraph-disposition.json` records every original body/reference
paragraph at source commit aa1a563, including stale and duplicate removal.

## Verify a contribution

```bash
node --test scripts/*.test.mjs
node scripts/validate-skills.mjs
node scripts/validate-doc-links.mjs --docs-root /path/to/candidate/packages/platform-docs/docs
```

See [CONTRIBUTING.md](CONTRIBUTING.md). Local fixtures, source-link checks and
behavioral evaluations do not certify live search ranking, deployments, payments
or end-to-end platform behavior. Compatible docs/search publication, verified
complete-bundle installation/retirement and an approved immutable release/pin
update remain distribution prerequisites.
