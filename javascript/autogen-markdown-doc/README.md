<!-- TOC:START -->
- [@datalackey/autogen-markdown-doc](#datalackeyautogen-markdown-doc)
  - [Bundled Plugins](#bundled-plugins)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Update Mode (default)](#update-mode-default)
- [Target README.md in the current directory (default)](#target-readmemd-in-the-current-directory-default)
- [Explicit subcommand](#explicit-subcommand)
- [Specify a different file](#specify-a-different-file)
- [Skip specific UML source packages](#skip-specific-uml-source-packages)
    - [Check Mode (CI Drift Detection)](#check-mode-ci-drift-detection)
- [Check README.md in current directory](#check-readmemd-in-current-directory)
- [Check a specific file](#check-a-specific-file)
  - [Tag Families](#tag-families)
  - [File Co-location Constraint](#file-co-location-constraint)
  - [Options](#options)
  - [Using Bundled Plugins Independently](#using-bundled-plugins-independently)
- [TOC only — single file](#toc-only--single-file)
- [TOC — recursive (all .md files under a folder)](#toc--recursive-all-md-files-under-a-folder)
- [UML diagrams only](#uml-diagrams-only)
- [UML with exclusions](#uml-with-exclusions)
- [NX task graph only](#nx-task-graph-only)
- [CI drift check — single plugin](#ci-drift-check--single-plugin)
- [CI drift check — uber-bundle](#ci-drift-check--uber-bundle)
  - [Determinism Guarantees](#determinism-guarantees)
  - [Built With](#built-with)
  - [Packaging, Publishing, and Inter-relationship with Other Plugins](#packaging-publishing-and-inter-relationship-with-other-plugins)
  - [Contributing](#contributing)
  - [License](#license)
<!-- TOC:END -->

# @datalackey/autogen-markdown-doc

This plugin keeps documentation in sync with code. It is an 
uber-plugin that serves as a minimal-config orchestrator of the [plugins](#bundled-plugins) that it bundles.
Use this plugin directly for simple projects with a single Markdown file — typically README.md — that may 
contain any combination of auto-generated Table of Contents, UML component diagrams, and 
NX build task-graph diagrams. 

Place the relevant injection markers in your file and run the tool. 
Each bundled plugin activates only when its markers are present; 
sections without markers are left untouched. 

For CI, check mode detects drift: any generated section that has fallen out of sync 
with its source causes a non-zero exit, making it straightforward to gate a 
PR pipeline that requires documentation correctness.

When your project outgrows these defaults and needs features such as recursive traversal through 
your repo, custom source paths, or per-plugin flags — invoke the bundled plugins directly.


---

## Bundled Plugins

This package orchestrates three focused plugins:

- [`@datalackey/update-markdown-toc`](../update-markdown-toc/README.md) — generates Tables of Contents
- [`@datalackey/update-markdown-uml`](../update-markdown-uml/README.md) — generates UML component diagrams from TypeScript source
- [`@datalackey/nx-graph-to-mermaid`](../nx-graph-to-mermaid/README.md) — generates Mermaid task-graph diagrams from `project.json`

Each plugin is activated only when its tag family is present in the target file:

| Plugin | Activates when… |
|---|---|
| `update-markdown-toc` | Always (when any markers are found at all) |
| `nx-graph-to-mermaid` | `NX_GRAPH:START` / `NX_GRAPH:END` markers present **and** `project.json` exists in the same directory |
| `update-markdown-uml` | Any of the three `UML:*` marker pairs are present |

If the target file contains none of the three tag families, the tool warns and exits cleanly.

---

## Installation

```bash
npm i -D @datalackey/autogen-markdown-doc
```

---

## Usage

### Update Mode (default)

Applies all tag transformations in-place:

```bash
# Target README.md in the current directory (default)
npx autogen-markdown-doc

# Explicit subcommand
npx autogen-markdown-doc update

# Specify a different file
npx autogen-markdown-doc update docs/OVERVIEW.md

# Skip specific UML source packages
npx autogen-markdown-doc update --exclude-packages legacy,deprecated
```

---

### Check Mode (CI Drift Detection)

Validates all tags without writing any files. Exits non-zero if any drift is detected:

```bash
# Check README.md in current directory
npx autogen-markdown-doc check

# Check a specific file
npx autogen-markdown-doc check docs/OVERVIEW.md
```

---

## Tag Families

| Plugin | Marker pair(s) |
|---|---|
| `update-markdown-toc` | `<!-- TOC:START -->` … `<!-- TOC:END -->` |
| `update-markdown-uml` | `<!-- UML:components:START -->` … `<!-- UML:components:END -->`<br>`<!-- UML:components-table:START -->` … `<!-- UML:components-table:END -->`<br>`<!-- UML:component-details:START -->` … `<!-- UML:component-details:END -->` |
| `nx-graph-to-mermaid` | `<!-- NX_GRAPH:START -->` … `<!-- NX_GRAPH:END -->` |

---

## File Co-location Constraint

The target Markdown file must reside in the same directory as any required plugin inputs:

| Plugin | Required co-resident |
|---|---|
| `nx-graph-to-mermaid` | `project.json` |
| `update-markdown-uml` | `src/` directory |

If your layout differs — recursive traversal, custom source paths, or per-plugin flags — invoke
the underlying packages directly (see [Using Bundled Plugins Independently](#using-bundled-plugins-independently)).

---

## Options

| Option | Description |
|---|---|
| `--exclude-packages <pkg1,pkg2>` | Forwarded to UML generation only; leaf directory names under `src/` to skip |
| `--quiet` | Suppress all non-error output, including the "no markers" warning |
| `--debug` | Print debug diagnostics to stderr |
| `--help` | Show this help message and exit (exit 0) |

---

## Using Bundled Plugins Independently

_When your project outgrows the defaults — recursive traversal, custom source paths,
per-plugin flags — invoke the underlying packages directly:_

```bash
# TOC only — single file
npx update-markdown-toc README.md

# TOC — recursive (all .md files under a folder)
npx update-markdown-toc --recursive docs/

# UML diagrams only
npx update-markdown-uml README.md

# UML with exclusions
npx update-markdown-uml --exclude-packages legacy,deprecated README.md

# NX task graph only
npx nx-graph-to-mermaid --project-json project.json README.md

# CI drift check — single plugin
npx update-markdown-toc --check README.md
npx update-markdown-uml --check README.md
npx nx-graph-to-mermaid --check --project-json project.json README.md

# CI drift check — uber-bundle
npx autogen-markdown-doc check
```

---

## Determinism Guarantees

- Running `update` twice produces no changes on the second run.
- `check` passes immediately after `update`.

Conceptually:

```
check(file) === no-op(update(file))
```

---

## Built With

For the full workspace tech stack see: [TECH-STACK.md](../TECH-STACK.md)

---

## Packaging, Publishing, and Inter-relationship with Other Plugins

This package is one component of a small ecosystem of JavaScript tooling plugins maintained
as individual npm packages in this repository.
The versioning and release of these packages is governed by a coordinated release policy, and
the packages adhere to common design and architectural principles described [here](../README.md).

---

## Contributing 

For development setup, build workflow, and release procedures (including how to
trigger a publish via Changesets), see [CONTRIBUTING.md](../docs/CONTRIBUTING.md).

---

## License

MIT
