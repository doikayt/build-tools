# build-tools

This repository contains tooling designed to assist in building and maintaining software projects —
primarily JavaScript/TypeScript projects at this point.

---

## Tools

So far, we have:

- a [command-line tool](javascript/update-markdown-toc/README.md) to update the
  Table of Contents (TOC) in Markdown files.

- an [NX](https://nx.dev/) [plugin](javascript/nx-graph-to-mermaid/README.md) that generates
  a deterministic Mermaid task flow diagram from an NX `project.json` file —
  with optional CI drift detection and Markdown injection support.

---

## Build Philosophy

This repository follows a deterministic build and validation model.

Core principles:

- Checked-in source code is the source of truth.
- CI validates, tests, and publishes.
- CI does not generate code, does not modify existing logic and does not change any non-version related configuration 
  (note: CI *will* bump version numbers as described in Release Exception section below).
- Builds must be reproducible locally.

### Release Exception (Version Management)

There is one controlled exception to the “CI does not modify the repository” rule:

Version bumps and changelog updates are managed using Changesets.

Depending on the release workflow configuration, CI may:

- Generate a version PR containing version bumps and changelog updates, or
- Publish packages after a developer has already committed version changes.

In either case:

- CI never modifies functional source code.
- Only version metadata and changelogs may be updated automatically.
- Release changes are explicit, reviewable, and traceable in Git history.

