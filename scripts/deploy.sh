#!/usr/bin/env bash
# Build the game and push to gh-pages branch for GitHub Pages.
# Bypasses GitHub Actions (Pages build_type=legacy).

set -euo pipefail

REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_PATH"

REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
REPO_NAME="${REPO_SLUG##*/}"
PUBLIC_PATH="/${REPO_NAME}/"
WORKTREE_DIR=".gh-pages-tree"

echo "→ Building (public-path=${PUBLIC_PATH})"
rm -rf dist
bun build ./index.html \
  --outdir=dist \
  --minify \
  --sourcemap=external \
  --public-path="${PUBLIC_PATH}"
touch dist/.nojekyll

echo "→ Preparing gh-pages worktree"
if [ -d "$WORKTREE_DIR" ]; then
  git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
fi

if git show-ref --quiet --verify refs/heads/gh-pages; then
  git worktree add "$WORKTREE_DIR" gh-pages
elif git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch origin gh-pages:gh-pages
  git worktree add "$WORKTREE_DIR" gh-pages
else
  git worktree add --orphan -b gh-pages "$WORKTREE_DIR"
fi

echo "→ Syncing dist/ → worktree"
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R dist/. "$WORKTREE_DIR/"

echo "→ Committing + pushing"
pushd "$WORKTREE_DIR" >/dev/null
git add -A
if git diff --cached --quiet; then
  echo "  (no changes — skipping commit)"
else
  git commit -m "deploy: build $(date -u +%Y-%m-%dT%H:%M:%SZ)"
fi
git push -u origin gh-pages
popd >/dev/null

git worktree remove --force "$WORKTREE_DIR"

echo "→ Triggering Pages build"
gh api -X POST "/repos/${REPO_SLUG}/pages/builds" >/dev/null

echo "→ Waiting for build"
until gh api "/repos/${REPO_SLUG}/pages/builds/latest" 2>/dev/null \
  | grep -qE '"status":"(built|errored)"'; do
  sleep 3
done

STATUS="$(gh api "/repos/${REPO_SLUG}/pages/builds/latest" -q '.status')"
URL="$(gh api "/repos/${REPO_SLUG}/pages" -q '.html_url')"

if [ "$STATUS" = "built" ]; then
  echo "✓ Deployed: $URL"
else
  echo "✗ Build status: $STATUS"
  exit 1
fi
