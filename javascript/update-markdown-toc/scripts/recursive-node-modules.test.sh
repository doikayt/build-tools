#!/usr/bin/env bash
source "$(dirname "$0")/test-lib.sh" "$@"

# ------------------------------------------------------------
# Setup
# ------------------------------------------------------------

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"

TMPDIR="$(make_tmpdir)"


echo "========================================"
echo " Recursive traversal ignores node_modules"
echo "========================================"
echo

# ------------------------------------------------------------
# Fixture layout
# ------------------------------------------------------------

# tree/
# ├── a.md                (has TOC)
# ├── node_modules/
# │   └── pkg/
# │       └── intruder.md   (has TOC, should be ignored)
# └── sub/
#     └── b.md            (has TOC)

TREE="$TMPDIR/tree"
mkdir -p "$TREE/node_modules/pkg" "$TREE/sub"

cat > "$TREE/a.md" <<'EOF'
# A

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOF

cat > "$TREE/sub/b.md" <<'EOF'
# B

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOF

# This file simulates a package's markdown under node_modules; the CLI should ignore it.
cat > "$TREE/node_modules/pkg/intruder.md" <<'EOF'
# Intruder

<!-- TOC:START -->
<!-- TOC:END -->

## Section
EOF

# ------------------------------------------------------------
# Run CLI
# ------------------------------------------------------------

RAW_OUTPUT="$(
  run_capture node "$CLI" --verbose --recursive "$TREE" 2>/dev/null
)"

OUTPUT="$(printf '%s\n' "$RAW_OUTPUT" | filter_run_lines)"
ACTUAL="$(normalize "$OUTPUT")"

EXPECTED_ORDER=$(
cat <<EOF
Updated: $TREE/a.md
Updated: $TREE/sub/b.md
EOF
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

