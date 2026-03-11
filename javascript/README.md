<!-- TOC:START -->
<!-- TOC:END -->

# Tooling for JavaScript/TypeScript/Node Projects

## Overview

This workspace contains JavaScript/TypeScript tooling packages for documentation-related build automation.
The packages are designed around a philosophy of
progressive disclosure — simple by default, configurable when needed.

For maintainer and contributor documentation see:
[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

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

## Design Philosophy

The tools in this workspace follow a principle of **progressive disclosure** —
a well-established UX pattern that surfaces simplicity first, and reveals
complexity only when needed.

In practice this means:

- The default invocation of any tool in this workspace should work correctly
  for the most common use case, with no flags or configuration required.
- Advanced options (custom exclusion lists, recursive depth, check-only mode, etc.)
  are available but never forced on the user.
- The `@datalackey/autogen-markdown-doc` package is the clearest expression of
  this principle: it bundles `update-markdown-toc` and `nx-graph-to-mermaid`
  into a single command with opinionated defaults that cover the 80% case —
  update all TOC and Mermaid anchor points across a repository with a single invocation.

This philosophy is closely related to **convention over configuration** —
the system works correctly out of the box, and you only configure what
deviates from the norm.

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
