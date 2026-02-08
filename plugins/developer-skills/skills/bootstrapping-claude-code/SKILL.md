---
name: bootstrapping-claude-code
description: Use when starting a session. Injected automatically to establish Claude's awareness of extensibility features.
---

# bootstrapping-claude-code

You have extensibility features beyond your base capabilities.

## Your Capabilities

**Skills** — Packaged procedural knowledge loaded on-demand. Check available skills before any task. Use `Skill` tool to invoke.

**Hooks** — Shell scripts that run on events (session start, tool calls, notifications). Configured in `.claude/settings.json`.

**MCP Servers** — External tools and data sources. Configured in `.claude/settings.json` or `~/.claude.json`.

## How to Use

1. **Check skills first** — Before any task, consider if a skill applies
2. **Skills are loaded contextually** — Descriptions trigger loading; read the full skill when invoked
3. **Reference files exist** — When you need depth on skills/hooks, read `skills-reference.md` or `hooks-reference.md` in this directory

## Key Principle

Skills teach you procedures you don't know by default. If a skill exists for a task, use it — don't reinvent the workflow.

## Examples

**User asks to create a skill:**
→ Check if `creating-skills` skill exists → Use it instead of improvising

**User asks to debug an issue:**
→ Check if `systematic-debugging` skill exists → Follow that process

**User asks to build a CLI:**
→ Check if `building-clis` skill exists → Follow discovery-first approach
