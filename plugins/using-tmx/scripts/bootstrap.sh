#!/usr/bin/env bash
set -euo pipefail

# Require bun
if ! command -v bun &> /dev/null; then
  echo "[using-tmx] bun not found. Install from https://bun.sh" >&2
  exit 0
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
cd "$PLUGIN_ROOT" || exit 0

if [ ! -d "node_modules" ]; then
  bun install --silent 2>/dev/null || true
fi

if ! command -v tmx &> /dev/null; then
  bun link --silent 2>/dev/null || true
fi
