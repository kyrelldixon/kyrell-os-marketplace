---
name: using-tmx
description: Interact with tmux sessions for process observability. USE WHEN tmux, tmx, session, pane, send keys, capture output, watch process, dev server, tail logs, long-running process, observe process, send command to pane.
---

# using-tmx

Observe and interact with persistent processes (dev servers, log tails, builds, test watchers) via tmux. Uses the `tmx` CLI which wraps tmux with reliability fixes baked in.

**IMPORTANT:** Always use `tmx` instead of raw `tmux` commands. Raw `tmux send-keys` has a timing bug where Enter can be lost. `tmx` fixes this automatically.

## Commands Quick Reference

```bash
# List sessions
tmx list-sessions [--json] [--socket <name>]

# Create a new detached session
tmx new-session <name> [--dir <path>] [--window <name>] [--json] [--socket <name>]

# Send keys to a pane (timing fix baked in: text → delay → Enter)
tmx send-keys <target> <text> [--no-enter] [--delay <seconds>] [--no-literal] [--json] [--socket <name>]

# Capture pane contents
tmx capture-pane <target> [--lines <n>] [--json] [--socket <name>]

# Kill a session
tmx kill-session <name> [--json] [--socket <name>]

# Wait for regex pattern to appear in pane
tmx wait-for-text <target> <pattern> [--timeout <seconds>] [--interval <seconds>] [--lines <n>] [--json] [--socket <name>]
```

## When to Use What

| Situation | Command |
|-----------|---------|
| See what's running | `tmx list-sessions` |
| Start a process to watch | `tmx new-session dev && tmx send-keys dev "npm run dev"` |
| Send a command to a running session | `tmx send-keys <target> "command"` |
| Read current output | `tmx capture-pane <target>` |
| Read scrollback history | `tmx capture-pane <target> --lines 500` |
| Wait for server to start | `tmx wait-for-text dev "listening on port"` |
| Wait for build to finish | `tmx wait-for-text build "Build complete\|error" --timeout 60` |
| Type without executing | `tmx send-keys <target> "partial" --no-enter` |
| Clean up a session | `tmx kill-session <name>` |

## Target Format

Targets follow tmux conventions:
- Session name: `dev` (targets first window, first pane)
- Session + window: `dev:1`
- Session + window + pane: `dev:1.0`
- Window index in current session: `:1`

## Process

When observing a process:

1. Check if session exists: `tmx list-sessions --json`
2. Create if needed: `tmx new-session <name>`
3. Send command: `tmx send-keys <target> "command"`
4. Wait for readiness: `tmx wait-for-text <target> "pattern"`
5. Read output as needed: `tmx capture-pane <target> --lines 200`

## JSON Output

All commands support `--json`. Key structures:

**list-sessions:**
```json
[{ "name": "dev", "attached": false, "windows": 1, "created": "2026-02-08T18:00:00.000Z" }]
```

**capture-pane:**
```json
{ "content": "line1\nline2\n..." }
```

**wait-for-text:**
```json
{ "matched": true, "match": "listening on port 3000", "elapsed": 1.2, "lastCapture": "..." }
```

**send-keys:**
```json
{ "target": "dev", "sent": true }
```

## Notes

- **Timing fix:** `send-keys` automatically separates text from Enter with a 0.1s delay. Increase with `--delay 0.5` if the target shell is slow.
- **wait-for-text exits 1 on timeout** — use this for conditional logic.
- **Regex patterns:** `wait-for-text` uses JavaScript regex syntax. Escape special chars: `\.`, `\|`, `\$`.
- **Scrollback:** Default `--lines` for `wait-for-text` is 1000. For `capture-pane` it captures visible area only unless `--lines` is specified.
- **Sessions are detached** — `new-session` creates detached sessions (agent-friendly). The user can attach separately if they want.
