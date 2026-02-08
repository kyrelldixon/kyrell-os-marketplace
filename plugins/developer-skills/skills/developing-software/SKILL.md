---
name: developing-software
description: Personal development workflow including commit hygiene, PR workflow, and review practices. Use when starting development tasks, creating branches, opening PRs, or requesting code reviews.
---

# Developing Software

Personal development workflow with commit hygiene, PR practices, and review standards.

## Critical Rules

### No Claude Code Attribution
**NEVER include Claude Code mentions in commits or PRs:**
- No `Co-Authored-By: Claude` lines in commits
- No "Generated with Claude Code" in PR descriptions
- No references to AI assistance

### Commit Hygiene
**NEVER use `git add .` blindly:**
- Always add specific files: `gaa` only after reviewing with `gs`
- Or stage selectively: `ga path/to/file.tsx`
- Only commit files directly related to the ticket

### Micro-Commits
Keep commits focused on ticket-related changes only. Don't bundle unrelated fixes.

## Git Aliases

Use these aliases (defined in shell):

| Alias | Command |
|-------|---------|
| `gs` | git status |
| `ga` | git add |
| `gaa` | git add . |
| `gc` | git commit |
| `gcm` | git commit -m |
| `gd` | git diff |
| `gt` | git checkout |
| `gsw` | git switch |
| `gswc` | git switch -c |
| `gb` | git branch |
| `gpush` | git push -u origin HEAD |

## Starting a Task

### 1. Get Context

If working with a ticket system (Jira, Linear, etc.), fetch ticket details first:
- Description
- Acceptance criteria
- Related tickets

### 2. Create Branch

Format: `TICKET-123-short-description`

- Flat structure, no prefixes (not `feature/`, not `username/`)
- Kebab-case description

### 3. For UI Work: Draft PR BEFORE Code Changes

**CRITICAL SEQUENCE — do not skip or reorder:**

1. **Create branch** (step 2 above)
2. **Create draft PR immediately** (before any code changes)
   - Use empty commit if needed: `gcm "WIP: TICKET-XXX" --allow-empty`
   - Push and create draft PR with screenshot placeholders
3. **STOP and wait for user** to capture "before" screenshot and add to PR
4. **Only then** make code changes
5. **STOP and wait for user** to verify fix and capture "after" screenshot
6. Commit and push
7. Edit PR (read existing content first — don't overwrite screenshots!)
8. Mark ready for review

**Why this order matters:** User needs the draft PR to exist so they have somewhere to add screenshots. They need to capture "before" state while the old behavior still exists.

## Completing a Task

### 1. Update PR Description

**ALWAYS read existing PR first** — `gh pr view` before `gh pr edit`

Don't overwrite manual edits (screenshots, custom text).

### 2. Mark Ready for Review

Convert from draft if needed: `gh pr ready`

### 3. Slack Review Request

**Include scope hints to encourage reviews.** People are more likely to click if they know it's quick.

Format: `can I get a PR review? [scope hint] that [description]: [URL]`

**Scope hints by change size:**
- One file, few lines: "one-liner", "tiny fix", "quick one"
- Small change: "small change", "light PR", "quick win"
- Medium: "straightforward change", "focused PR"
- Large: describe the scope honestly

**Examples:**
- "can I get a PR review? one-liner that hides notification settings for other users: [URL]"
- "can I get a PR review? small fix for email styling: [URL]"
- "can I get a PR review? quick win — adds validation to the form: [URL]"

Copy message to clipboard: `echo "message" | pbcopy`

## PR Description Templates

### UI Changes
```markdown
## Summary

[What changed and why]

## Changes

[Files modified]

## Before

<!-- Add screenshot of current behavior -->

## After

<!-- Add screenshot of new behavior -->
```

### Full-Stack Changes
```markdown
## Summary

[What changed and why]

## Changes

[Files modified - frontend and backend]

## Before

<!-- Add screenshot if UI changes -->

## After

<!-- Add screenshot if UI changes -->
```

### Backend Changes
```markdown
## Summary

[What changed and why]

## Changes

[Files modified]
```

## Checklists

**Starting Task:**
```
- [ ] Context gathered (ticket details, requirements)
- [ ] Branch created (TICKET-XXX-description)
- [ ] Draft PR opened with placeholders (if UI work)
- [ ] WAITED for user to add "before" screenshot
- [ ] Approach planned
```

**Completing Task:**
```
- [ ] PR description updated (read first — don't overwrite!)
- [ ] Marked ready for review
- [ ] Slack message drafted with scope hint
- [ ] Message copied to clipboard
```
