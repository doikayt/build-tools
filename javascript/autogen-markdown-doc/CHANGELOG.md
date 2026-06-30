# @datalackey/autogen-markdown-doc

## 1.4.6

### Patch Changes

- - fix(tooling-core): satisfy strict-boolean-expressions in debugLog
  - fix(tooling-core): widen debugLog config param to accept debug?: boolean
  - fix(nx-graph-to-mermaid): XS housekeeping — pin dep, fix doc, document optional field
  - fix(nx-graph-to-mermaid): correct README executor refs, CLI casing, and project.json copy-schemas
  - fix(update-markdown-uml): pass no-op onWarn when quiet to suppress discoverLeafComponents warnings
  - fix(update-markdown-uml): clarify --recursive error message — target is a file, not a source root
  - fix(update-markdown-uml): remove duplicate exclusion warning from validateUmlConfig
  - fix(update-markdown-uml): throw on --recursive (not supported by design)
  - fix(update-markdown-uml): restore version 1.4.3 reverted by uml-1-5 commit; regenerate lock file
  - fix(update-markdown-uml): gate discoverLeafComponents warn on quiet flag
  - feat(update-markdown-uml): surface --test-patterns-to-skip in plugin descriptor and help
  - fix(update-markdown-uml): add missing vi import in discoverLeafComponents.test.ts
  - fix(update-markdown-uml): route exclusion warning to stderr via console.warn
  - fix(tooling-core): summary line now prints only in verbose recursive runs
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
- Updated dependencies
  - @datalackey/update-markdown-toc@1.4.6
  - @datalackey/nx-graph-to-mermaid@1.4.6
  - @datalackey/update-markdown-uml@1.4.6

## 1.4.5

### Patch Changes

- - fix(nx-graph-to-mermaid): correct README executor refs, CLI casing, and project.json copy-schemas
  - fix(update-markdown-uml): pass no-op onWarn when quiet to suppress discoverLeafComponents warnings
  - fix(update-markdown-uml): clarify --recursive error message — target is a file, not a source root
  - fix(update-markdown-uml): remove duplicate exclusion warning from validateUmlConfig
  - fix(update-markdown-uml): throw on --recursive (not supported by design)
  - fix(update-markdown-uml): restore version 1.4.3 reverted by uml-1-5 commit; regenerate lock file
  - fix(update-markdown-uml): gate discoverLeafComponents warn on quiet flag
  - feat(update-markdown-uml): surface --test-patterns-to-skip in plugin descriptor and help
  - fix(update-markdown-uml): add missing vi import in discoverLeafComponents.test.ts
  - fix(update-markdown-uml): route exclusion warning to stderr via console.warn
  - fix(tooling-core): summary line now prints only in verbose recursive runs
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
- Updated dependencies
  - @datalackey/update-markdown-toc@1.4.5
  - @datalackey/nx-graph-to-mermaid@1.4.5
  - @datalackey/update-markdown-uml@1.4.5

## 1.4.4

### Patch Changes

- - fix(update-markdown-uml): restore version 1.4.3 reverted by uml-1-5 commit; regenerate lock file
  - fix(update-markdown-uml): gate discoverLeafComponents warn on quiet flag
  - feat(update-markdown-uml): surface --test-patterns-to-skip in plugin descriptor and help
  - fix(update-markdown-uml): add missing vi import in discoverLeafComponents.test.ts
  - fix(update-markdown-uml): route exclusion warning to stderr via console.warn
  - fix(tooling-core): summary line now prints only in verbose recursive runs
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
- Updated dependencies
  - @datalackey/update-markdown-toc@1.4.4
  - @datalackey/nx-graph-to-mermaid@1.4.4
  - @datalackey/update-markdown-uml@1.4.4

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
- Updated dependencies
  - @datalackey/update-markdown-toc@1.4.3
  - @datalackey/nx-graph-to-mermaid@1.4.3
  - @datalackey/update-markdown-uml@1.4.3

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
  - @datalackey/update-markdown-toc@1.4.2
  - @datalackey/nx-graph-to-mermaid@1.4.2
  - @datalackey/update-markdown-uml@1.4.2

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
  - @datalackey/update-markdown-toc@1.4.1
  - @datalackey/nx-graph-to-mermaid@1.4.1
  - @datalackey/update-markdown-uml@1.4.1

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
  - @datalackey/update-markdown-toc@1.4.0
  - @datalackey/nx-graph-to-mermaid@1.4.0
  - @datalackey/update-markdown-uml@1.4.0

## 1.3.0

### Minor Changes

- a92fa19: runnable example of uber plugin

### Patch Changes

- Updated dependencies [a92fa19]
  - @datalackey/nx-graph-to-mermaid@1.3.0
  - @datalackey/update-markdown-toc@1.3.0
  - @datalackey/update-markdown-uml@1.3.0

## 1.2.1

### Patch Changes

- 141c71e: test of local publish
- Updated dependencies [141c71e]
  - @datalackey/nx-graph-to-mermaid@1.2.1
  - @datalackey/update-markdown-toc@1.2.1
  - @datalackey/update-markdown-uml@1.2.1

## 1.2.0

### Minor Changes

- update-markdown-uml going from stub to real implementation

### Patch Changes

- all functionality to date is being published
- Updated dependencies [812c547]
- Updated dependencies
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.2.0
  - @datalackey/update-markdown-uml@1.2.0
  - @datalackey/update-markdown-toc@1.2.0

## 1.1.13

### Patch Changes

- 05d2400: depend fix
- Updated dependencies [05d2400]
  - @datalackey/nx-graph-to-mermaid@1.1.13
  - @datalackey/update-markdown-toc@1.1.13
  - @datalackey/update-markdown-uml@1.1.13

## 1.1.12

### Patch Changes

- 3661429: url base fix
- Updated dependencies [3661429]
  - @datalackey/nx-graph-to-mermaid@1.1.12
  - @datalackey/update-markdown-toc@1.1.12

## 1.1.11

### Patch Changes

- make tooling-core non-private (publish it).
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.1.11
  - @datalackey/update-markdown-toc@1.1.11

## 1.1.10

### Patch Changes

- fix: add prepack to ensure dist is built before publish. Then:
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.1.10
  - @datalackey/update-markdown-toc@1.1.10

## 1.1.9

### Patch Changes

- 419b360: first cut at uml plugin
- 023b90e: uml plugin stubbed
- Updated dependencies [419b360]
- Updated dependencies [023b90e]
  - @datalackey/nx-graph-to-mermaid@1.1.9
  - @datalackey/update-markdown-toc@1.1.9

## 1.1.8

### Patch Changes

- 84b1bd3: update docs
- Updated dependencies [84b1bd3]
  - @datalackey/nx-graph-to-mermaid@1.1.8
  - @datalackey/update-markdown-toc@1.1.8

## 1.1.7

### Patch Changes

- 36c1aee: update docs
- Updated dependencies [36c1aee]
  - @datalackey/nx-graph-to-mermaid@1.1.7
  - @datalackey/update-markdown-toc@1.1.7

## 1.1.6

### Patch Changes

- fdb6663: doc updates. and for nx-graph-to-mermaid we have one executor target: run
- Updated dependencies [fdb6663]
  - @datalackey/nx-graph-to-mermaid@1.1.6
  - @datalackey/update-markdown-toc@1.1.6

## 1.1.5

### Patch Changes

- a6d1a31: release test
- Updated dependencies [a6d1a31]
  - @datalackey/nx-graph-to-mermaid@1.1.5
  - @datalackey/update-markdown-toc@1.1.5

## 1.1.4

### Patch Changes

- 763d8f5: doc updates
- Updated dependencies [763d8f5]
  - @datalackey/nx-graph-to-mermaid@1.1.4
  - @datalackey/update-markdown-toc@1.1.4

## 1.1.3

### Patch Changes

- test release/publish
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.1.3
  - @datalackey/update-markdown-toc@1.1.3

## 1.1.2

### Patch Changes

- release test
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.1.2
  - @datalackey/update-markdown-toc@1.1.2

## 1.1.1

### Patch Changes

- first test of changeset publishing
- Updated dependencies
  - @datalackey/nx-graph-to-mermaid@1.1.1
  - @datalackey/update-markdown-toc@1.1.1

## 1.1.0

### Minor Changes

- 1643e87: this is a test bump of the versions of all related packages

### Patch Changes

- Updated dependencies [1643e87]
  - @datalackey/nx-graph-to-mermaid@1.1.0
  - @datalackey/update-markdown-toc@1.1.0
