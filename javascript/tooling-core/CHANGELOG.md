# @datalackey/tooling-core

## 1.4.3

### Patch Changes

- - fix(tooling-core): summary line now prints only in verbose recursive runs
  - fix(update-markdown-toc): fix and wire recursive-error-contracts.test.sh (#17)
  - fix(tooling-core): --exclude "" now disables all exclusions as documented
  - fix(tooling-core): flag empty anchor fragment in relative links as an error
  - fix(update-markdown-toc): resolve 6 review findings (toc-3,4,7,9,10,12)
  - feat(autogen-markdown-doc): add post-publish smoke test against npm registry
  - fix(ci): auto-changeset always generates patch bumps
  - fix(ci): add .github/workflows/\*\* to path triggers
  - fix(ci): move permissions to workflow level to fix checkout auth failure
  - fix(ci): remove explicit token from checkout — actions/checkout handles it
  - fix(ci): use GITHUB_TOKEN for checkout, not NPM token
  - fix(update-markdown-toc): heading after HTML block no longer missing from TOC
  - fix: ignore inline code spans when parsing periods and TOC markers
  - fix: add dependsOn build to test targetDefaults in nx.json
  - fix: strip org scope from cross-project hex node labels to prevent truncation
  - feat: render cross-project deps as synthetic hexagon nodes in mermaid diagram
  - fix: render same-project qualified dep refs as edges in mermaid diagram

## 1.4.2

### Patch Changes

- - feat(autogen-markdown-doc): add post-publish smoke test against npm registry
  - fix(ci): auto-changeset always generates patch bumps
  - fix(ci): add .github/workflows/\*\* to path triggers
  - fix(ci): move permissions to workflow level to fix checkout auth failure
  - fix(ci): remove explicit token from checkout — actions/checkout handles it
  - fix(ci): use GITHUB_TOKEN for checkout, not NPM token
  - fix(update-markdown-toc): heading after HTML block no longer missing from TOC
  - fix: ignore inline code spans when parsing periods and TOC markers
  - fix: add dependsOn build to test targetDefaults in nx.json
  - fix: strip org scope from cross-project hex node labels to prevent truncation
  - feat: render cross-project deps as synthetic hexagon nodes in mermaid diagram
  - fix: render same-project qualified dep refs as edges in mermaid diagram

## 1.4.1

### Patch Changes

- - feat(autogen-markdown-doc): add post-publish smoke test against npm registry
  - fix(ci): auto-changeset always generates patch bumps
  - fix(ci): add .github/workflows/\*\* to path triggers
  - fix(ci): move permissions to workflow level to fix checkout auth failure
  - fix(ci): remove explicit token from checkout — actions/checkout handles it
  - fix(ci): use GITHUB_TOKEN for checkout, not NPM token
  - fix(update-markdown-toc): heading after HTML block no longer missing from TOC
  - fix: ignore inline code spans when parsing periods and TOC markers
  - fix: add dependsOn build to test targetDefaults in nx.json
  - fix: strip org scope from cross-project hex node labels to prevent truncation
  - feat: render cross-project deps as synthetic hexagon nodes in mermaid diagram
  - fix: render same-project qualified dep refs as edges in mermaid diagram

## 1.4.0

### Minor Changes

- - fix(ci): add .github/workflows/\*\* to path triggers
  - fix(ci): move permissions to workflow level to fix checkout auth failure
  - fix(ci): remove explicit token from checkout — actions/checkout handles it
  - fix(ci): use GITHUB_TOKEN for checkout, not NPM token
  - fix(update-markdown-toc): heading after HTML block no longer missing from TOC
  - fix: ignore inline code spans when parsing periods and TOC markers
  - fix: add dependsOn build to test targetDefaults in nx.json
  - fix: strip org scope from cross-project hex node labels to prevent truncation
  - feat: render cross-project deps as synthetic hexagon nodes in mermaid diagram
  - fix: render same-project qualified dep refs as edges in mermaid diagram

## 1.3.0

### Minor Changes

- a92fa19: runnable example of uber plugin

## 1.2.1

### Patch Changes

- 141c71e: test of local publish

## 1.2.0

### Minor Changes

- update-markdown-uml going from stub to real implementation

### Patch Changes

- all functionality to date is being published

## 1.1.13

### Patch Changes

- 05d2400: depend fix

## 1.1.12

### Patch Changes

- 3661429: url base fix

## 1.1.11

### Patch Changes

- make tooling-core non-private (publish it).

## 1.1.10

### Patch Changes

- fix: add prepack to ensure dist is built before publish. Then:

## 1.1.9

### Patch Changes

- 419b360: first cut at uml plugin
- 023b90e: uml plugin stubbed
