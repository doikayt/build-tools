#!/usr/bin/env bash
# Collect config files only for build/test debugging
# Run from: javascript/

set -euo pipefail

find . \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  \( \
    -name "ignorethis.json" \
    -o -name "*.md" \
  \) \
  | sort \
  | while read -r file; do
    echo "===== FILE: $file ====="
    cat "$file"
    echo ""
  done > /tmp/configs.out

xclip -selection clipboard -i /tmp/configs.out
