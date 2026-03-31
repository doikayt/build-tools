#!/usr/bin/env bash
source "$(dirname "$0")/test-lib.sh" "$@"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"

TMPDIR="$(make_tmpdir)"

echo "========================================"
echo " Recursive traversal tests"
echo "========================================"
echo

TREE="$TMPDIR/tree"
mkdir -p "$TREE/empty-dir" "$TREE/sub" "$TREE/sub2"

cat > "$TREE/a.md" <<'EOT'
# A

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

cat > "$TREE/sub/b.md" <<'EOT'
# B

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

cat > "$TREE/sub/c.md" <<'EOT'
# C

## No TOC markers here
EOT

cat > "$TREE/sub2/d.md" <<'EOT'
# D

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

echo "hello" > "$TREE/z.txt"
echo "note"  > "$TREE/sub/note.txt"

echo "→ traverses nested directories and finds all .md files"

RAW_OUTPUT="$(
  run_capture node "$CLI" --verbose --recursive "$TREE" 2>/dev/null
)"

OUTPUT="$(printf '%s\n' "$RAW_OUTPUT" | filter_run_lines)"
ACTUAL="$(normalize "$OUTPUT")"

EXPECTED_ORDER=$(
cat <<EOT
Updated: $TREE/a.md
Updated: $TREE/sub/b.md
Skipped (no markers): $TREE/sub/c.md
Updated: $TREE/sub2/d.md
Summary: 3 updated, 0 needs update, 0 unchanged, 1 skipped
EOT
)

if [[ "$ACTUAL" != "$EXPECTED_ORDER" ]]; then
  echo "ERROR: traversal output mismatch"
  echo "Expected:"
  echo "$EXPECTED_ORDER"
  echo
  echo "Actual:"
  echo "$ACTUAL"
  exit 1
fi

echo "✔ nested traversal and filtering correct"
echo

echo "========================================"
echo " ✅ RECURSIVE TRAVERSAL TESTS PASSED"
echo "========================================"
