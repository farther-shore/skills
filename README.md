# FartherShore Skills

Agent Skills for creating and operating a business on FartherShore. The bundle
is organized around nine jobs an agent performs and teaches one ownership model:

- The repository owns business structure: routes, features, plans, pricing,
  meters, limits, policies, and surfaces.
- The FartherShore CLI operates platform state that has no code representation.

Load `farthershore-overview` first. For a new business, continue with
`farthershore-quickstart`.

## Skills

| Skill | Load when… |
| --- | --- |
| [`farthershore-overview`](skills/farthershore-overview/SKILL.md) | starting any FartherShore task |
| [`farthershore-quickstart`](skills/farthershore-quickstart/SKILL.md) | creating a business from nothing |
| [`farthershore-business-sdk`](skills/farthershore-business-sdk/SKILL.md) | authoring the `business/` program |
| [`farthershore-plans-and-metering`](skills/farthershore-plans-and-metering/SKILL.md) | designing plans, pricing, limits, or meters |
| [`farthershore-building-uis`](skills/farthershore-building-uis/SKILL.md) | building customer-facing application surfaces |
| [`farthershore-environments-and-releasing`](skills/farthershore-environments-and-releasing/SKILL.md) | testing changes or releasing them |
| [`farthershore-backends-and-runtime`](skills/farthershore-backends-and-runtime/SKILL.md) | building an application backend, verifying requests, storing user data, reporting usage, or operating origins and tokens |
| [`farthershore-customer-operations`](skills/farthershore-customer-operations/SKILL.md) | operating customer access, subscriptions, roles, proposals, promo codes, and preview personas |
| [`farthershore-observability-and-troubleshooting`](skills/farthershore-observability-and-troubleshooting/SKILL.md) | diagnosing denials, releases, usage, backends, or platform faults |

## Live documentation

Every skill starts by fetching the current machine-readable documentation index:

```bash
curl -fsSL https://docs.farthershore.com/llms.txt
```

It then identifies the exact `https://docs.farthershore.com/...` pages for that
job. The skills carry the critical invariants and safe operating sequence; the
website carries the full current reference.

## Install or update the bundle

Install every skill together at a release tag with the Vercel Skills CLI:

```bash
npx skills add https://github.com/farther-shore/skills/tree/<tag> --skill '*' -g -y
```

Replace `<tag>` with the release required by the business repository. To
update, rerun the same command with the newer tag. Do not mix skills from
different tags; they form one versioned operating model.

The command installs the bundle globally for the agent runtimes detected by
the Skills CLI. Skills are progressively disclosed: the agent sees frontmatter
first and loads a body only when its trigger matches.

## Creation handoff

The only setup sequence taught by this bundle is:

```text
farthershore login → human allows the CLI to act as them
→ farthershore business create <slug>
→ clone the returned managed repository URL
→ read AGENTS.md
→ author business/ from scratch
→ farthershore build
→ push
→ inspect the GitHub checks
→ operate through the CLI
```

Device login may open a browser. On a headless machine, run
`farthershore login --headless` and give the verification URL and user code
to the human approver. The credential follows the user's live role and
CLI-operable permissions across all current and future organizations and
businesses. The standalone approval page has only Allow and Deny
actions; normal login has no naming, organization, business, tier, or permission
options.

List or change the saved organization without logging in again:

```bash
farthershore auth organization list --format json
farthershore auth organization use <id-or-slug>
farthershore --organization <id-or-slug> business list --format json
```

The global `--organization` option changes only command context; it does not
narrow the normal user session. For a separately pre-issued,
organization-scoped MakerToken, either pipe it directly from the secret provider
into `farthershore login --token-stdin` to save it, or set
`FARTHERSHORE_TOKEN` as an ephemeral override for the current shell. A
MakerToken can be restricted to selected permissions and businesses inside its
one organization. Never put the raw credential in argv, stdout, stderr, docs,
or logs, and unset the environment override when the restricted operation is
finished.

Run `farthershore logout` to remove the saved CLI credential.

Do not write contract state through the CLI or API. Change the repository and
push it.

## Authoring and validation

Each skill is `skills/<name>/SKILL.md` with YAML frontmatter containing only
`name` and `description`. Names are kebab-case and match their folder;
descriptions are one-line, trigger-oriented sentences beginning with `Use
when`.

Run the repository validator before opening a pull request:

```bash
node scripts/validate-skills.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the checklist.
