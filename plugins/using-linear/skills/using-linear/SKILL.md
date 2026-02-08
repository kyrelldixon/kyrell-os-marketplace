---
name: using-linear
description: Manage Linear issues and projects via CLI. USE WHEN linear, issue, project, task, work item, create issue, update issue, show issue, list issues, delete issue, create project, update project, delete project, track this, add to linear, what's the status, mark as done, in progress, backlog, /linear.
---

# using-linear

Manages Linear issues and projects from conversation using the `linear` CLI.

For conventions on how Linear is used, see REFERENCE.md.

## Commands Quick Reference

### Issues

```bash
# Create
linear issue create "Title" [--team <key>] [--project <id>] [--parent <id>] [--description "text"] [--cycle current|next|previous|none] [--due-date today|tomorrow|YYYY-MM-DD] [--priority none|urgent|high|medium|low] [--label "name1,name2"] [--json]

# Read
linear issue list [--team <key>] [--project <id>] [--status <status>] [--cycle current|next|previous] [--due-date today|YYYY-MM-DD] [--priority <level>] [--label <name>] [--json]
linear issue show <identifier> [--comments] [--json]

# Update
linear issue update <identifier> [--status <status>] [--title "text"] [--description "text"] [--project <id>] [--cycle current|next|previous|none] [--due-date today|tomorrow|YYYY-MM-DD] [--priority <level>] [--label "name1,name2"] [--json]

# Link
linear issue link <source> <target> --blocks|--blocked-by|--relates-to|--duplicate-of [--json]

# Comment
linear issue comment <identifier> "message" [--json]

# Delete (soft - moves to Canceled)
linear issue delete <identifier> [--json]
```

### Labels

```bash
# Create
linear label create "Name" [--team <key>] [--color "#hex"] [--json]

# Read
linear label list [--team <key>] [--json]
```

### Projects

```bash
# Create
linear project create "Name" [--team <key>] [--description "text"] [--json]

# Read
linear project list [--team <key>] [--json]
linear project show <id> [--json]

# Update
linear project update <id> [--name "text"] [--description "text"] [--state <state>] [--json]

# Delete (soft - moves to canceled)
linear project delete <id> [--json]
```

**Project states:** backlog, planned, started, paused, completed, canceled

### Other

```bash
linear team list [--json]
linear sync [--json]   # Refresh teams and statuses cache
```

## When to Use What

| Situation | Command |
|-----------|---------|
| Single task to track | `issue create` |
| Initiative with multiple steps | `project create`, then issues |
| Breaking down a project | `issue create --project <id>` |
| Sub-task of existing issue | `issue create --parent <id>` |
| Start working on an issue | `issue update --status "In Progress"` |
| Complete an issue | `issue update --status "Done"` |
| Add progress notes | `issue comment` |
| View issue with comments | `issue show <id> --comments` |
| Move issue to project | `issue update <id> --project <project-id>` |
| Remove/cancel an issue | `issue delete` |
| View project details | `project show <id>` |
| Change project state | `project update <id> --state started` |
| Remove/cancel a project | `project delete` |
| Add issue to current cycle | `issue create --cycle current` or `issue update --cycle current` |
| Remove issue from cycle | `issue update --cycle none` |
| Set a deadline | `issue create --due-date tomorrow` or `issue update --due-date 2026-02-10` |
| Set priority | `issue create --priority high` or `issue update --priority urgent` |
| Tag with labels | `issue create --label "bug,urgent"` |
| See what's on my plate this week | `issue list --cycle current` |
| Filter by priority | `issue list --priority high` |
| Filter by due date | `issue list --due-date today` |
| Block another issue | `issue link KYR-52 KYR-53 --blocks` |
| Create a label | `label create "bug" --color "#FF0000"` |
| List labels | `label list` |

## Process

When invoked:

1. Review conversation for work items to manage
2. Determine the action (create, read, update, delete)
3. For creates: draft title and description, confirm with user
4. Run CLI with `--json` flag
5. Parse response and share relevant info (URL, status, etc.)

## Team Selection

- Default team comes from `~/.linear-cli/config.json`
- Use team keys (e.g., `KYR`) not full names
- Run `linear team list` to see available teams
- Run `linear sync` to refresh teams from Linear
- Override with `--team <key>` flag

## JSON Output Structure

When using `--json` flag, parse these field paths:

**Issues:**
```
.identifier      → "KYR-47"
.title           → "VPS Setup"
.state.name      → "Done" | "In Progress" | "Backlog" | etc.
.url             → Linear URL
.project.name    → Parent project name (if any)
.priority        → 0-4 (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
.priorityLabel   → "None" | "Urgent" | "High" | "Medium" | "Low"
.dueDate         → "2026-02-10" or null
.cycle.name      → "Week 6" or null
.cycle.number    → 6 or null
.labels[]        → Array of { name, color }
.relations       → { blocks[], blockedBy[], relatesTo[], duplicateOf[] }
.comments[]      → Array of comments (when using --comments)
```

**Projects:**
```
.id              → UUID (use for updates)
.name            → "Agent Infrastructure MVP"
.state           → "backlog" | "planned" | "started" | "paused" | "completed" | "canceled"
.url             → Linear URL
.issueCount      → Number of issues
```

**IMPORTANT:** Issue status is `.state.name` (nested), NOT `.status`. Project state is `.state` (string, not nested).

## Notes

- **Auto-assign:** Issues created via CLI are automatically assigned to the authenticated user.
- **Cycles:** Weekly cycles start on Sundays. Between cycles (e.g., mid-week after one ends), `--cycle current` will error — use `--cycle next` instead.
- **Project descriptions:** Limited to 255 characters. Use short summary + vault link.
- **Soft deletes:** Delete commands move items to Canceled state, not permanent deletion.
- **Issue identifiers:** Use `KYR-21` format or UUID.
- **Comments:** Use `--comments` flag on `issue show` to see discussion.
