# TDD Checklist for Skills

Use this checklist for EACH skill. No exceptions.

## RED Phase - Establish Baseline

- [ ] Define pressure scenario (what situation tests the skill?)
- [ ] Run scenario WITHOUT skill loaded
- [ ] Document agent behavior verbatim
- [ ] Identify patterns in failures/rationalizations
- [ ] Note which pressures triggered violations

## GREEN Phase - Write Minimal Skill

- [ ] Run `init-skill.ts` to scaffold
- [ ] Name: kebab-case, gerund form for processes (`creating-skills` not `create-skill`)
- [ ] Description: "Use when..." format, triggers only, NO workflow summary
- [ ] Overview with core principle (1-2 sentences)
- [ ] Address specific baseline failures (not hypothetical)
- [ ] Include concrete examples
- [ ] Keep under 500 words (move heavy reference to separate files)
- [ ] Run scenario WITH skill - verify compliance

## REFACTOR Phase - Close Loopholes

- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters for each rationalization
- [ ] Build rationalization table (Excuse | Reality)
- [ ] Create red flags list for self-checking
- [ ] Re-test until bulletproof

## Quality Checks

- [ ] Token budget: SKILL.md < 500 words
- [ ] No workflow summary in description
- [ ] Description uses "Use when..." (not "USE WHEN")
- [ ] Has Examples section with real content
- [ ] Flowcharts only for non-obvious decisions
- [ ] Quick reference table for scanning

## Validation

```bash
bun run scripts/validate-skill.ts <path-to-skill>
```

All checks must pass before deployment.

## Common Rationalizations (Add Your Own)

| Excuse | Reality |
|--------|---------|
| "Skill is obviously clear" | Clear to you ≠ clear to agents. Test it. |
| "It's just a reference" | References have gaps. Test retrieval. |
| "Testing is overkill" | Untested skills fail. Always. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Too late. |
| "No time to test" | Deploying untested wastes more time fixing. |

## Red Flags - STOP and Start Over

- Writing skill before baseline test
- "The skill is simple, no need to test"
- "I'll add counters later"
- "Testing takes too long"
- Moving to next skill before validating current one
