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

Each top-level directory is one skill. A skill is a folder containing a
`SKILL.md` file plus any supporting `references/`, `scripts/`, or `assets/`.

```
skills/                              ← this repo
├── README.md
├── farthershore-overview/           ← a skill
│   └── SKILL.md
└── <your-next-skill>/
    ├── SKILL.md
    └── references/
```

| Skill | What it does |
|-------|--------------|
| [`farthershore-overview`](farthershore-overview/SKILL.md) | Orients an agent to the platform's packages, surfaces, and where to look first. |

> More skills land here as the platform's builder surfaces stabilize
> (Product-as-Code authoring, CLI workflows, runtime metering, dev portals).

---

## How an agent uses these

Skills are progressively disclosed: an agent reads only the `name` +
`description` frontmatter up front, then loads a skill's full body **on demand**
when the description matches the task.

**Claude Code (plugin / marketplace):** install this repo as a plugin so its
skills appear in the `Skill` tool.

**Manual / SDK:** clone the repo somewhere the agent can read it, then point
your skills directory at it:

```bash
git clone https://github.com/farther-shore/skills.git
# e.g. symlink or copy individual skill folders into your agent's skills path
```

**Direct download of one skill:**

```bash
# Sparse-checkout a single skill folder
git clone --no-checkout --depth 1 https://github.com/farther-shore/skills.git
cd skills && git sparse-checkout set farthershore-overview && git checkout
```

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

1. Create a folder named in kebab-case (this is the skill's `name`).
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
