# FartherShore Skills

Agent Skills for creating and operating a business on FartherShore. The bundle
teaches one ownership model:

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
| [`farthershore-backends-and-tokens`](skills/farthershore-backends-and-tokens/SKILL.md) | operating backends and runtime tokens |
| [`farthershore-frontend-hosting`](skills/farthershore-frontend-hosting/SKILL.md) | deploying or rolling back a hosted frontend |
| [`farthershore-operating-and-escalation`](skills/farthershore-operating-and-escalation/SKILL.md) | monitoring health or escalating platform faults |

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
farthershore business create <slug>
→ clone the returned managed repository URL
→ read AGENTS.md
→ author business/ from scratch
→ farthershore build
→ push
→ inspect the GitHub checks
→ operate through the CLI
```

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
