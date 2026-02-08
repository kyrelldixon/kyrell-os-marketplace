---
name: using-acli
description: Use acli (Atlassian CLI) for Jira. USE WHEN jira, ticket, issue, acli, view ticket, create ticket, update ticket, change status, add comment.
---

# using-acli

Command reference for acli (Atlassian CLI) for Jira operations.

**Always use `--json` flag** for parseable output.

## View Issue

```bash
acli jira workitem view KEY-123 --json
```

Returns: key, summary, description, status, assignee, issue type.

To get specific fields:
```bash
acli jira workitem view KEY-123 --fields "summary,status,comment" --json
```

## Search Issues

```bash
# By assignee
acli jira workitem search --jql "assignee = currentUser()" --json

# By project and status
acli jira workitem search --jql "project = PROJ AND status = 'In Progress'" --json

# With field selection
acli jira workitem search --jql "project = PROJ" --fields "key,summary,status" --json
```

Common JQL patterns:
- `project = PROJ` - issues in project
- `assignee = currentUser()` - my issues
- `status = 'In Progress'` - by status (quote multi-word statuses)
- `status IN ('To Do', 'In Progress')` - multiple statuses
- `updated >= -7d` - updated in last 7 days

## Create Issue

```bash
acli jira workitem create \
  --project PROJ \
  --type Task \
  --summary "Issue title" \
  --description "Issue description" \
  --json
```

Types: Epic, Story, Task, Bug, Subtask

Optional flags:
- `--assignee user@email.com` or `--assignee @me`
- `--parent KEY-123` (for subtasks)
- `--label "label1,label2"`

## Edit Issue

Edit fields (not status):
```bash
acli jira workitem edit --key KEY-123 --summary "New title" --json
acli jira workitem edit --key KEY-123 --description "New description" --json
acli jira workitem edit --key KEY-123 --assignee @me --json
```

## Transition Issue (Change Status)

```bash
acli jira workitem transition --key KEY-123 --status "In Progress" --json
acli jira workitem transition --key KEY-123 --status "Done" --json
```

**Note:** Use `transition` for status changes, `edit` for other fields.

## Add Comment

```bash
acli jira workitem comment create --key KEY-123 --body "Comment text" --json
```

## Quick Reference

| Action | Command |
|--------|---------|
| View issue | `acli jira workitem view KEY-123 --json` |
| Search issues | `acli jira workitem search --jql "..." --json` |
| Create issue | `acli jira workitem create --project PROJ --type Task --summary "..." --json` |
| Edit issue | `acli jira workitem edit --key KEY-123 --summary "..." --json` |
| Change status | `acli jira workitem transition --key KEY-123 --status "..." --json` |
| Add comment | `acli jira workitem comment create --key KEY-123 --body "..." --json` |
