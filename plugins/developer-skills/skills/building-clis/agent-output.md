# Agent-First Output Design

Every CLI command returns a structured JSON envelope. Agents parse JSON; they don't parse prose.

## JSON Envelope

### Success

```typescript
{
  ok: true,
  command: string,          // the command that was run
  result: object,           // command-specific payload
  next_actions: Array<{
    command: string,        // command template or literal
    description: string,    // what it does
    params?: Record<string, {
      description?: string,
      value?: string | number,  // pre-filled from context
      default?: string | number,
      enum?: string[],
      required?: boolean
    }>
  }>
}
```

### Error

```typescript
{
  ok: false,
  command: string,
  error: {
    message: string,        // what went wrong
    code: string            // machine-readable error code
  },
  fix: string,              // plain-language suggested fix
  next_actions: Array<...>  // same shape as success
}
```

## HATEOAS — Every Response Tells You What to Do Next

Every response includes `next_actions` — command **templates** the agent can run next. Templates use POSIX placeholder syntax:

- `<placeholder>` — required argument
- `[--flag <value>]` — optional flag with value
- `[--flag]` — optional boolean flag
- No `params` field — literal command (run as-is)
- `params` present — template (agent fills placeholders)
- `params.*.value` — pre-filled from context (agent can override)
- `params.*.default` — value if omitted
- `params.*.enum` — valid choices

```json
{
  "ok": true,
  "command": "linear issue create \"Fix auth bug\"",
  "result": {
    "identifier": "KYR-42",
    "title": "Fix auth bug",
    "url": "https://linear.app/kyrell-personal/issue/KYR-42"
  },
  "next_actions": [
    {
      "command": "linear issue show <identifier> [--comments]",
      "description": "View the created issue",
      "params": {
        "identifier": { "value": "KYR-42", "description": "Issue identifier" }
      }
    },
    {
      "command": "linear issue update <identifier> [--status <status>] [--priority <priority>]",
      "description": "Update issue status or priority",
      "params": {
        "identifier": { "value": "KYR-42" },
        "status": { "enum": ["Backlog", "Todo", "In Progress", "Done"] },
        "priority": { "enum": ["none", "urgent", "high", "medium", "low"] }
      }
    },
    {
      "command": "linear issue list",
      "description": "List all issues"
    }
  ]
}
```

`next_actions` are **contextual** — they change based on what just happened. A failed command suggests different next steps than a successful one.

## Self-Documenting Root

The root command (no args) returns the full command tree. One call, full discovery:

```json
{
  "ok": true,
  "command": "linear",
  "result": {
    "description": "CLI for interacting with Linear",
    "version": "0.1.0",
    "commands": [
      { "name": "issue", "description": "Manage issues", "subcommands": [
        { "name": "create", "usage": "linear issue create <title> [--project <name>] [--status <status>]" },
        { "name": "list", "usage": "linear issue list [--status <status>] [--project <id>]" },
        { "name": "show", "usage": "linear issue show <identifier> [--comments]" },
        { "name": "update", "usage": "linear issue update <identifier> [--status <status>]" }
      ]},
      { "name": "project", "description": "Manage projects", "subcommands": [
        { "name": "list", "usage": "linear project list" },
        { "name": "show", "usage": "linear project show <id>" }
      ]}
    ]
  },
  "next_actions": [
    { "command": "linear issue list", "description": "List all issues" },
    { "command": "linear project list", "description": "List all projects" }
  ]
}
```

## Context-Protecting Output

Agents have finite context windows. CLI output must not blow them up.

- Terse by default — minimum viable output
- Auto-truncate large outputs at a reasonable limit
- When truncated, include a file path to the full output

```json
{
  "ok": true,
  "command": "linear issue list",
  "result": {
    "count": 20,
    "total": 4582,
    "truncated": true,
    "full_output": "/tmp/linear-issues-abc123.json",
    "items": ["...first 20 items..."]
  },
  "next_actions": [
    {
      "command": "linear issue list [--limit <limit>] [--status <status>]",
      "description": "Filter or paginate results",
      "params": {
        "limit": { "default": 20, "description": "Number of results" },
        "status": { "enum": ["Backlog", "Todo", "In Progress", "Done"] }
      }
    }
  ]
}
```

## Errors Suggest Fixes

When something fails, the `fix` field tells the agent exactly what to do:

```json
{
  "ok": false,
  "command": "linear issue create \"Bug fix\"",
  "error": {
    "message": "Not authenticated",
    "code": "AUTH_REQUIRED"
  },
  "fix": "Run 'linear auth' to authenticate with Linear API",
  "next_actions": [
    { "command": "linear auth", "description": "Authenticate with Linear" }
  ]
}
```

## TypeScript Types

```typescript
type NextAction = {
  command: string;
  description: string;
  params?: Record<string, {
    description?: string;
    value?: string | number;
    default?: string | number;
    enum?: string[];
    required?: boolean;
  }>;
};

type SuccessResponse = {
  ok: true;
  command: string;
  result: unknown;
  next_actions: NextAction[];
};

type ErrorResponse = {
  ok: false;
  command: string;
  error: { message: string; code: string };
  fix: string;
  next_actions: NextAction[];
};

type CLIResponse = SuccessResponse | ErrorResponse;
```

## Helper Implementation

```typescript
function success(command: string, result: unknown, nextActions: NextAction[]): void {
  console.log(JSON.stringify({ ok: true, command, result, next_actions: nextActions }));
  process.exit(0);
}

function error(command: string, message: string, code: string, fix: string, nextActions: NextAction[] = []): void {
  console.log(JSON.stringify({ ok: false, command, error: { message, code }, fix, next_actions: nextActions }));
  process.exit(1);
}
```
