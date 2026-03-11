<!-- TOC:START -->
<!-- TOC:END -->

# Tooling for JavaScript/TypeScript/Node Projects

## Overview

This workspace contains JavaScript/TypeScript tooling packages for documentation-related build automation.
The packages are designed around a philosophy of progressive disclosure — simple by default, configurable when needed.

For design and build philosophy see: [Repository Design Philosophy](../README.md#design-philosophy)

For maintainer and contributor documentation see: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## Packages

- [`@datalackey/update-markdown-toc`](./update-markdown-toc/README.md)
  - CLI tool
- [`@datalackey/nx-graph-to-mermaid`](./nx-graph-to-mermaid/README.md)
  - NX plugin
- [`@datalackey/autogen-markdown-doc`](./autogen-markdown-doc/README.md)
  - CLI tool that bundles the packages above, allowing them to be used independently,
    as well as via a simplified 'sensible defaults' entry point adequate for most common use cases.
- [`@datalackey/tooling-core`](./tooling-core/README.md)
  - private, unpublished package containing common logic

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
