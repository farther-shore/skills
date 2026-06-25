# Contributing a skill

Skills in this repo follow the [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
format: one folder per skill, each containing a `SKILL.md`.

Scaffold a new one with the same CLI that distributes them:

```bash
npx skills init my-skill        # writes my-skill/SKILL.md with starter frontmatter
```

## Checklist

- [ ] Skill folder lives at the **repo root** (or under `skills/`) so the
      `skills` CLI auto-discovers it — verify with
      `npx skills add farther-shore/skills --list`.
- [ ] Folder is **kebab-case** and matches the `name` in frontmatter.
- [ ] `SKILL.md` has both `name` and `description` frontmatter fields.
- [ ] `description` is one line, starts with **"Use when …"**, and names a
      concrete trigger (a task, a package, a phrase the user would say).
- [ ] Body explains **how to do the task**, not background prose. Link to
      platform docs/source instead of duplicating them.
- [ ] Long reference material lives in `references/` and is linked from the body
      so `SKILL.md` stays small (load only what's needed).
- [ ] Any claims about platform APIs are verified against the monorepo source —
      no invented command signatures or flags.
- [ ] Added a row to the skills table in [README.md](README.md).

## Why the description matters most

An agent reads only the `name` + `description` of every skill up front, and
loads the full body **only when the description matches the task**. A vague
description means the skill never triggers. Be specific:

```yaml
# weak — never triggers reliably
description: Helps with products.

# strong — fires on the right task
description: Use when scaffolding or editing a Product-as-Code definition with
  the @farthershore/product SDK, including running the manifest build.
```

## Layout

```
my-skill/
├── SKILL.md           ← required: frontmatter + instructions
├── references/        ← optional: deep-dive docs loaded on demand
│   └── api-notes.md
└── scripts/           ← optional: helper scripts a skill may run
```

Open a PR with the new folder and the README table updated.
