<!-- TOC:START -->
- [Tooling for JavaScript/TypeScript/Node Projects](#tooling-for-javascripttypescriptnode-projects)
  - [Overview](#overview)
  - [Packages](#packages)
  - [Build Targets](#build-targets)
  - [Consistent CLI Behavior Across Tools](#consistent-cli-behavior-across-tools)
<!-- TOC:END -->

# Tooling for JavaScript/TypeScript/Node Projects

## Overview

This workspace contains JavaScript/TypeScript tooling packages for documentation-related build automation.

See [here](../README.md#design-principles) for a discussion 
of the principles which shaped the design of these tools (e.g., progressive UI disclosure, CLI as a verifier 
and never generator of code.) 

For maintainer and contributor documentation see: [here](./docs/CONTRIBUTING.md)

---

## Packages

- [`@datalackey/update-markdown-toc`](./update-markdown-toc/README.md)
  - CLI tool that auto-generates and validates Tables of Contents (TOCs) in Markdown files and checks other types of links.
- [`@datalackey/nx-graph-to-mermaid`](./nx-graph-to-mermaid/README.md)
  - NX executor plugin that generates deterministic Mermaid task-flow diagrams from `project.json` target definitions
- [`@datalackey/update-markdown-uml`](./update-markdown-uml/README.md)
  - CLI tool that generates and validates UML class and package diagrams for TypeScript source trees, injecting them into Markdown documentation files
- [`@datalackey/autogen-markdown-doc`](./autogen-markdown-doc/README.md)
  - CLI tool that bundles the above referenced packages with opinionated defaults -- enabling 
    repository-wide gen/update of TOCs, and supported diagrams (build dependencies, and UML), all via a single command. 
- [`@datalackey/tooling-core`](./tooling-core/README.md)
  - private, unpublished package containing shared logic and utilities used by the other packages in this workspace

These packages are:

- ESM-only (not dual-published for CommonJS)
- Node >= 18

## Build Targets
<!-- NX_GRAPH:START -->
```mermaid
graph TD

  check_all
  check_docs
  check_format
  check_lint
  check_mermaid
  check_toc
  check_types
  check_uml
  ci
  format
  update_all
  update_docs
  update_format
  update_mermaid
  update_toc
  update_uml

  check_all --> check_docs
  check_all --> check_format
  check_all --> check_lint
  check_all --> check_types
  check_docs --> check_mermaid
  check_docs --> check_toc
  check_docs --> check_uml
  ci --> check_all
  update_all --> format
  update_all --> update_docs
  update_all --> update_format
  update_docs --> update_mermaid
  update_docs --> update_toc
  update_docs --> update_uml
```
<!-- NX_GRAPH:END -->

---

## Consistent CLI Behavior Across Tools

Tools in this workspace share a consistent command-line interface and behavior model.

This includes:

- Single-file and recursive directory modes
- `--check` for CI validation
- `--verbose` and `--quiet` output control
- Deterministic traversal order
- Predictable exit codes

If you use one tool, you already understand how the others behave.

For detailed documentation of shared command-line behavior, see:

➡️ **[Common CLI Behavior](./CLI-BEHAVIOR.md)**

