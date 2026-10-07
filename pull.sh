#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ "$(git branch --show-current)" != debug ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo "Local edits are on another branch; save them before switching to debug." >&2
        exit 1
    fi
    git switch debug
fi
git pull --ff-only origin debug
echo "Preview: python3 \"$SCRIPT_DIR/serve.py\" --port 8768"
echo "Open http://localhost:8768"
