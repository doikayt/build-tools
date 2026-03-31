#!/usr/bin/env bash
source "$(dirname "$0")/test-lib.sh" "$@"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"

TMPDIR="$(make_tmpdir)"

echo "========================================"
echo " Recursive traversal ignores node_modules"
echo "========================================"
echo

TREE="$TMPDIR/tree"
mkdir -p "$TREE/node_modules/pkg" "$TREE/sub"

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

cat > "$TREE/node_modules/pkg/intruder.md" <<'EOT'
# Intruder

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOT

RAW_OUTPUT="$(
  run_capture node "$CLI" --verbose --recursive "$TREE" 2>/dev/null
)"

OUTPUT="$(printf '%s\n' "$RAW_OUTPUT" | filter_run_lines)"
ACTUAL="$(normalize "$OUTPUT")"

EXPECTED_ORDER=$(
cat <<EOT
Updated: $TREE/a.md
Updated: $TREE/sub/b.md
Summary: 2 updated, 0 needs update, 0 unchanged, 0 skipped
EOT
)

if [[ "$ACTUAL" != "$EXPECTED_ORDER" ]]; then
  echo "ERROR: traversal output mismatch or node_modules was processed"
  echo "Expected:"
  echo "$EXPECTED_ORDER"
  echo
  echo "Actual:"
  echo "$ACTUAL"
  exit 1
fi

if echo "$ACTUAL" | grep -q "node_modules"; then
  echo "ERROR: node_modules path appeared in output"
  exit 1
fi

echo "✔ node_modules excluded from recursive traversal"

echo "========================================"
echo " ✅ NODE_MODULES EXCLUSION TEST PASSED"
echo "========================================"
