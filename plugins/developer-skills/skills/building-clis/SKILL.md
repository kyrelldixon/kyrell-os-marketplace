---
name: building-clis
description: Use when building CLI tools, creating integrations, connecting to external APIs, automating external systems, need a command-line interface.
---

# building-clis

Builds CLI tools for external system integrations. **Discovery-first:** the best CLI is one you don't have to build.

## The Flow

### 1. DISCOVER: Check What Exists

**Before writing any code, search for existing solutions.**

```bash
# Check npm for existing CLIs
npm search <service-name> cli

# Check GitHub
gh search repos "<service-name> cli" --limit 10

# Check if official CLI exists
# Many services have official CLIs: gh, linear, vercel, netlify, aws, etc.
```

**Questions to answer:**
- Does an official CLI exist?
- Is there a well-maintained npm package?
- Is there a GitHub repo that does 80% of what you need?

**If something exists:** Use it. Fork it. Wrap it. Don't rebuild.

### 2. EVALUATE: Is Building Justified?

Only build if ALL are true:
- [ ] No official CLI exists
- [ ] No npm package does what you need
- [ ] No GitHub repo is close enough to fork/adapt
- [ ] The integration will be used repeatedly (not one-off)

**If any checkbox fails:** Use the existing tool instead.

### 3. BUILD: Minimal Implementation

**Stack:** Bun + TypeScript + citty

```bash
mkdir <cli-name> && cd <cli-name>
bun init -y
bun add citty
```

**Minimal structure:**
```
cli-name/
├── src/
│   └── index.ts    # Everything in one file until it hurts
├── package.json
└── tsconfig.json
```

**Rules:**
- One file until complexity demands more
- No separate "client" module for single API
- No docs beyond README until needed
- No tests until behavior stabilizes

### 4. VALIDATE: Does It Work?

```bash
# Test the happy path
bun run src/index.ts --help
bun run src/index.ts <actual-args>

# Test error cases
bun run src/index.ts  # missing required args
```

## Patterns Reference

See `patterns.md` for:
- Authentication patterns (env vars, config files)
- Error handling patterns
- Output formatting (JSON, table, human-readable)
- Pagination patterns

## Examples

**Example 1: Airtable integration needed**
```
1. DISCOVER:
   → npm search airtable cli
   → Found: airtable-cli, several wrappers
   → Check GitHub: official JS SDK exists
2. EVALUATE:
   → Existing tools cover the use case
3. RESULT: Use existing package, don't build
```

**Example 2: Custom internal API**
```
1. DISCOVER:
   → No public CLI (internal system)
   → No npm packages
2. EVALUATE:
   → ✓ No official CLI
   → ✓ No npm package
   → ✓ Will be used daily
3. BUILD:
   → Single index.ts with citty
   → Auth via INTERNAL_API_TOKEN env var
4. VALIDATE:
   → Works for main use case
```

**Example 3: EmailBison integration**
```
1. DISCOVER:
   → npm search emailbison → nothing
   → gh search repos "emailbison cli" → nothing
   → Check if official CLI → no
2. EVALUATE:
   → ✓ All checkboxes pass
3. BUILD:
   → Minimal CLI with citty
   → One file: list campaigns, send test
4. VALIDATE:
   → Test with real API key
```
