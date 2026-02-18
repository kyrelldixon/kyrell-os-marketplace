---
name: using-acli
description: Use acli (Atlassian CLI) for Jira. USE WHEN jira, ticket, issue, acli, view ticket, create ticket, update ticket, change status, add comment.
---

# using-acli

Command reference for acli (Atlassian CLI) for Jira operations.

**Always use `--json` flag** for parseable output.

## Response Shapes

Commands return two different JSON shapes. Use these to correctly interpret output.

### Issue object (view, create, search)

`view` and `create` return a single issue object. `search` returns an array of them.

```ts
interface Issue {
  key: string              // "PC-123"
  fields: {
    summary: string
    status: { name: string }           // "In Progress", "Done", "Created"
    issuetype: { name: string }        // "Task", "Scope", "Pitch"
    assignee: { displayName: string } | null
    parent?: { key: string, fields: { summary: string } }
    description: { content: [...] } | null  // Atlassian Document Format
    comment?: { comments: [...] }
    // ...other Jira fields
  }
}
```

### Mutation result (edit, transition, comment create)

```ts
interface MutationResult {
  results: Array<{
    status: "SUCCESS" | "ERROR"
    message: string        // "Work item PC-123 has been successfully edited"
    id: string             // "PC-123"
  }>
  totalCount: number
  successCount: number
}
```

### Filtering with bun -e (optional)

When output is verbose, pipe through `bun -e` to extract relevant fields:

```bash
# Search: extract a summary table
acli jira workitem search --jql "project = PROJ" --fields "key,summary,status,issuetype" --json | bun -e '
  const data = JSON.parse(await Bun.stdin.text());
  for (const i of data) console.log(i.key, i.fields.issuetype.name, i.fields.summary, "|", i.fields.status.name);
'

# Mutation: confirm success
acli jira workitem edit --key KEY-123 --assignee @me --json | bun -e '
  const d = JSON.parse(await Bun.stdin.text());
  for (const r of d.results) console.log(r.id, r.status, r.message);
'
```

## Commands

### View Issue

```bash
acli jira workitem view KEY-123 --json
```

To get specific fields:
```bash
acli jira workitem view KEY-123 --fields "summary,status,comment" --json
```

### Search Issues

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

### Create Issue

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

### Edit Issue

Edit fields (not status):
```bash
acli jira workitem edit --key KEY-123 --summary "New title" --json
acli jira workitem edit --key KEY-123 --description "New description" --json
acli jira workitem edit --key KEY-123 --assignee @me --json
```

### Transition Issue (Change Status)

```bash
acli jira workitem transition --key KEY-123 --status "In Progress" --json
acli jira workitem transition --key KEY-123 --status "Done" --json
```

**Note:** Use `transition` for status changes, `edit` for other fields.

### Add Comment

```bash
acli jira workitem comment create --key KEY-123 --body "Comment text" --json
```

## Quick Reference

| Action | Command | Response |
|--------|---------|----------|
| View issue | `acli jira workitem view KEY-123 --json` | Issue object |
| Search issues | `acli jira workitem search --jql "..." --json` | Issue[] |
| Create issue | `acli jira workitem create --project PROJ --type Task --summary "..." --json` | Issue object |
| Edit issue | `acli jira workitem edit --key KEY-123 --summary "..." --json` | MutationResult |
| Change status | `acli jira workitem transition --key KEY-123 --status "..." --json` | MutationResult |
| Add comment | `acli jira workitem comment create --key KEY-123 --body "..." --json` | MutationResult |
