#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"
FIXTURES="$ROOT/test-fixtures"

echo "========================================"
echo " Running fixture tests"
echo "========================================"
echo

for dir in "$FIXTURES"/*; do
  README="$dir/README.md"
  EXPECTED="$dir/expected.md"

  if [[ ! -f "$EXPECTED" ]]; then
    echo "→ Skipping $(basename "$dir") (no expected.md)"
    continue
  fi

  NAME="$(basename "$dir")"
  echo "→ Testing fixture: $NAME"

  TMP="$(mktemp)"
  cp "$README" "$TMP"

  node "$CLI" "$TMP" >/dev/null

  if ! diff "$TMP" "$EXPECTED"; then
    echo
    echo "✖ FIXTURE FAILED: $NAME"
    echo "----------------------------------------"
    diff "$TMP" "$EXPECTED"
    echo "----------------------------------------"
    exit 1
  fi

  rm "$TMP"

done

echo
echo "========================================"
echo " ✅ FIXTURE TESTS PASSED"
echo "========================================"