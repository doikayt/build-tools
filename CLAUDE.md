# CLAUDE.md — build-tools

## Active role:  DEV

## Read these files first

Before doing anything, read:

- `javascript/docs/CONTRIBUTING.md` — setup, build, and workflow
- `javascript/docs/DESIGN-PRINCIPLES.md` — architectural decisions and rationale
- `javascript/docs/DOCS_AS_ARCHITECTURE_REVIEW.md` — documentation as architectural feedback
- `javascript/CLI-BEHAVIOR.md` — shared CLI behavior across all tools
- `javascript/TECH-STACK.md` — technology choices
- `javascript/README.md` — package list and workspace overview
- `javascript/tooling-core/README.md` — plugin authoring API reference (foundation — read before any other package)
- `javascript/update-markdown-toc/README.md` — TOC generator and link validator
- `javascript/nx-graph-to-mermaid/README.md` — NX executor modes and project.json patterns
- `javascript/update-markdown-uml/README.md` — UML diagram generator (in development)
- `javascript/update-markdown-uml/_DESIGN_DOC.md` — UML plugin design document (in development)
- `javascript/autogen-markdown-doc/README.md` — uber-bundle entry point and opinionated defaults

---

## Critical rules (not covered elsewhere)

- **Never use `npm run` at workspace root** — always `npx nx run-many` or `npx nx run <target>`
- **Never run `npm install` inside a package directory** — always run from `javascript/`
- **When adding a new package**, add its `paths` entry to `javascript/tsconfig.eslint.json` immediately or lint will fail
- **Never manually edit version numbers** — Changesets owns all versioning
- **Release workflow is handled manually by the maintainer** — never run changeset commands or bump versions

---

## Current work

