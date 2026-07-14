#!/usr/bin/env bash
# Run from: javascript/
set -euo pipefail

VERSION="${1:?ERROR: version argument required. Usage: bash scripts/post-publish-smoke-test.sh <version>}"

echo "→ Running post-publish smoke test against @doikayt/autogen-markdown-doc@${VERSION}"
echo

PUBLISHED_VERSION="$VERSION" npx jest --rootDir=autogen-markdown-doc autogen-markdown-doc/tests/integration.test.js --no-coverage

echo
echo "========================================"
echo " ✅ POST-PUBLISH SMOKE TEST PASSED: v${VERSION}"
echo "========================================"
