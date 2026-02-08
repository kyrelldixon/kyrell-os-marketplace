---
name: mapping-processes
description: Use when mapping workflows, documenting processes, extracting how someone does their work, evaluating if a process can be automated, turning tacit knowledge into explicit steps.
---

# mapping-processes

Extracts real processes from operators through artifact tracing, not idealized descriptions.

**Core principle:** "Show me" beats "tell me." Trace what actually happened, not what should happen.

For the skill-ready rubric, see `rubric.md`. For extraction questions, see `extraction-questions.md`.

## The Extraction Flow

### 1. Start with a Recent Instance
Ask: "Walk me through the last time you did this. What triggered it?"

**Never** start with "describe your process" - you'll get idealized fiction.

### 2. One Question at a Time
Each message = one question. Wait for answer before next.

Probe for:
- What artifact did you look at?
- What made you decide X vs Y?
- What would have changed your decision?

### 3. Trace the Artifacts
For each decision point: "Can you show me an example?"
- A lead email they qualified
- A message they sent
- A tool they checked

### 4. Evaluate Completeness
Run against `rubric.md`. Skill-ready = all green or yellow, no red.

### 5. Triage
Output whether this is:
- **Claude-native** - Can be a skill with just instructions
- **Needs tooling** - Requires CLI/integration first

## Red Flags - You're Doing It Wrong

- Building a process doc before asking questions
- Inferring criteria from context instead of extracting from operator
- Multiple questions in one message
- Accepting "I just know" without probing deeper
- Documenting ideal instead of actual

## Quick Reference

| Do | Don't |
|----|-------|
| "Walk me through the last time..." | "Describe your process for..." |
| "Show me an example" | "What criteria do you use?" |
| One question per message | Comprehensive extraction in one turn |
| Trace artifacts | Accept descriptions |
| Ask "what would change your decision?" | Assume you understand the logic |

## Examples

**Example 1: Extracting a lead qualification process**
```
You: "Walk me through the last lead you qualified. What came in?"
Operator: "Someone from a SaaS company filled out the form"
You: "What did you look at first?"
Operator: "Their company size and role"
You: "How did you check company size?"
Operator: "LinkedIn"
You: "What size made you say yes?"
Operator: "They said 50 employees"
You: "What if they'd said 5 - would that change anything?"
Operator: "Yeah, too small for my rates"
→ Extracted: Company size threshold = decision point
```

**Example 2: Finding hidden decisions**
```
You: "You said you 'check if they're a good fit' - show me one you rejected"
Operator: "This person wanted hourly consulting"
You: "What about that made you reject?"
Operator: "I don't do hourly, only project-based"
→ Extracted: Engagement model = hidden filter (wasn't in original description)
```
