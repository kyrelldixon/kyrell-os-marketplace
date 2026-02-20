---
name: creating-skills
description: Use when creating skills, building skills, editing existing skills, turning processes into automations, making a new skill
---

# Creating Skills

## Overview

**Creating skills IS Test-Driven Development applied to process documentation.**

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

**REQUIRED BACKGROUND:** You MUST understand `developer-skills:test-driven-development` before using this skill. That skill defines the RED-GREEN-REFACTOR cycle. This skill adapts TDD to documentation.

**Official guidance:** See `anthropic-best-practices.md` for Anthropic's official skill authoring best practices.

## Skill Types

| Type | Description | Test Approach |
|------|-------------|---------------|
| **Technique** | Concrete method with steps (condition-based-waiting) | Application + variation scenarios |
| **Pattern** | Way of thinking about problems (flatten-with-flags) | Recognition + counter-example scenarios |
| **Reference** | API docs, syntax guides, tool documentation | Retrieval + application scenarios |

Discipline-enforcing skills (TDD, verification) need pressure testing. See `testing-skills.md`.

## The Iron Law

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

Applies to NEW skills AND EDITS to existing skills.

Write skill before testing? Delete it. Start over. Not for "simple additions", not for "just adding a section", not for "documentation updates".

## RED-GREEN-REFACTOR for Skills

### RED: Establish Baseline
Run pressure scenario WITHOUT the skill. Document:
- What did the agent do wrong?
- What rationalizations did it use (verbatim)?
- What pressure triggered the failure?

### GREEN: Write Minimal Skill
```bash
bun run scripts/init-skill.ts <skill-name> --path .claude/skills/
```
Write skill addressing those specific failures. No hypothetical cases.
Run same scenarios WITH skill. Agent should now comply.

### REFACTOR: Close Loopholes
Agent finds new rationalization? Add explicit counter. Re-test until bulletproof.

**Full methodology:** See `testing-skills.md` for pressure scenarios, pressure types, meta-testing, and worked examples. See `persuasion-principles.md` for research on making skills resist rationalization.

## CSO Rules (Critical)

Description = triggers only. Never summarize workflow.

```yaml
# BAD: Summarizes workflow
description: Use when creating skills - scaffolds directory, runs TDD cycle

# GOOD: Triggers only
description: Use when creating skills, building skills, turning processes into automations
```

See `cso-guide.md` for the full cautionary tale, cross-referencing patterns, and token efficiency techniques.

## File Organization

### Self-Contained Skill
```
defense-in-depth/
  SKILL.md    # Everything inline
```
When: All content fits, no heavy reference needed.

### Skill with Reusable Tool
```
condition-based-waiting/
  SKILL.md    # Overview + patterns
  example.ts  # Working helpers to adapt
```
When: Tool is reusable code, not just narrative.

### Skill with Heavy Reference
```
pptx/
  SKILL.md       # Overview + workflows
  pptxgenjs.md   # 600 lines API reference
  ooxml.md       # 500 lines XML structure
  scripts/       # Executable tools
```
When: Reference material too large for inline.

## Token Efficiency

| Skill Type | Target Words |
|------------|-------------|
| Frequently-loaded | <200 |
| Standard skills | <500 |

Move heavy reference to separate files. Use cross-references instead of repeating content. See `cso-guide.md` for compression techniques.

## Quick Reference

| Phase | Action | Output |
|-------|--------|--------|
| RED | Run scenario without skill | Documented failures |
| GREEN | Scaffold + write skill | SKILL.md addressing failures |
| REFACTOR | Re-test, plug holes | Bulletproof skill |
| VALIDATE | Run validation script | All checks pass |

## SKILL.md Structure

```markdown
---
name: skill-name
description: Use when [triggering conditions]
---

# skill-name

## Overview
Core principle in 1-2 sentences.

## [Domain-specific sections]

## Quick Reference
Table for scanning.

## Examples
Concrete examples (mandatory).
```

**Frontmatter:** Only `name` and `description`. Name: kebab-case. Description: "Use when...", third person, under 500 chars, triggers only.

## Validate

```bash
bun run scripts/validate-skill.ts <path-to-skill>
```

## Examples

**Example 1: Discipline skill (TDD enforcing)**
```
1. RED: Ask agent to implement feature without TDD skill
   -> Agent writes code first, tests after
   -> Rationalizes: "Tests after achieve same goals"
2. GREEN: Write skill with explicit "delete code written before test" rule
3. REFACTOR: Agent says "I'll adapt the existing code"
   -> Add: "Don't keep it as reference. Delete means delete."
4. VALIDATE: bun run scripts/validate-skill.ts ./tdd-skill
   -> All checks passed
```

**Example 2: Technique skill (how-to guide)**
```
1. RED: Ask agent to map a process
   -> Agent takes description at face value
   -> Misses hidden decision points
2. GREEN: Write skill with "show me artifacts" and extraction questions
3. REFACTOR: Add question bank for common hidden decisions
4. VALIDATE: All checks passed
```
