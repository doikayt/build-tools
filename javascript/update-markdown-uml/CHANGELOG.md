# @datalackey/update-markdown-uml

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
- Updated dependencies
  - @datalackey/tooling-core@1.4.2

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
- Updated dependencies
  - @datalackey/tooling-core@1.4.1

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

### Patch Changes

- Updated dependencies
  - @datalackey/tooling-core@1.4.0

## 1.3.0

### Minor Changes

- a92fa19: runnable example of uber plugin

### Patch Changes

- Updated dependencies [a92fa19]
  - @datalackey/tooling-core@1.3.0

## 1.2.1

### Patch Changes

- 141c71e: test of local publish
- Updated dependencies [141c71e]
  - @datalackey/tooling-core@1.2.1

## 1.2.0

### Minor Changes

- 812c547: implement UML class and package diagram generation
- update-markdown-uml going from stub to real implementation

### Patch Changes

- all functionality to date is being published
- Updated dependencies
- Updated dependencies
  - @datalackey/tooling-core@1.2.0

## 1.1.13

### Patch Changes

- 05d2400: depend fix
- Updated dependencies [05d2400]
  - @datalackey/tooling-core@1.1.13

## 1.1.12

### Patch Changes

- 3661429: url base fix
- Updated dependencies [3661429]
  - @datalackey/tooling-core@1.1.12

## 1.1.11

### Patch Changes

- make tooling-core non-private (publish it).
- Updated dependencies
  - @datalackey/tooling-core@1.1.11

## 1.1.10

### Patch Changes

- fix: add prepack to ensure dist is built before publish. Then:
- Updated dependencies
  - @datalackey/tooling-core@1.1.10

## 1.1.9

### Patch Changes

- 419b360: first cut at uml plugin
- 023b90e: uml plugin stubbed
- Updated dependencies [419b360]
- Updated dependencies [023b90e]
  - @datalackey/tooling-core@1.1.9
