#!/usr/bin/env bash
# Auto-generate a changeset from conventional commit messages when none exists.
# Run in CI before `npx changeset version`.
#
# Bump mapping (Conventional Commits spec):
#   fix:, perf:           → patch
#   feat:                 → minor
#   feat!: / BREAKING CHANGE → major
#   chore:, ci:, docs:, refactor:, style:, test:, build: → no release
#
# If no releasable commits are found, exits cleanly — changeset version
# then has nothing to consume and publish is a no-op.
set -euo pipefail

CHANGESET_DIR=".changeset"

PACKAGES=(
  "@datalackey/tooling-core"
  "@datalackey/update-markdown-toc"
  "@datalackey/nx-graph-to-mermaid"
  "@datalackey/update-markdown-uml"
  "@datalackey/autogen-markdown-doc"
)

# Skip if a manually-authored changeset already exists
EXISTING=$(find "$CHANGESET_DIR" -name "*.md" ! -name "README.md" | wc -l)
if [ "$EXISTING" -gt 0 ]; then
  echo "→ Changeset already present — skipping auto-generation"
  exit 0
fi

# Commits since last tag, or all commits if repo has no tags yet
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  RANGE="${LAST_TAG}..HEAD"
else
  RANGE="HEAD"
fi

SUBJECTS=$(git log "$RANGE" --pretty=format:"%s" 2>/dev/null || true)
FULL_LOG=$(git log "$RANGE" --pretty=format:"%s%n%b" 2>/dev/null || true)

if [ -z "$SUBJECTS" ]; then
  echo "→ No commits in range — skipping auto-generation"
  exit 0
fi

BUMP=""
SUMMARY_LINES=()

while IFS= read -r line; do
  [ -z "$line" ] && continue

  # Breaking change wins regardless of prefix
  if echo "$line" | grep -qE "^[a-z]+(\([^)]+\))?!:" || echo "$line" | grep -qE "^BREAKING CHANGE"; then
    BUMP="major"
  fi

  if echo "$line" | grep -qE "^feat(\([^)]+\))?:" && [ "$BUMP" != "major" ]; then
    BUMP="minor"
  fi

  if echo "$line" | grep -qE "^(fix|perf)(\([^)]+\))?:" && [ -z "$BUMP" ]; then
    BUMP="patch"
  fi
done <<< "$FULL_LOG"

# Collect subject lines for the changelog description (subjects only, no body noise)
while IFS= read -r line; do
  [ -z "$line" ] && continue
  if echo "$line" | grep -qE "^(fix|feat|perf)(\([^)]+\))?:"; then
    SUMMARY_LINES+=("- $line")
  fi
done <<< "$SUBJECTS"

if [ -z "$BUMP" ]; then
  echo "→ No releasable commits (fix:/feat:/perf:) since ${LAST_TAG:-beginning} — skipping auto-generation"
  exit 0
fi

# Build frontmatter: all packages bump together (fixed versioning group)
FRONTMATTER=""
for pkg in "${PACKAGES[@]}"; do
  FRONTMATTER="${FRONTMATTER}\"${pkg}\": ${BUMP}"$'\n'
done

DESCRIPTION=$(printf '%s\n' "${SUMMARY_LINES[@]}")

# Unique filename: timestamp + shell PID
FILENAME="${CHANGESET_DIR}/auto-$(date +%s)-$$.md"

cat > "$FILENAME" <<EOF
---
${FRONTMATTER}---

${DESCRIPTION}
EOF

echo "→ Generated ${FILENAME} (bump: ${BUMP})"
cat "$FILENAME"
