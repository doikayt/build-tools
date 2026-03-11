#!/usr/bin/env bash
# Collect config files only for build/test debugging
# Run from: javascript/

set -euo pipefail

EXTENSIONS=("package.json" "project.json" "tsconfig.json" "tsconfig.*.json" "nx.json" "vitest.config.ts" "jest.config.js" ".changeset/config.json")

find . \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  \( \
    -name "package.json" \
    -o -name "project.json" \
    -o -name "tsconfig.json" \
    -o -name "tsconfig.*.json" \
    -o -name "nx.json" \
    -o -name "vitest.config.ts" \
    -o -name "jest.config.js" \
    -o -name "jest.config.ts" \
  \) \
  | sort \
  | while read -r file; do
    echo "===== FILE: $file ====="
    cat "$file"
    echo ""
  done  > /tmp/configs.out


xclip -selection clipboard -i /tmp/configs.out


    


