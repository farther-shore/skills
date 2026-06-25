# FartherShore Skills

Downloadable [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
that teach an AI coding agent how to build on the **FartherShore** platform —
the Product-as-Code system for shipping software products with managed billing,
gateway, runtime metering, and generated dev portals.

An agent (Claude Code, the Claude Agent SDK, or any skill-aware runtime) clones
or downloads this repo to gain task-specific knowledge about the platform's
SDKs, CLI, and conventions — without that knowledge having to live in a system
prompt.

---

## What's in here

Every skill is a folder under `skills/` containing a `SKILL.md` file plus any
supporting `references/`, `scripts/`, or `assets/`. The `.claude-plugin/`
manifests make the very same repo installable as a Claude Code plugin.

```
.                                    ← repo root (farther-shore/skills)
├── .claude-plugin/
│   ├── marketplace.json             ← registers this repo as a Claude marketplace
│   └── plugin.json                  ← the "farthershore" plugin (bundles skills/)
├── skills/                          ← every skill lives here
│   ├── farthershore-overview/
│   │   └── SKILL.md
│   └── farthershore-…/
│       ├── SKILL.md
│       └── references/
├── CONTRIBUTING.md
└── README.md
```

Load **`farthershore-overview` first** — it establishes the mental model
(Product-as-Code, the contract-vs-operate boundary, the confirm-gated autonomy
posture) and routes you to the right domain skill.

| Skill | Load when… |
|-------|------------|
| [`farthershore-overview`](skills/farthershore-overview/SKILL.md) | **first** — mental model, contract/operate boundary, autonomy posture, router |
| [`farthershore-onboarding`](skills/farthershore-onboarding/SKILL.md) | authenticating, connecting GitHub/Stripe, creating/scaffolding a product, first deploy |
| [`farthershore-product-as-code`](skills/farthershore-product-as-code/SKILL.md) | defining/changing product structure — routes, features, meters, limits (contract; via the repo) |
| [`farthershore-plans-and-billing`](skills/farthershore-plans-and-billing/SKILL.md) | changing pricing, plans, grants, trials, meters; price experiments; subscriber migration |
| [`farthershore-environments-and-releasing`](skills/farthershore-environments-and-releasing/SKILL.md) | preview environments and the production release gate |
| [`farthershore-frontend-hosting`](skills/farthershore-frontend-hosting/SKILL.md) | deploy / status / rollback of the managed frontend (operate) |
| [`farthershore-backends-and-tokens`](skills/farthershore-backends-and-tokens/SKILL.md) | bring-your-own backends, runtime tokens (`fsrt_`), maker tokens (operate) |
| [`farthershore-operating-and-escalation`](skills/farthershore-operating-and-escalation/SKILL.md) | monitoring a live product; deciding what to fix vs escalate |

---

## Installing

Three install paths, the same skills — pick what fits your agent.

### 1. Any agent — `npx skills` (cross-harness)

These skills follow the open [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
spec, so the [`skills` CLI](https://github.com/vercel-labs/skills) installs them
into any of its ~70 supported agents — Claude Code, Cursor, Codex, OpenCode,
Gemini CLI, Copilot, Windsurf, and more — with **no FartherShore-specific
tooling required**. It auto-detects which agents you have installed and writes
to each one's correct skills directory.

```bash
# Install all FartherShore skills into every agent it detects
npx skills add farther-shore/skills --all

# Install globally (user-level), just for Claude Code
npx skills add farther-shore/skills -g -a claude-code

# Pick specific skills
npx skills add farther-shore/skills -s farthershore-overview
```

Manage them with the same tool:

```bash
npx skills list                         # what's installed, and where
npx skills update                       # pull the latest versions from upstream
npx skills remove farthershore-overview
```

Skills are progressively disclosed: an agent reads only the `name` +
`description` frontmatter up front, then loads a skill's full body **on demand**
when the description matches the task.

> **Why `npx skills` and not a `farthershore` CLI command?** The `skills` CLI
> already targets ~70 agent harnesses and knows each one's install path
> (`~/.claude/skills`, `~/.cursor/skills`, `~/.codex/skills`, …).
> Re-implementing that per-harness matrix ourselves would buy nothing. (This is
> the *skills-distribution* path — independent of MCP, where the older npx
> server path is deprecated in favor of CLI-backed and remote MCP.)

**Manual fallback** (no npx): clone the repo and point your agent's skills
directory at a skill folder.

```bash
git clone https://github.com/farther-shore/skills.git
```

### 2. Claude Code — native plugin

Claude Code can install the whole set as a **plugin**, no `npx` required:

```text
/plugin marketplace add farther-shore/skills
/plugin install farthershore@farthershore
```

The first command registers this repo as a marketplace (read from
`.claude-plugin/marketplace.json` on the default branch); the second installs
the `farthershore` plugin, which bundles every skill in `skills/`. Refresh later
with `/plugin marketplace update farthershore`.

### 3. Codex

Codex reads the same `SKILL.md` folders — it discovers skills in
`~/.agents/skills` (your user dir) and `.agents/skills` (a repo). Install with
the cross-agent CLI:

```bash
npx skills add farther-shore/skills -a codex
```

…or use Codex's own `$skill-installer` from inside Codex to pull skills from
this repo.

---

## The `SKILL.md` format

Every skill is a markdown file with YAML frontmatter. Keep the `description`
specific and trigger-oriented — it's the only text the agent sees before
deciding whether to load the skill.

```markdown
---
name: building-a-product
description: Use when scaffolding or editing a Product-as-Code definition with
  the @farthershore/product SDK — covers the manifest build command and the
  product directory layout.
---

# Building a Product

<the actual instructions the agent follows>
```

Frontmatter rules:

- `name` — kebab-case, matches the folder name.
- `description` — one line, starts with **"Use when …"**, names the concrete
  trigger so the agent knows exactly when this applies.
- Keep the body focused on *how to do the task*. Link to platform docs and
  source rather than duplicating them.

---

## Authoring a new skill

1. Create a folder **under `skills/`** named in kebab-case (this is the skill's `name`).
2. Add a `SKILL.md` with the frontmatter above.
3. Put long reference material in `references/` and link to it from the body so
   the main file stays small.
4. Add a row to the table in this README.
5. Open a PR.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full checklist.

---

## Related

- FartherShore platform monorepo (`fs-turbo`) — the source of truth for the
  packages and surfaces these skills describe.
- npm: `@farthershore/product`, `@farthershore/backend`, `@farthershore/cli`,
  `farthershore-js`.
