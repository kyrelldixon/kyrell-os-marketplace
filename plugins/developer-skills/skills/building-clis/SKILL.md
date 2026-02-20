---
name: building-clis
description: Use when building CLI tools, creating integrations, connecting to external APIs, automating external systems, need a command-line interface.
---

# Building CLIs

Agent-first CLI tools. **Discovery-first:** the best CLI is one you don't have to build.

## Philosophy

CLIs are **agent-first, human-distant-second**. Agents are the primary user. Humans use GUIs or pipe through `jq`. Full framework: `~/kyrell-os-vault/artifacts/AX - Agent Experience.md`

| Principle | Rule |
|-----------|------|
| **JSON always** | Every command returns JSON. No plain text, tables, colors. No `--json` flag — JSON is the only format. |
| **Familiarity** | Match `gh`/`git`/`npm` conventions. `tool verb noun --flags`. Accept multiple ID formats. |
| **Desire paths** | When agents hallucinate a flag — add it as an alias. Build for actual agent behavior. |
| **Minimize friction** | Sensible defaults. Idempotent ops. Graceful degradation. Agents abandon fast. |
| **Merge over replace** | Write ops merge by default. Agents work with partial data. `--replace` for destructive. |
| **Actionable errors** | No stack traces. One message, one self-correction. See `agent-output.md` for error envelope. |

## The Flow

### 1. DISCOVER: Check what exists

**Before writing any code, search for existing solutions.**

```bash
npm search <service-name> cli
gh search repos "<service-name> cli" --limit 10
```

Does an official CLI exist? Is there a well-maintained npm package? A GitHub repo that does 80% of what you need?

**If something exists:** Use it. Fork it. Wrap it. Don't rebuild.

### 2. EVALUATE: Is building justified?

Only build if ALL are true:
- No official CLI or npm package does what you need
- No GitHub repo is close enough to fork/adapt
- The integration will be used repeatedly (not one-off)

### 3. BUILD: Scaffold

**Stack:** Bun + TypeScript + citty + Zod 4 + Biome

```bash
mkdir <cli-name> && cd <cli-name>
bun init -y
bun add citty zod
bun add -D @biomejs/biome typescript @types/bun
```

See `patterns.md` for full project setup (package.json with `bin` field, tsconfig, biome.json, directory structure, citty patterns).

### 4. VALIDATE: Does it work?

```bash
bun run src/cli.ts              # Root: should return command tree JSON
bun run src/cli.ts --help       # Help output
bun run src/cli.ts <command>    # Happy path
bun run src/cli.ts              # Missing required args → actionable error
```

**REQUIRED:** Use `developer-skills:test-driven-development` for testing approach. E2E tests matter most for CLIs — seed data, run command, assert JSON output, verify side effects.

### 5. INSTALL: Get it on PATH

```bash
# Development — symlink via bun
bun link

# Distribution — compile to standalone binary
bun build src/cli.ts --compile --outfile cli-name
cp cli-name ~/.bun/bin/
```

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Plain text / table output | JSON envelope |
| `--json` flag to opt into JSON | JSON is the only format |
| ANSI colors or formatting | Raw JSON — agents parse, not read |
| Dump unbounded output | Truncate + file pointer for full output |
| `Error: something went wrong` | `{ ok: false, error: {...}, fix: "..." }` |
| Undiscoverable commands | Root returns full command tree |
| Static `--help` as only docs | Self-documenting root + HATEOAS next_actions |
| `console.log("Success!")` | `{ ok: true, result: {...} }` |
| Confirmation prompts | Just do it — agents don't fat-finger |
| Progress bars / spinners | Agents just wait for stdout |
| Replace-by-default writes | Merge by default, `--replace` for destructive |
| Required config files | Sensible defaults, optional config |
| Novel command syntax | Match `gh`/`git`/`npm` conventions |

## Checklist

### New command
- [ ] Returns JSON envelope (`ok`, `command`, `result`, `next_actions`)
- [ ] Error responses include `fix` field
- [ ] Root command lists this command in its tree
- [ ] Output is context-safe (truncated if potentially large)
- [ ] `next_actions` are contextual to what just happened
- [ ] No plain text output anywhere
- [ ] Works when piped (no TTY detection)

### New CLI project
- [ ] `package.json` has `bin` field
- [ ] Biome configured
- [ ] Builds and installs to `~/.bun/bin/`
- [ ] Root command returns self-documenting command tree
- [ ] E2E tests for core commands

## Examples

**Example 1: Linear API integration needed**
```
1. DISCOVER: npm search linear cli → found @linear/sdk + existing CLIs
2. EVALUATE: Existing SDK works but no CLI with agent-first output
3. BUILD: citty CLI wrapping @linear/sdk, JSON envelope on every command
4. VALIDATE: `linear issue list` returns { ok, command, result, next_actions }
5. INSTALL: bun link for dev, bun build --compile for ~/.bun/bin/
→ Result: ~/.kos-kit/tools/linear/ — full reference implementation
```

**Example 2: Google Docs export needed**
```
1. DISCOVER: No CLI for exporting Google Docs as markdown
2. EVALUATE: ✓ No CLI exists, ✓ used repeatedly
3. BUILD: Single-command CLI with citty, Google API auth via config file
4. VALIDATE: `gog export <doc-id>` returns JSON with markdown content
5. INSTALL: bun link
```

**Example 3: Airtable integration needed**
```
1. DISCOVER: npm search airtable cli → multiple existing packages
2. EVALUATE: Existing tools cover the use case
3. RESULT: Use existing package, don't build
```

## References

- **`agent-output.md`** — Full agent-first output spec (JSON envelope, HATEOAS, self-documenting tree, error design)
- **`patterns.md`** — Stack patterns (citty, auth, validation, HTTP, installability)
- **`developer-skills:test-driven-development`** — Testing approach
- **`~/.kos-kit/tools/linear/`** — Reference implementation (Bun + citty CLI with subcommands, auth, config)
- **`~/kyrell-os-vault/artifacts/AX - Agent Experience.md`** — Full AX framework
