# Claude Search Optimization (CSO) Guide

The description field determines if Claude activates the skill. Get this wrong and the skill won't trigger or Claude will shortcut.

## The Rule

**Description = triggers only. NEVER summarize the workflow.**

When descriptions summarize the workflow, Claude follows the description instead of reading the full SKILL.md. The skill body becomes documentation Claude skips.

## Format

- Start with "Use when..."
- Third person (injected into system prompt)
- Include specific triggers, symptoms, contexts
- NO workflow summary
- Under 500 characters

## Examples

```yaml
# BAD: Summarizes workflow — Claude will shortcut
description: Use when creating skills — scaffolds directory, validates structure, runs TDD cycle

# BAD: Describes what it does instead of when to use
description: Creates properly structured skills with validation and testing

# BAD: First person
description: I can help you create skills for kyrell-os

# GOOD: Triggers only, no workflow
description: Use when creating skills, building skills, turning processes into automations, making a new skill
```

## Keyword Coverage

Include words Claude would search for:

- **Error messages:** "ENOTEMPTY", "Hook timed out"
- **Symptoms:** "flaky", "hanging", "doesn't trigger"
- **Synonyms:** Multiple ways to describe the same trigger
- **Tools:** Commands, libraries, file types

## Naming

Use gerund form for processes:
- `creating-skills` not `create-skill`
- `mapping-processes` not `process-mapping`
- `building-clis` not `build-cli`

## Common Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|----------------|-----|
| Workflow in description | Claude shortcuts, skips skill body | Triggers only |
| "USE WHEN" in caps | Old convention, inconsistent | "Use when..." |
| Too vague | Won't match searches | Specific triggers |
| Too long | Wastes tokens | Under 500 chars |

## Validation

The `validate-skill.ts` script checks:
- Description starts with "Use when"
- No workflow summary patterns detected
- Under character limit
