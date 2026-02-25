## Vision

`autogen-markdown-doc` is not intended to be a thin wrapper around existing tools.

It is intended to evolve into a **deterministic documentation integrity engine for Nx workspaces**.

The goal is:

> If `autogen-markdown-doc check .` passes, your workspace documentation is structurally consistent, synchronized, and reproducible.

---

## Core Philosophy

This tool enforces opinionated, deterministic documentation hygiene across an Nx-based project.

It is designed to:

- Eliminate documentation drift
- Reduce cognitive overhead
- Enforce structural correctness
- Integrate deeply with Nx project metadata
- Provide CI-ready validation modes

---

## MVP Direction (Phase 1)

### Single Entry Point

```bash
autogen-markdown-doc update <rootDir>
autogen-markdown-doc check <rootDir>
Deterministic Recursive Traversal

Descend from <rootDir>

Ignore:

node_modules

.git

dist

coverage

Process files in lexicographically sorted order

Table of Contents Synchronization

For every Markdown file containing:

<!-- TOC:START -->
  - [Vision](#vision)
  - [Core Philosophy](#core-philosophy)
  - [MVP Direction (Phase 1)](#mvp-direction-phase-1)
    - [Single Entry Point](#single-entry-point)
  - [Targets](#targets)
    - [build](#build)
- [Workspace Overview](#workspace-overview)
<!-- TOC:END -->

Regenerate the TOC deterministically.

Mermaid Graph Injection (Nx-Aware)

For every Markdown file containing:

<!-- NX_GRAPH:START -->
<!-- NX_GRAPH:END -->

Locate nearest project.json (walking upward)

Generate deterministic Nx Mermaid graph

Inject updated graph block

Check Mode
autogen-markdown-doc check .

No writes

Exit non-zero if drift detected

Deterministic behavior

CI-friendly

Phase 2 — Structural Documentation Integrity
Broken Anchor Detection

Validate internal #anchor links

Detect heading drift

Report unresolved anchors

Cross-File Link Validation

Verify relative Markdown links exist

Fail in check mode if broken links detected

Required Section Enforcement

Enforce presence of required headings (configurable):

{
  "requiredSections": ["Overview", "Usage"]
}
Duplicate Heading Detection

Warn or fail on ambiguous duplicate section titles.

Phase 3 — Nx-Aware Intelligence
Target Documentation Extraction

Extract project.json target descriptions and auto-generate:

## Targets

### build
Compile source
Dependency Documentation

Inject dependency summaries derived from Nx graph:

Direct dependencies

Reverse dependencies

Workspace README Synchronization

Auto-generate root package index

Ensure packages link correctly

Validate version consistency with package.json

Phase 4 — CI & Drift Intelligence
Drift Summary Output

Structured summary for CI:

{
  "filesScanned": 42,
  "tocDrift": 3,
  "graphDrift": 1,
  "brokenLinks": 2
}
Strict Mode
autogen-markdown-doc check .

Fails if:

TOC drift

Graph drift

Broken links

Missing required sections

Affected-Only Mode (Nx Integration)

Use Nx affected logic to:

Only process changed packages

Speed up CI runs

Phase 5 — Higher-Order Automation (Future)
Documentation Coverage Reporting

Which packages lack README?

Which targets lack documentation?

Percentage documentation coverage metric

Version Synchronization

Ensure README badges match package.json

Ensure CHANGELOG version consistency

Workspace Documentation Index

Auto-generate:

# Workspace Overview

- Package A
- Package B
- Dependency graph
- Release version
What This Tool Is Not

Not a simple CLI wrapper

Not a convenience aggregator

Not a thin orchestration script

Long-Term Identity

autogen-markdown-doc should become:

A deterministic, Nx-aware documentation integrity engine that enforces structural correctness and synchronization across an entire workspace.

If it remains a thin wrapper, it is unnecessary.

If it evolves into the above vision, it becomes a meaningful and differentiated tool.
