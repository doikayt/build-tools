<!-- TOC:START -->
- [@datalackey/autogen-markdown-doc](#datalackeyautogen-markdown-doc)
  - [Overview](#overview)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Update Mode](#update-mode)
    - [Check Mode (CI Drift Detection)](#check-mode-ci-drift-detection)
  - [Determinism Gurantees](#determinism-gurantees)
  - [When to Use the Underlying Tools Directly](#when-to-use-the-underlying-tools-directly)
  - [Built With](#built-with)
  - [Packaging, Publishing, and Inter-relationship with Other Plugins](#packaging-publishing-and-inter-relationship-with-other-plugins)
  - [Contributing and Releasing](#contributing-and-releasing)
  - [License](#license)
  - [Misc](#misc)
<!-- TOC:END -->

# @datalackey/autogen-markdown-doc


An intentionally opinionated, repository-wide documentation auto-generator and consistency checker -- 
serves as a simplified entry point for all other plugins in this repository.

---

## Overview

This package is an uber-bundle comprising the following npm packages:

- [`@datalackey/update-markdown-toc`](../update-markdown-toc/README.md)
- [`@datalackey/update-markdown-uml`](../update-markdown-uml/README.md)
- [`@datalackey/nx-graph-to-mermaid`](../nx-graph-to-mermaid/README.md)
- [`@datalackey/tooling-core`](../tooling-core/README.md)


each of which (except the last) can be used independently upon installation of this uber-plugin. 
Alternatively, all plugins can be actiavated at once by activating the uber-plugin and selecting
one of the following simplified pre-configured entrypoints:

- `update` 
  - auto-generates Tables of Contents (TOCs) for all
    [Markdown](https://en.wikipedia.org/wiki/Markdown) (*.md) documents, anywhere in your repository.
  - auto-generates [Mermaid](https://mermaid.ai/web/) graphical diagrams that document
    dependencies between build pipeline tasks. 
  - auto-generates UML package diagrams for TypeScript code in the repo.

OR:
- `check`   
  - verify that the latest checked-in documentation matches the configuration source, i.e.:
      - that all TOC entry links are correctly linked to 
        corresponding sections of their Markdown documents.
      - that all Markdown documents with injected Mermaid diagrams reflect the build task flow encoded in underlying configuration (`project.json`).
      - that all injected UML package diagrams are in sync with latest TypeScript code in the repo.


These apply 'sensible defaults' to the configuration options of the bundled plugins.
In a nutshell: 
  - `update` reconciles repo to canonical documentation state (writes)
  - `check` verifies repo's auto generated documentation is already canonical (no writes; exits non-zero on drift)


The last included package (`@datalackey/tooling-core`) is a dependency of all other packages, 
and is a framework for developing CLI utilities (not intended to be used directly.)

---

## Installation

```bash
npm i -D @datalackey/autogen-markdown-doc
```

---

## Usage

### Update Mode

`update` mutates files to bring the repository into the expected documentation state.

Behavior:

- Recursively scans the repository
- Uses default exclusion list:
    - `node_modules` (only)
- Processes **all Markdown (`.md`) files**
- Updates Table of Contents content (via `@datalackey/update-markdown-toc`)
- Generates Mermaid graph output (via `@datalackey/nx-graph-to-mermaid`)
- Updates Mermaid blocks **only where existing Mermaid injection markers are present**
- Writes changes to disk

Run via:

```bash
npx autogen-markdown-doc update
```

---

### Check Mode (CI Drift Detection)

`check` performs a full repository validation pass without mutating any files.

Behavior:

- Recursively scans the repository
- Uses default exclusion list:
    - `node_modules` (only)
- Processes **all Markdown (`.md`) files**
- Validates Table of Contents drift 
- Validates Mermaid drift for **all existing Mermaid injection markers**
- Reports:
    - list of files out of date
    - type of drift (TOC / Mermaid / both)
- Exits with status code `1` if any drift is detected
- Exits with status code `0` if no drift is detected

Run via:

```bash
npx autogen-markdown-doc check
```

---

## Determinism Gurantees

The intended invariant:

- Running `update` twice produces no changes on the second run.
- `check` passes immediately after `update`.

Conceptually:

```
check(repo) === no-op(update(repo))
```

---

## When to Use the Underlying Tools Directly

Use the underlying packages if you need:

- Custom exclusion lists beyond `node_modules`
- File- or directory-specific operations
- Mermaid-only or TOC-only workflows
- Advanced or non-default configuration

---

## Built With


For the full workspace tech stack see: [TECH-STACK.md](../TECH-STACK.md)


## Packaging, Publishing, and Inter-relationship with Other Plugins

This package is one component of a small ecosystem of JavaScript tooling plugins maintained 
as individual npm packages in this repository.
The versioning and release of these packages is governed by a coordinated release policy, and
the packages adhere to common design and architectural principles policies
that are more completely described [here](../README.md).


---

## Contributing and Releasing

For development setup, build workflow, and release procedures (including how to
trigger a publish via Changesets), see
[CONTRIBUTING.md](../docs/CONTRIBUTING.md).

---

## License

MIT


## Misc
