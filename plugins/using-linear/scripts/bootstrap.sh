#!/usr/bin/env bash
set -euo pipefail

# Require bun
if ! command -v bun &> /dev/null; then
  echo "[using-linear] bun not found. Install from https://bun.sh" >&2
  exit 0
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
cd "$PLUGIN_ROOT" || exit 0

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  bun install --silent 2>/dev/null || true
fi

# Link globally if not already available
if ! command -v linear &> /dev/null; then
  bun link --silent 2>/dev/null || true
fi

# Check for config
if [ ! -f "$HOME/.linear-cli/config.json" ]; then
  echo "[using-linear] Config not found at ~/.linear-cli/config.json. Run: linear auth"
fi
