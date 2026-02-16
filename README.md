# build-tools

This repository contains tooling designed to assist in building and maintaining software projects —
primarily JavaScript/TypeScript projects at this point.

---

## Tools

So far, we have:

- a [command-line tool](javascript/update-markdown-toc/README.md) to update the
  Table of Contents (TOC) in Markdown files.

- an [NX](https://nx.dev/) [plugin](javascript/nx-graph-to-mermaid/README.md) that generates
  a deterministic [Mermaid](https://www.mermaid.ai/) task flow diagram from an NX `project.json` file —
  with optional CI drift detection and Markdown injection support.

---

## Build Philosophy

Our tools are intentionally opinionated in both design and workflow. The core philosophy is:

> **CI must never modify or generate code — checked-in code is the source of truth — CI only validates.**

All mechanical generation steps  
(such as updating Markdown tables of contents or generating build graph diagrams)
are intended to be performed explicitly by developers as part of their normal workflow.

Continuous Integration should be responsible for:

- Verifying that generated artifacts are up to date
- Detecting drift between committed files and generated output
- Failing deterministically when inconsistencies are found

Continuous Integration is *not* responsible for mutating the repository.

This ensures:

- Deterministic builds
- Explicit developer intent
- Fully materialized, reviewable artifacts
- Simplified debugging in “works for me” scenarios

When discrepancies occur between environments, it becomes possible to:

1. Diff the actual workspace contents
2. Rule out differences in source or configuration
3. Avoid debugging hidden generation logic performed during CI

If CI were allowed to mutate files, debugging would require reasoning about generation logic itself —
a more complex and less transparent process.

Individual tools in this repository implement this philosophy through clearly separated
**update** and **check** modes.
