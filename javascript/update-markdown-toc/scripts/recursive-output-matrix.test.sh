#!/usr/bin/env bash
source "$(dirname "$0")/test-lib.sh" "$@"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"

TMPDIR="$(make_tmpdir)"

echo "========================================"
echo " Recursive output matrix tests"
echo "========================================"
echo

TREE2="$TMPDIR/tree-case2"
mkdir -p "$TREE2"

cat > "$TREE2/good.md" <<'EOT'
# Good

<!-- TOC:START -->
- [Good](#good)
<!-- TOC:END -->
EOT

cat > "$TREE2/stale.md" <<'EOT'
# Stale

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

cat > "$TREE2/no-toc.md" <<'EOT'
# No TOC
## Section
EOT

OUTPUT="$(
  run_capture node "$CLI" --recursive "$TREE2" --verbose
)"

ACTUAL="$(printf '%s\n' "$OUTPUT" | filter_run_lines | normalize)"

EXPECTED=$(
cat <<EOT
Up-to-date: $TREE2/good.md
Skipped (no markers): $TREE2/no-toc.md
Updated: $TREE2/stale.md
Summary: 1 updated, 0 needs update, 1 unchanged, 1 skipped
EOT
)

[[ "$ACTUAL" == "$EXPECTED" ]] || exit 1
echo "✔ recursive --verbose output correct"
echo

echo "========================================"
echo " ✅ RECURSIVE OUTPUT MATRIX TESTS PASSED"
echo "========================================"
