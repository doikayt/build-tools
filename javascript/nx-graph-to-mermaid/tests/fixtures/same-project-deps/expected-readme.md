# My Workspace

## Task Graph

<!-- NX_GRAPH:START -->
```mermaid
graph TD

  check_docs
  check_lint
  check_toc
  ci

  _caret_build(["^build"])

  _xref_datalackey_some_package_build{{"some-package:build"}}

  check_docs --> check_lint
  check_docs --> check_toc
  ci --> _xref_datalackey_some_package_build
  ci --> _caret_build
  ci --> check_docs
```
<!-- NX_GRAPH:END -->
