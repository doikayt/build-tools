# @datalackey/update-markdown-uml

## 1.4.17

### Patch Changes

- - fix: post-publish step no longer masks test failures; bump propagation sleep to 60s
- Updated dependencies
  - @doikayt/tooling-core@1.4.17

## 1.4.16

### Patch Changes

- - fix: delegate nx-graph-to-mermaid prepack to NX build to avoid tsc race condition
  - fix: format descriptorAfterRun.test.ts with prettier
  - fix: break ci target recursion caused by package.json script shadowing
  - fix: push release tags, upgrade Node to 22 and actions to v5
- Updated dependencies
  - @doikayt/tooling-core@1.4.16

## 1.4.15

### Patch Changes

- - fix: format descriptorAfterRun.test.ts with prettier
  - fix: break ci target recursion caused by package.json script shadowing
  - fix: push release tags, upgrade Node to 22 and actions to v5
- Updated dependencies
  - @doikayt/tooling-core@1.4.15

## 1.4.14

### Patch Changes

- - fix: break ci target recursion caused by package.json script shadowing
  - fix: push release tags, upgrade Node to 22 and actions to v5
- Updated dependencies
  - @datalackey/tooling-core@1.4.14

## 1.4.13

### Patch Changes

- - fix: push release tags, upgrade Node to 22 and actions to v5
- Updated dependencies
  - @datalackey/tooling-core@1.4.13

## 1.4.12

### Patch Changes

- - fix(update-markdown-uml): escape pipe characters in function-table cells
  - fix(tooling-core): extractFirstSentence joins wrapped lines before extracting summary
  - feat(update-markdown-uml): function-table fallback for function-only components
  - fix(autogen-markdown-doc): gate TOC on markers and validate all plugins in check mode
  - fix(tooling-core): satisfy strict-boolean-expressions in debugLog
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
  - @datalackey/tooling-core@1.4.12

## 1.4.11

### Patch Changes

- - fix(update-markdown-uml): escape pipe characters in function-table cells
  - fix(tooling-core): extractFirstSentence joins wrapped lines before extracting summary
  - feat(update-markdown-uml): function-table fallback for function-only components
  - fix(autogen-markdown-doc): gate TOC on markers and validate all plugins in check mode
  - fix(tooling-core): satisfy strict-boolean-expressions in debugLog
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
  - @datalackey/tooling-core@1.4.11

## 1.4.10

### Patch Changes

- - feat(update-markdown-uml): function-table fallback for function-only components
  - fix(autogen-markdown-doc): gate TOC on markers and validate all plugins in check mode
  - fix(tooling-core): satisfy strict-boolean-expressions in debugLog
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
  - @datalackey/tooling-core@1.4.10

## 1.4.9

### Patch Changes

- - fix(autogen-markdown-doc): gate TOC on markers and validate all plugins in check mode
  - fix(tooling-core): satisfy strict-boolean-expressions in debugLog
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
  - @datalackey/tooling-core@1.4.9

## 1.4.8

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
  - @datalackey/tooling-core@1.4.8

## 1.4.7

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
  - @datalackey/tooling-core@1.4.7

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
  - @datalackey/tooling-core@1.4.6

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
  - @datalackey/tooling-core@1.4.5

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
  - @datalackey/tooling-core@1.4.4

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
  - @datalackey/tooling-core@1.4.3

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
