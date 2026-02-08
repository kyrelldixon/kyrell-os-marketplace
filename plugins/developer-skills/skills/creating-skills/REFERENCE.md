# Claude Skills Reference

## What Is a Claude Skill?

A Claude Skill is a **folder containing instructions, scripts, and resources** that teaches Claude how to perform a specific task. Skills are dynamically loaded — Claude only accesses them when relevant to the current task.

Skills are NOT:
- Prompts you paste into a conversation
- System instructions that always load
- Generic templates

Skills ARE:
- Self-contained packages of procedural knowledge
- Loaded on-demand based on task relevance
- Composable and reusable across sessions

## How Skills Work: Progressive Disclosure

Skills use **progressive disclosure** to manage context efficiently:

| Level | What Loads | When |
|-------|------------|------|
| **1** | Skill name + description (from frontmatter) | Always — loaded into system prompt at session start |
| **2** | Full `SKILL.md` content | When Claude determines the skill is relevant to the task |
| **3+** | Additional files (reference docs, scripts) | Only when Claude needs them during execution |

This means:
- A skill with 10,000 lines of reference material costs ~50 tokens until activated
- Claude decides when to load more based on the task
- You can bundle extensive documentation without bloating every conversation

## Required Structure

```
skill-name/
├── SKILL.md          # Required — the core skill definition
└── scripts/          # Optional — executable code
    └── helper.ts
```

### SKILL.md Format

```markdown
---
name: skill-name
description: What the skill does. USE WHEN [trigger phrases that help Claude recognize when to activate].
---

# skill-name

[Brief description of what this skill does]

## How It Works

[Numbered steps explaining the workflow]

## [Domain-specific sections]

[Additional context, guidelines, reference material]

## Examples

[Mandatory — concrete examples of usage]
```

### Frontmatter Requirements

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique identifier, kebab-case (e.g., `capture-hn`) |
| `description` | Yes | What it does + trigger phrases ("USE WHEN...") |

The description is critical — it's what Claude reads to decide whether to activate the skill.

## Optional Components

### Scripts

Executable code that Claude can run. For kyrell-os, we use TypeScript with Bun:

```
skill-name/
├── SKILL.md
└── scripts/
    ├── fetch-data.ts
    └── validate.ts
```

Reference scripts in SKILL.md:
```markdown
## Scripts

### fetch-data.ts
Fetches data from API.
\`\`\`bash
bun run scripts/fetch-data.ts <url>
\`\`\`
```

### Reference Files

Additional documentation Claude loads when needed:

```
skill-name/
├── SKILL.md
├── REFERENCE.md      # Detailed reference (like this file)
└── examples/
    └── sample-output.md
```

Reference in SKILL.md:
```markdown
For detailed specifications, see `REFERENCE.md`.
```

Claude will read these files when the task requires them.

## Best Practices

### Keep SKILL.md Focused
- Under 500 lines for optimal performance
- Essential information only
- Move detailed reference to separate files

### Write Clear Trigger Phrases
```markdown
# Good
description: Creates HN thread notes. USE WHEN capture hn, save hacker news, hn thread, hacker news post.

# Bad
description: A skill for working with Hacker News content.
```

### Use Action-Oriented Names
```markdown
# Good
capture-hn, clean-comment, extract-insight

# Bad
hn-handler, comment-utility, insight-manager
```

### Include Real Examples
Examples are mandatory. They show Claude (and humans) exactly how the skill works:

```markdown
## Examples

**Example 1: Basic capture**
User: "capture this hn thread: https://news.ycombinator.com/item?id=12345"
→ Fetch thread metadata via API
→ Create note from template in sources/
→ Set status: raw
→ Report: "Created sources/hn-sqlite-thread.md"
```

## How Skills Are Invoked

Skills activate in two ways:

1. **Automatic** — Claude recognizes the task matches a skill's description
2. **Explicit** — User types `/skill-name` or "use the X skill"

For kyrell-os skills, we use explicit invocation via the description's "USE WHEN" triggers.

## Where Skills Live

```
kyrell-os/
└── .claude/
    └── skills/
        ├── create-skill/     # Meta skill for creating skills
        ├── capture-hn/       # Capture HN threads
        └── [other skills]/
```

Skills in `.claude/skills/` are automatically available to Claude Code when working in this project.

## Official Documentation

- [Anthropic Skills Announcement](https://www.anthropic.com/news/skills)
- [GitHub: anthropics/skills](https://github.com/anthropics/skills) — Official skill repository
- [Anthropic Engineering: Equipping Agents with Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## kyrell-os Conventions

Beyond Anthropic's requirements, kyrell-os skills follow these conventions:

1. **Scripts use TypeScript + Bun** (not Python)
2. **kebab-case for everything** (skill names, files, directories)
3. **Action-oriented names** (verb-noun: `capture-hn`, not `hn-capturer`)
4. **Ask for context** — Skills should gather user's existing knowledge before executing
5. **Validate before reporting** — Use validation scripts to ensure output is correct
