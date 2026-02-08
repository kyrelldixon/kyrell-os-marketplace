---
name: creating-skills
description: Use when creating skills, building skills, turning processes into automations, making a new skill.
---

# creating-skills

Creates skills using TDD: test first, then write, then refine.

**Core principle:** No skill without a failing test first. If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

For detailed documentation on Claude Skills, see `REFERENCE.md`. For CSO guidance, see `cso-guide.md`. For the full checklist, see `tdd-checklist.md`.

## The TDD Flow

### 1. RED: Establish Baseline
Run a scenario WITHOUT the skill. Document:
- What did the agent do wrong?
- What rationalizations did it use?
- What pressure triggered the failure?

### 2. GREEN: Write Minimal Skill
```bash
bun run scripts/init-skill.ts <skill-name> --path .claude/skills/
```
Write skill addressing those specific failures. No hypothetical cases.

### 3. REFACTOR: Close Loopholes
Run scenario WITH skill. If agent finds new workaround, add explicit counter. Repeat until bulletproof.

### 4. Validate
```bash
bun run scripts/validate-skill.ts .claude/skills/<skill-name>
```

## Quick Reference

| Phase | Action | Output |
|-------|--------|--------|
| RED | Run scenario without skill | Documented failures |
| GREEN | Scaffold + write skill | SKILL.md addressing failures |
| REFACTOR | Re-test, plug holes | Bulletproof skill |
| VALIDATE | Run validation script | All checks pass |

## CSO Rules (Critical)

Description = triggers only. Never summarize workflow.

```yaml
# BAD: Summarizes workflow
description: Use when creating skills - scaffolds directory, runs TDD cycle

# GOOD: Triggers only
description: Use when creating skills, building skills, turning processes into automations
```

See `cso-guide.md` for full guidance.

## Examples

**Example 1: Discipline skill (TDD enforcing)**
```
1. RED: Ask agent to implement feature without TDD skill
   → Agent writes code first, tests after
   → Rationalizes: "Tests after achieve same goals"
2. GREEN: Write skill with explicit "delete code written before test" rule
3. REFACTOR: Agent says "I'll adapt the existing code"
   → Add: "Don't keep it as reference. Delete means delete."
4. VALIDATE: bun run scripts/validate-skill.ts ./tdd-skill
   → ✓ All checks passed
```

**Example 2: Technique skill (how-to guide)**
```
1. RED: Ask agent to map a process
   → Agent takes description at face value
   → Misses hidden decision points
2. GREEN: Write skill with "show me artifacts" and extraction questions
3. REFACTOR: Add question bank for common hidden decisions
4. VALIDATE: ✓ All checks passed
```
