# Skill-Ready Rubric

A process is skill-ready when it can be documented well enough that Claude can execute it. Use this rubric to evaluate completeness.

## Evaluation Criteria

| Component | Complete (Green) | Partial (Yellow) | Missing (Red) |
|-----------|------------------|------------------|---------------|
| **Trigger** | Specific signal ("form submitted", "email received") | Vague signal ("when needed") | Not stated |
| **Inputs** | All prereqs listed with sources | Some listed | Just "info" or "context" |
| **Steps** | Tools + specific actions | High-level actions only | Vague verbs ("handle", "process") |
| **Decision points** | Criteria explicit with thresholds | "I decide based on..." | Not captured |
| **Variations** | Conditions + branches documented | "Sometimes I..." | Not captured |
| **Quality checks** | Measurable criteria | Subjective ("looks good") | Not captured |
| **Failure modes** | Problem + recovery steps | "It breaks sometimes" | Not captured |
| **Boundaries** | What stays manual + why | Implicit | Not captured |

## Skill-Ready = All Green or Yellow, No Red

If any component is red, you need more extraction before building the skill.

## How to Use

After extraction, go through each row:

1. **Trigger** - Do you know exactly what starts this process?
2. **Inputs** - Do you know everything the operator needs before starting?
3. **Steps** - Can you list the exact actions with tools used?
4. **Decision points** - For each "I decide...", do you know the criteria?
5. **Variations** - Are all the "sometimes" and "unless" cases captured?
6. **Quality checks** - How does the operator know they did it right?
7. **Failure modes** - What goes wrong and how do they fix it?
8. **Boundaries** - What parts stay manual and why?

## Common Gaps

| What operator says | What's actually missing |
|--------------------|------------------------|
| "I check if they're a good fit" | Decision criteria |
| "I usually..." | Variation conditions |
| "It depends" | Decision tree |
| "I just know" | Implicit expertise to extract |
| "Sometimes I..." | Trigger for the variation |

## Triage After Evaluation

**Claude-native** (skill only):
- All inputs available in conversation
- No external systems to query
- Decisions based on text/context

**Needs tooling** (CLI first):
- Requires API calls (CRM, email, etc.)
- Needs data from external systems
- Has integrations as steps
