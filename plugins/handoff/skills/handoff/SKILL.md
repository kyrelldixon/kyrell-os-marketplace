---
name: handoff
description: Use when ending a session, starting a fresh session, continuing later, handing off context, picking up where we left off, /handoff.
---

# handoff

Ensures Linear has full context, then generates a handoff prompt for the next session. **Linear is the durable handoff — the clipboard prompt is a convenience.**

## Process

### 1. Identify active tickets

Scan the conversation for all Linear tickets that were worked on, discussed, or are next. Include tickets that were:
- Created this session
- Updated this session
- Referenced but not touched (still relevant context)

### 2. Sync Linear

For EACH active ticket, run `linear issue show <id> --comments --json` to check current state. Then ensure:

- **Status is accurate** — If work was done, is the ticket In Progress or Done? Update if stale.
- **Comments capture session context** — Decisions made, blockers hit, what was built, what's next. If the ticket's comments don't reflect what happened this session, add a comment.
- **No orphaned context** — If important decisions or understanding from this conversation aren't in ANY ticket's comments, add them to the most relevant ticket.

Show the user what you're updating before doing it. Don't silently modify tickets.

### 3. Generate the handoff prompt

```
I'm working on [project/area]. Read [plan doc path] and check Linear for [ticket identifier(s)] with --comments.

[1-2 sentences of session context that adds color beyond what's in Linear]

The next step is [specific ticket or action]. [Reference repo/file if relevant]. Let's start on [ticket].
```

### 4. Deliver

- Copy prompt to clipboard with `pbcopy`
- Also post the handoff prompt as a comment on the primary active ticket (so it's accessible from any machine)

## Rules

- **Linear first, prompt second.** Never generate the prompt until Linear is synced.
- **Concise over comprehensive.** The prompt should be 3-5 sentences max. Point to artifacts, don't repeat their content.
- **Always use `--comments`** when checking ticket state. Comments ARE the context.
- **Include file paths.** Always use full paths so the next session can read them immediately.
- **Include Linear identifiers.** Use KYR-XX format so the next session can look them up.
- **The prompt says `--comments`.** Always include "with --comments" in the handoff prompt so the next session loads full context.

## Examples

**Example 1: Clean handoff**
```
User: "/handoff"
→ Identifies active tickets: KYR-70 (In Progress), KYR-49 (In Progress)
→ Checks Linear: KYR-70 has no comment about today's work
→ Shows user: "KYR-70 needs a progress comment. I'll add: 'Worker scaffolded and committed...'"
→ User approves, comment added
→ Generates prompt, copies to clipboard
→ Posts prompt as comment on KYR-70
```

**Example 2: Stale status**
```
User: "handoff"
→ Identifies active tickets: KYR-47 (was completed this session but still shows In Progress)
→ Shows user: "KYR-47 should be Done — want me to update it?"
→ User: "yeah"
→ Updates status, generates prompt
```

**Example 3: Cross-repo context**
```
User: "/handoff" (in agent-worker repo)
→ Identifies: work done here relates to KYR-70 in kyrell-os Linear
→ Adds comment to KYR-70 with agent-worker repo context
→ Handoff prompt references both repos
→ Next session in any repo can pick up via Linear
```
