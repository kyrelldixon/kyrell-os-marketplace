# Skills Reference

## What Is a Skill?

A skill is a **folder containing a SKILL.md file** that teaches Claude how to perform a specific task. Skills are loaded on-demand based on relevance.

## How Loading Works (Progressive Disclosure)

| Level | What Loads | When | Token Cost |
|-------|------------|------|------------|
| **1** | `name` + `description` from frontmatter | Session start | ~50 tokens per skill |
| **2** | Full SKILL.md content | When description matches context | Varies |
| **3+** | Reference files | Only when Claude reads them | On-demand |

## File Structure

```
skill-name/
├── SKILL.md          # Required — main skill definition
├── REFERENCE.md      # Optional — detailed reference
├── other-docs.md     # Optional — additional reference
└── scripts/          # Optional — executable TypeScript
    └── helper.ts
```

## SKILL.md Format

```markdown
---
name: skill-name
description: Use when [triggers]. Use when [more triggers].
---

# skill-name

[Brief description]

## [Workflow sections]

## Examples

[Concrete examples — mandatory]
```

## Frontmatter Rules

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | kebab-case, 64 chars max |
| `description` | Yes | 1024 chars max, triggers only |

## CSO (Claude Search Optimization)

**The description determines if Claude loads the skill.** Critical rule:

```yaml
# BAD: Summarizes workflow — Claude shortcuts
description: Use when creating skills - scaffolds directory, runs TDD cycle

# GOOD: Triggers only
description: Use when creating skills, building skills, turning processes into automations
```

**Why:** When descriptions summarize workflow, Claude follows the description instead of reading the full SKILL.md.

## Invoking Skills

Use the `Skill` tool:
```
Skill(skill: "skill-name")
Skill(skill: "skill-name", args: "optional arguments")
```

## Skill Locations

Skills can live in:
- `.claude/skills/` — Project-specific
- `~/.claude/skills/` — Global (all projects)
- Superpowers plugin — External skill packages

## Token Budgets

| Skill Type | Target |
|------------|--------|
| Always-loaded | <150 words |
| Frequently-loaded | <200 words |
| On-demand | <500 words |

SKILL.md should be under 500 lines. Move heavy reference to separate files.
