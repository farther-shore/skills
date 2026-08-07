# Contributing a skill

Treat this repository as one versioned bundle. A change to any skill must stay
consistent with the ownership model in [README.md](README.md) and with every
cross-linked skill.

## Checklist

- Put each skill at `skills/<kebab-case-name>/SKILL.md`.
- Use frontmatter with only `name` and a one-line `description` beginning with
  `Use when`; the name must match the folder.
- Keep repository-owned structure in `business/`: routes, features, plans,
  pricing, meters, limits, policies, and surfaces.
- Use the CLI only for operations without a code representation.
- Verify command signatures against current source or `--help`; do not invent
  flags or response fields.
- Put necessary long-form material in a linked `references/` file.
- Update the skills table in [README.md](README.md).
- Run `node scripts/validate-skills.mjs`.
- Confirm `npx skills add . --list -y` discovers every skill.

Install and update guidance must always point to the whole, tag-pinned bundle;
never recommend installing one skill independently.
