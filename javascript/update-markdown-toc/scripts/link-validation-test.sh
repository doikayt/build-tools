#!/usr/bin/env bash
# Run from: javascript/update-markdown-toc/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/bin/update-markdown-toc.js"
FIXTURES="$ROOT/test-fixtures/link-validation"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "========================================"
echo " Link validation integration tests"
echo "========================================"
echo

# ------------------------------------------------------------
# Start mock HTTP server
# ------------------------------------------------------------

SERVER_OUT="$(mktemp)"
node "$ROOT/scripts/mock-http-server.mjs" 0 > "$SERVER_OUT" &
SERVER_PID=$!

# Wait for port to be printed
for i in $(seq 1 20); do
  if [[ -s "$SERVER_OUT" ]]; then
    break
  fi
  sleep 0.1
done

PORT="$(cat "$SERVER_OUT")"

if [[ -z "$PORT" ]]; then
  echo "ERROR: mock server did not start"
  exit 1
fi

echo "→ Mock HTTP server started on port $PORT (pid $SERVER_PID)"
echo

trap 'kill $SERVER_PID 2>/dev/null || true; rm -rf "$TMPDIR" "$SERVER_OUT"' EXIT

# Helper: copy fixture and replace __PORT__ placeholder
make_fixture() {
  local name="$1"
  local dest="$TMPDIR/${name}"
  sed "s/__PORT__/$PORT/g" "$FIXTURES/${name}" > "$dest"
  echo "$dest"
}

# ------------------------------------------------------------
# Case 1: valid external link → exit 0, no errors
# ------------------------------------------------------------

echo "→ valid external link exits 0"

FILE="$(make_fixture valid-external.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 0 ]]; then
  echo "ERROR: expected exit 0 for valid external link"
  echo "$OUTPUT"
  exit 1
fi

if echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: unexpected error in output"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ valid external link passed"
echo

# ------------------------------------------------------------
# Case 2: broken external link (404) → exit 1, error in output
# ------------------------------------------------------------

echo "→ broken external link (404) exits 1"

FILE="$(make_fixture broken-external.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE")"
STATUS=$?
set -e

echo "DEBUG STATUS: $STATUS"
echo "DEBUG OUTPUT: $OUTPUT"

if [[ "$STATUS" -ne 1 ]]; then
  echo "ERROR: expected exit 1 for broken external link"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: expected error marker in output"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ broken external link detected"
echo

# ------------------------------------------------------------
# Case 3: forbidden external link (403) → exit 0, warning in output
# ------------------------------------------------------------

echo "→ forbidden external link (403) exits 0 with warning"

FILE="$(make_fixture forbidden-external.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 0 ]]; then
  echo "ERROR: expected exit 0 for 403 (warning only)"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "⚠"; then
  echo "ERROR: expected warning marker in output for 403"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ 403 treated as warning"
echo

# ------------------------------------------------------------
# Case 4: 301 redirect → exit 0, warning in output
# ------------------------------------------------------------

echo "→ 301 redirect exits 0 with warning"

FILE="$(make_fixture redirect-external.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 0 ]]; then
  echo "ERROR: expected exit 0 for 301 (warning only)"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "⚠"; then
  echo "ERROR: expected warning marker for 301"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ 301 treated as warning"
echo

# ------------------------------------------------------------
# Case 5: broken fragment link → exit 1
# ------------------------------------------------------------

echo "→ broken fragment link exits 1"

FILE="$(make_fixture broken-fragment.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 1 ]]; then
  echo "ERROR: expected exit 1 for broken fragment"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: expected error marker for broken fragment"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ broken fragment detected"
echo

# ------------------------------------------------------------
# Case 6: valid fragment link → exit 0
# ------------------------------------------------------------

echo "→ valid fragment link exits 0"

FILE="$(make_fixture valid-fragment.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 0 ]]; then
  echo "ERROR: expected exit 0 for valid fragment"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ valid fragment passed"
echo

# ------------------------------------------------------------
# Case 7: broken relative link → exit 1
# ------------------------------------------------------------

echo "→ broken relative file link exits 1"

FILE="$(make_fixture broken-relative.md)"

set +e
OUTPUT="$(node "$CLI" --check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 1 ]]; then
  echo "ERROR: expected exit 1 for broken relative link"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: expected error marker for broken relative link"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ broken relative link detected"
echo

# ------------------------------------------------------------
# Case 8: --no-external-link-check suppresses external errors
# ------------------------------------------------------------

echo "→ --no-external-link-check suppresses external link errors"

FILE="$(make_fixture broken-external.md)"

set +e
OUTPUT="$(node "$CLI" --check --no-external-link-check "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 0 ]]; then
  echo "ERROR: expected exit 0 when external check disabled"
  echo "$OUTPUT"
  exit 1
fi

if echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: external error should be suppressed"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ --no-external-link-check suppresses external errors"
echo

# ------------------------------------------------------------
# Case 9: --link-timeout-ms with very low value → timeout error
# ------------------------------------------------------------

echo "→ --link-timeout-ms triggers timeout on slow server"

FILE="$(make_fixture slow-external.md)"

set +e
OUTPUT="$(node "$CLI" --check --link-timeout-ms 100 "$FILE" 2>/dev/null)"
STATUS=$?
set -e

if [[ "$STATUS" -ne 1 ]]; then
  echo "ERROR: expected exit 1 for timeout"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "✗"; then
  echo "ERROR: expected error marker for timeout"
  echo "$OUTPUT"
  exit 1
fi

if ! echo "$OUTPUT" | grep -q "timeout"; then
  echo "ERROR: expected 'timeout' in error reason"
  echo "$OUTPUT"
  exit 1
fi

echo "✔ timeout detected"
echo

echo "========================================"
echo " ✅ LINK VALIDATION INTEGRATION TESTS PASSED"
echo "========================================"



echo "→ broken external link (404) exits 1"

FILE="$(make_fixture broken-external.md)"

echo "DEBUG FILE: $FILE"
echo "DEBUG FILE CONTENTS:"
cat "$FILE"
echo "DEBUG RUNNING:"
echo "  node $CLI --check $FILE"

set +e
OUTPUT="$(node "$CLI" --check "$FILE")"
STATUS=$?
set -e

echo "DEBUG STATUS: $STATUS"
echo "DEBUG OUTPUT: $OUTPUT"

