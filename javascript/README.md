<!-- TOC:START -->
- [Tooling for JavaScript/TypeScript/Node Projects](#tooling-for-javascripttypescriptnode-projects)
  - [Overview](#overview)
  - [Packages](#packages)
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
  - CLI tool that auto-generates and validates Tables of Contents in Markdown files and checks other types of links.
- [`@datalackey/nx-graph-to-mermaid`](./nx-graph-to-mermaid/README.md)
  - NX executor plugin that generates deterministic Mermaid task-flow diagrams from `project.json` target definitions
- [`@datalackey/autogen-markdown-doc`](./autogen-markdown-doc/README.md)
  - CLI tool that bundles the packages above with opinionated defaults, covering TOC and Mermaid diagram management across an entire repository in a single command
- [`@datalackey/tooling-core`](./tooling-core/README.md)
  - private, unpublished package containing shared logic and utilities used by the other packages in this workspace


These packages are:

- ESM-only (not dual-published for CommonJS)
- Node >= 18

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
