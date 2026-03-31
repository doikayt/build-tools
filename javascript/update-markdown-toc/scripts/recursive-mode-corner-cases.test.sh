#!/usr/bin/env bash
source "$(dirname "$0")/test-lib.sh" "$@"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"

TMPDIR="$(make_tmpdir)"

echo "========================================"
echo " Recursive mode corner case tests"
echo "========================================"
echo

# ------------------------------------------------------------
# Case 1
# Recursive mode with exactly ONE markdown file
# ------------------------------------------------------------

echo "→ recursive directory containing ONE file"

TREE="$TMPDIR/tree-one"
mkdir -p "$TREE"

cat > "$TREE/file.md" <<'EOT'
# Title

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

OUTPUT="$(
  run_capture node "$CLI" --recursive "$TREE" --verbose
)"

ACTUAL="$(printf '%s\n' "$OUTPUT" | filter_run_lines | normalize)"

EXPECTED=$(
cat <<EOT
Updated: $TREE/file.md
Summary: 1 updated, 0 needs update, 0 unchanged, 0 skipped
EOT
)

if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "ERROR: recursive mode with one file behaved incorrectly"
  echo
  echo "Expected:"
  echo "$EXPECTED"
  echo
  echo "Actual:"
  echo "$ACTUAL"
  exit 1
fi

echo "✔ recursive mode with one file behaves correctly"
echo

# ------------------------------------------------------------
# Case 2
# Recursive mode with ZERO markdown files
# ------------------------------------------------------------

echo "→ recursive directory containing ZERO markdown files"

TREE_EMPTY="$TMPDIR/tree-empty"
mkdir -p "$TREE_EMPTY"

OUTPUT="$(
  run_capture node "$CLI" --recursive "$TREE_EMPTY" --verbose
)"

ACTUAL="$(printf '%s\n' "$OUTPUT" | filter_run_lines | normalize)"

EXPECTED="Summary: 0 updated, 0 needs update, 0 unchanged, 0 skipped"

if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "ERROR: recursive mode with zero files behaved incorrectly"
  echo
  echo "Expected:"
  echo "$EXPECTED"
  echo
  echo "Actual:"
  echo "$ACTUAL"
  exit 1
fi

echo "✔ recursive mode with zero files behaves correctly"
echo

echo "========================================"
echo " ✅ RECURSIVE MODE CORNER CASE TESTS PASSED"
echo "========================================"

