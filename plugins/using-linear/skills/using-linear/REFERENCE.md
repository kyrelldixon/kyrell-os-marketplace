# Linear Skill Reference

## Linear Usage Guide

See `~/kyrell-os-vault/artifacts/Linear Usage Guide.md` for:
- Single team workflow (KYR)
- When to use projects vs issues
- Status workflow
- Handoff continuity patterns

## API Limitations

**Project descriptions:** Limited to 255 characters. The `content` field visible in Linear's web UI uses an internal system not exposed in the public API. Use short summaries + vault links for projects; put detailed content in issue descriptions.

## Configuration

**Config location:** `~/.linear-cli/config.json`

```json
{
  "default_team": "KYR",
  "env_file": "~/.linear-cli/.env"
}
```

**Cache location:** `~/.linear-cli/cache.json` (populated by `linear sync` - includes teams and workflow statuses)

**Secrets location:** Path specified in `env_file`

```
LINEAR_API_KEY=lin_api_xxxxx
```

## CLI Location

Installed globally via `bun link` from `tools/linear-cli/`.
