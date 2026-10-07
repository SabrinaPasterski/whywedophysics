#!/usr/bin/env bash
# Explicit production deployment for the Git-connected Cloudflare Pages site.
# Work on debug; this merges debug into main, whose push triggers Cloudflare.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ "$(git branch --show-current)" != "debug" ]; then
  echo "Error: must be on debug"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: commit changes before deploying"
  exit 1
fi

git push origin debug
git checkout main
git pull --rebase origin main
git merge debug --no-edit
git push origin main
git checkout debug

echo "Deployed: Cloudflare Pages will build the main branch."
