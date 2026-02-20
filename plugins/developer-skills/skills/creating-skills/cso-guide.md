# Claude Search Optimization (CSO) Guide

The description field determines if Claude activates the skill. Get this wrong and the skill won't trigger or Claude will shortcut.

## The Rule

**Description = triggers only. NEVER summarize the workflow.**

When descriptions summarize the workflow, Claude follows the description instead of reading the full SKILL.md. The skill body becomes documentation Claude skips.

## The Cautionary Tale

Testing revealed that when a description summarizes the skill's workflow, Claude may follow the description instead of reading the full skill content. A description saying "code review between tasks" caused Claude to do ONE review, even though the skill's flowchart clearly showed TWO reviews (spec compliance then code quality).

When the description was changed to just "Use when executing implementation plans with independent tasks" (no workflow summary), Claude correctly read the flowchart and followed the two-stage review process.

**The trap:** Descriptions that summarize workflow create a shortcut Claude will take. The skill body becomes documentation Claude skips.

## Format

- Start with "Use when..."
- Third person (injected into system prompt)
- Include specific triggers, symptoms, contexts
- NO workflow summary
- Under 500 characters
- Describe the *problem* not language-specific symptoms
- Keep triggers technology-agnostic unless the skill is technology-specific

## Examples

```yaml
# BAD: Summarizes workflow — Claude will shortcut
description: Use when creating skills — scaffolds directory, validates structure, runs TDD cycle

# BAD: Describes what it does instead of when to use
description: Creates properly structured skills with validation and testing

# BAD: First person
description: I can help you create skills for kyrell-os

# BAD: Too much process detail
description: Use for TDD - write test first, watch it fail, write minimal code, refactor

# BAD: Mentions technology but skill isn't specific to it
description: Use when tests use setTimeout/sleep and are flaky

# GOOD: Triggers only, no workflow
description: Use when creating skills, building skills, turning processes into automations, making a new skill

# GOOD: Just triggering conditions
description: Use when implementing any feature or bugfix, before writing implementation code

# GOOD: Problem-focused, technology-agnostic
description: Use when tests have race conditions, timing dependencies, or pass/fail inconsistently
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

**Name by what you DO or core insight:**
- `condition-based-waiting` > `async-test-helpers`
- `flatten-with-flags` > `data-structure-refactoring`
- `root-cause-tracing` > `debugging-techniques`

## Token Efficiency

**Problem:** Frequently-loaded skills consume context in EVERY conversation. Every token counts.

**Target word counts:**
- Frequently-loaded skills: <200 words total
- Standard skills: <500 words (still be concise)

**Techniques:**

**Move details to tool help:**
```bash
# BAD: Document all flags in SKILL.md
search-conversations supports --text, --both, --after DATE, --before DATE, --limit N

# GOOD: Reference --help
search-conversations supports multiple modes and filters. Run --help for details.
```

**Use cross-references:**
```markdown
# BAD: Repeat workflow details
When searching, dispatch subagent with template...
[20 lines of repeated instructions]

# GOOD: Reference other skill
Always use subagents (50-100x context savings). REQUIRED: Use [other-skill-name] for workflow.
```

**Compress examples:**
```markdown
# BAD: Verbose example (42 words)
your human partner: "How did we handle authentication errors in React Router before?"
You: I'll search past conversations for React Router authentication patterns.
[Dispatch subagent with search query: "React Router authentication error handling 401"]

# GOOD: Minimal example (20 words)
Partner: "How did we handle auth errors in React Router?"
You: Searching...
[Dispatch subagent -> synthesis]
```

## Cross-Referencing Other Skills

**When writing documentation that references other skills:**

Use skill name only, with explicit requirement markers:
- **Good:** `**REQUIRED SUB-SKILL:** Use developer-skills:test-driven-development`
- **Good:** `**REQUIRED BACKGROUND:** You MUST understand developer-skills:test-driven-development`
- **Bad:** `See skills/testing/test-driven-development` (unclear if required)
- **Bad:** `@skills/testing/test-driven-development/SKILL.md` (force-loads, burns context)

**Why no @ links:** `@` syntax force-loads files immediately, consuming 200k+ context before you need them.

## Common Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|----------------|-----|
| Workflow in description | Claude shortcuts, skips skill body | Triggers only |
| "USE WHEN" in caps | Old convention, inconsistent | "Use when..." |
| Too vague | Won't match searches | Specific triggers |
| Too long | Wastes tokens | Under 500 chars |
| Technology-specific triggers | Won't match problem descriptions | Problem-focused language |
| @ file references | Force-loads, burns context | Plain file names |

## Validation

The `validate-skill.ts` script checks:
- Description starts with "Use when"
- No workflow summary patterns detected
- Under character limit
