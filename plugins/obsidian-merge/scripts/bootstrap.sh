#!/usr/bin/env bash
set -euo pipefail

# Require bun
if ! command -v bun &> /dev/null; then
  echo "[obsidian-merge] bun not found. Install from https://bun.sh" >&2
  exit 0
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
cd "$PLUGIN_ROOT" || exit 0

if ! command -v obsidian-merge &> /dev/null; then
  bun install --silent 2>/dev/null || true
  bun link --silent 2>/dev/null || true
fi
