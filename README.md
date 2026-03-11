<!-- TOC:START -->
- [build-tools](#build-tools)
  - [Tools](#tools)
  - [Overarching Design Patterns Followed](#overarching-design-patterns-followed)
    - [UX Philosophy](#ux-philosophy)
    - [Build Philosophy](#build-philosophy)
      - [Release Exception (Version Management)](#release-exception-version-management)
  - [For Project Maintainers](#for-project-maintainers)
<!-- TOC:END -->


# build-tools


This repository contains tooling designed to assist in building and maintaining software projects —
primarily JavaScript/TypeScript projects at this point.
[This document](./javascript/README.md#packages) describes the tools that are 
currently available.

---

## Overarching Design Patterns Followed

### UX Philosophy

UX is typically considered to be GUI-related, but here we consider the commands and switches exposed by our tools to be 
'our UI'.  The design of this UI follows the principle of **progressive disclosure** —
a well-established UX pattern that surfaces simplicity first, and reveals
complexity only when needed. See [Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
for a canonical treatment of this principle.

In practice this means:

- The default invocation of any tool should work correctly for the most common use case,
  with no flags or configuration required.
- Advanced options (custom exclusion lists, recursive depth, check-only mode, etc.)
  are available but never forced on the user.
- The `@datalackey/autogen-markdown-doc` package is the clearest expression of
  this principle: it bundles `update-markdown-toc` and `nx-graph-to-mermaid`
  into a single command with opinionated defaults that cover the 80% case —
  update all TOC and Mermaid anchor points across a repository with a single invocation.

This philosophy is closely related to **convention over configuration** —
the system works correctly out of the box, and you only configure what deviates from the norm.
Martin Fowler's [bliki entry](https://martinfowler.com/bliki/ConventionOverConfiguration.html)
gives a concise treatment of this principle.

---

### Build Philosophy

Core principles:

- Checked-in source code is the source of truth.
- CI validates, tests, and publishes.
- CI does not generate code, does not modify existing logic and does not change any non-version related configuration
  (note: CI *will* bump version numbers as described in Release Exception section below).
- Builds must be reproducible locally -- across developer machines and CI.

#### Release Exception (Version Management)

There is one controlled exception to the "CI does not modify the repository" rule:

Version bumps and changelog updates are managed using Changesets.

Depending on the release workflow configuration, CI may:

- Generate a version PR containing version bumps and changelog updates, or
- Publish packages after a developer has already committed version changes.

In either case:

- CI never modifies functional source code.
- Only version metadata and changelogs may be updated automatically.
- Release changes are explicit, reviewable, and traceable in Git history.

---

## For Project Maintainers

Please see [this document](CONTRIBUTING.md) for more information.
