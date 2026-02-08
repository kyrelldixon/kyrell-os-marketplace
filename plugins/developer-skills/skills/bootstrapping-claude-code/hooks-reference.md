# Hooks Reference

## What Are Hooks?

Hooks are shell scripts that run in response to Claude Code events. They allow customization of behavior without modifying Claude Code itself.

## Hook Events

| Event | When It Fires | Common Uses |
|-------|---------------|-------------|
| `PreToolUse` | Before a tool executes | Block dangerous commands, require confirmation |
| `PostToolUse` | After a tool completes | Log actions, trigger follow-ups |
| `Notification` | When Claude sends notification | Custom alerts, integrations |
| `Stop` | When Claude stops | Cleanup, summaries |
| `SubagentStop` | When a subagent completes | Aggregate results |

## Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["~/.claude/hooks/validate-bash.sh"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": ["~/.claude/hooks/log-tool.sh"]
      }
    ]
  }
}
```

## Hook Input

Hooks receive JSON on stdin with event-specific data:

```json
{
  "event": "PreToolUse",
  "tool": "Bash",
  "input": { "command": "rm -rf /" }
}
```

## Hook Output

Hooks output JSON to stdout:

```json
{
  "decision": "allow",
  "additionalContext": "Optional context to add to conversation"
}
```

**Decisions:**
- `allow` — Proceed normally
- `block` — Stop the action (PreToolUse only)
- `skip` — Skip without error

## Example: Session Start Hook

```typescript
#!/usr/bin/env bun

const skillContent = await Bun.file("path/to/SKILL.md").text();

console.log(JSON.stringify({
  decision: "allow",
  additionalContext: skillContent
}));
```

## Hook Locations

- `~/.claude/hooks/` — Global hooks
- `.claude/hooks/` — Project-specific hooks

## Debugging Hooks

- Hooks run in a shell, so use `set -x` for tracing
- stderr goes to Claude Code logs
- stdout must be valid JSON
