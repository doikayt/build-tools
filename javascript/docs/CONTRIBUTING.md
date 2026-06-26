<!-- TOC:START -->
- [Contributing to JavaScript/TypeScript/Node Packages](#contributing-to-javascripttypescriptnode-packages)
  - [First-Time Setup](#first-time-setup)
  - [Overall Repo Structure Model](#overall-repo-structure-model)
  - [Build Pipeline](#build-pipeline)
  - [Package Naming Policy](#package-naming-policy)
  - [Development and Release Engineering Workflows](#development-and-release-engineering-workflows)
    - [Day to Day Development (Package Level) Overview](#day-to-day-development-package-level-overview)
    - [Integration Testing Overview (Via Combined All-in-One Plugin)](#integration-testing-overview-via-combined-all-in-one-plugin)
    - [Packaging and Release Steps Overview](#packaging-and-release-steps-overview)
  - [Packaging and Release Workflow Details](#packaging-and-release-workflow-details)
    - [1. Ensure a Clean Working Tree](#1-ensure-a-clean-working-tree)
    - [2. Run All Tests](#2-run-all-tests)
    - [3. Create a Changeset](#3-create-a-changeset)
    - [4. Push — CI does the rest](#4-push--ci-does-the-rest)
    - [5. Verify Release](#5-verify-release)
  - [Versioning Tiers](#versioning-tiers)
    - [Bump levels](#bump-levels)
    - [Commit prefix → bump mapping](#commit-prefix--bump-mapping)
    - [Forcing a specific bump level](#forcing-a-specific-bump-level)
    - [Suppressing a release](#suppressing-a-release)
  - [Handling `changeset status` Errors](#handling-changeset-status-errors)
    - [What this means](#what-this-means)
    - [When you will see this](#when-you-will-see-this)
    - [How to resolve](#how-to-resolve)
      - [Option A — This change SHOULD trigger a release](#option-a--this-change-should-trigger-a-release)
      - [Option B — This change should NOT trigger a release](#option-b--this-change-should-not-trigger-a-release)
    - [rules](#rules)
    - [Maintainer rules](#maintainer-rules)
  - [Activity Diagram](#activity-diagram)
  - [Rules](#rules-1)
  - [Publishing as NPM Packages](#publishing-as-npm-packages)
  - [Sideways Version Bump Policy](#sideways-version-bump-policy)
  - [Design Principles](#design-principles)
<!-- TOC:END -->

# Contributing to JavaScript/TypeScript/Node Packages

This guide is targeted to project contributors and covers first-time setup, day-to-day development, and release engineering
for the packages in the `javascript/` workspace.

For the top-level contributor entry point see: [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## First-Time Setup
```bash
mkdir -p ~/workspace && cd ~/workspace
git clone git@github.com:datalackey/build-tools.git
cd build-tools/javascript
npm ci
npx nx run-many -t build,test --skip-nx-cache
```

---

## Overall Repo Structure Model

This repo has three layers:
- The repository root, which contains [CI configuration](../../.github/workflows/javascript-ci.yml) and 
  resides one level up from the `javascript` folder.
- The secondary (platform) level where the `javascript/` folder lives. Each folder at this level is specific
  to some given platform (e.g.: JVM, Javascript, Python, etc.) and contains
  appropriate release packaging and publishing configuration for that platform.
- The lowest level consists of individually consumable packages for plugins and tools.
```
 Repo Root                       ← CI configuration
│
├── javascript/                  ← npm workspace + Changesets control plane
│   ├── update-markdown-toc/
│   ├── nx-graph-to-mermaid/
│   └── autogen-markdown-doc/
│
├── jvm/                         ← possible future JVM workspace
│
└── python/                      ← possible future Python workspace
```

---

## Build Pipeline

This workspace uses **NX** (See: https://nx.dev/) to orchestrate builds and tests across packages.
NX owns the full execution graph — do not use `npm run build` or `npm test` at the workspace
root to drive builds. Use NX directly:
```bash
npx nx run-many -t build,test --skip-nx-cache
```

Dependency ordering is declared in each package's `project.json` via `dependsOn`.

---

## Package Naming Policy

Every publishable package under `javascript/` must use the `@datalackey/` scope as its name —
consistently in **both** `package.json` (`name`) and `project.json` (`name`). For example:
`@datalackey/update-markdown-toc`.

**Exception:** the top-level orchestrating workspace (`javascript/` itself) is unscoped:
- `package.json` name: `build-tools`
- `project.json` name: `build-tools-workspace`

Rationale:

- The `@datalackey/` scope identifies packages that are actually published to npm. The workspace
  root is never published — it only orchestrates builds, tests, and releases for the packages
  beneath it — so giving it a scoped name would misleadingly imply it's a consumable artifact.
- Keeping `package.json` and `project.json` names identical for each package avoids ambiguity
  in NX target references (e.g. `dependsOn` entries, `prepack` scripts). A mismatch between the
  two means some commands must reference the package by its unscoped NX project name while
  others must use the scoped npm name — an easy source of broken `dependsOn` graphs and
  copy-paste errors when authoring new targets.

---

## Development and Release Engineering Workflows

### Day to Day Development (Package Level) Overview

When working on a specific plugin:
```
cd javascript/nx-graph-to-mermaid
```

Typical workflow:

- Edit source files
- npm run build
- npm test
- git add .
- git commit
- git push

Day-to-day development lives inside the individual package folder.

---

### Integration Testing Overview (Via Combined All-in-One Plugin)

Cross-package testing lives inside:
```
javascript/autogen-markdown-doc
```

The wrapper package is the integration boundary.
It imports and composes the base plugins, and adds a little bit of its own functionality.

Cross-package tests belong there — not at workspace root.

---

### Packaging and Release Steps Overview

Release mechanics must run from:
```
cd javascript
```

Because that is where we have:

- `package.json` (with `"workspaces"`)
- `.changeset/`
- release configuration

Release commands:

- `npx changeset`
- `npx changeset version`
- `npx changeset publish`

---

## Packaging and Release Workflow Details

### 1. Ensure a Clean Working Tree
```
git status
```

There should be no uncommitted changes.

---

### 2. Run All Tests
```bash
cd javascript
npx nx run-many -t build,test --skip-nx-cache
```

STOP if any test fails.

---

### 3. Create a Changeset
```
npx changeset
```

You will be prompted to:

- Select affected packages (use up/down arrow to choose and spacebar to (un)select)
- Choose semver bump (patch / minor / major)
- Provide release summary

Commit:
```
git add .changeset
git commit -m "chore: add changeset" .
```

---

### 4. Push — CI does the rest

Commit your changes and push:
```sh
git add .
git commit -m "fix(my-package): description of what changed"
git push origin main
```

CI will automatically:
- Inspect the git log since the last release tag and derive the semver bump from your commit prefix (see [Versioning tiers](#versioning-tiers) below)
- Run `npx changeset version` (bumps all package versions, updates changelogs)
- Commit the version bumps back to main with `[skip ci]`
- Run `npx changeset publish` to publish all packages to npm

You can follow progress in
[GitHub Actions](https://github.com/datalackey/build-tools/actions/workflows/javascript-ci.yml).

---

### 5. Verify Release

After the workflow completes, confirm:

- GitHub Actions run succeeded
- Packages appear on npm
- Versions match expected coordinated bump

---

## Versioning Tiers

All packages in this workspace are versioned together as a single unit (see [Sideways Version Bump Policy](#sideways-version-bump-policy)).
The semver bump level is derived automatically from your commit message prefixes via `scripts/auto-changeset.sh`.

### Bump levels

Semver version numbers follow the format **MAJOR.MINOR.PATCH** (e.g. `1.4.2`):

| Tier | Version change | When to use |
|---|---|---|
| **PATCH** | `1.4.0 → 1.4.1` | Bug fixes, performance improvements — no new API surface |
| **MINOR** | `1.4.0 → 1.5.0` | New features that are backwards-compatible |
| **MAJOR** | `1.4.0 → 2.0.0` | Breaking changes — existing callers must update their code |

### Commit prefix → bump mapping

| Commit prefix | Bump | Example |
|---|---|---|
| `fix:` or `fix(scope):` | patch | `fix(toc): handle headings after HTML blocks` |
| `perf:` or `perf(scope):` | patch | `perf: cache slugger across files` |
| `feat:` or `feat(scope):` | patch | `feat: add --quiet flag to all plugins` |
| `feat!:` or `feat(scope)!:` | **major** | `feat!: remove deprecated --output flag` |
| `BREAKING CHANGE` in commit body | **major** | any prefix + `BREAKING CHANGE: ...` in body |
| `chore:`, `ci:`, `docs:`, `refactor:`, `style:`, `test:` | none | no release triggered |

> **Note:** Automated releases are intentionally conservative — `feat:` maps to patch, not minor.
> Use `npx changeset` before pushing to explicitly declare a minor or major bump.

The highest bump level found across all commits since the last release tag wins.

### Forcing a specific bump level

If the commit prefix convention doesn't reflect the true impact of a change — for example,
a `refactor:` that silently breaks a public API — run `npx changeset` manually before pushing:

```sh
cd javascript
npx changeset
# select bump level and write a description at the prompt
git add .changeset
git commit -m "chore: add changeset"
git push origin main
```

The auto-generation script skips when a handwritten changeset file already exists, so
the manual changeset takes full precedence.

### Suppressing a release

If your commits touch publishable package files but should not trigger a release
(e.g. a documentation-only change committed with `docs:` that somehow needs no version bump):

```sh
cd javascript
npx changeset add --empty
git add .changeset
git commit -m "chore: skip release"
git push origin main
```

The empty changeset satisfies the pipeline without bumping any version.

---

## Handling `changeset status` Errors

When running:
```
npx changeset status
```

you may see:
```
🦋  error Some packages have been changed but no changesets were found.
🦋  error Run `changeset add` to resolve this error.
🦋  error If this change doesn't need a release, run `changeset add --empty`.
```

### What this means

Changesets has detected that:

- Files affecting publishable packages have changed, and
- No corresponding `.changeset/*.md` file exists describing release intent.

Changesets refuses to proceed because releases in this repository must always be **explicit and deterministic**.

This safeguard prevents:

- accidental releases
- ambiguous version bumps
- silent drift between code and published packages

---

### When you will see this

You will typically encounter this message after:

- modifying code in a publishable package
- merging a PR without adding a changeset
- running local experiments that touched package files

---

### How to resolve

#### Option A — This change SHOULD trigger a release
```
npx changeset
```

Follow the prompts, then commit:
```
git add .changeset
git commit -m "chore: add changeset"
```

#### Option B — This change should NOT trigger a release
```
npx changeset add --empty
```

Then commit:
```
git add .changeset
git commit -m "chore: add empty changeset"
```

---

### rules
### Maintainer rules

- Never ignore this error.
- Never manually edit package versions.
- Every change affecting publishable packages must have a changeset (real or empty).
- This rule is required for deterministic, auditable releases.

If this error appears in CI, it indicates the PR is missing required release metadata.

---

## Activity Diagram

DEVELOPMENT FLOW
```
cd javascript/nx-graph-to-mermaid

  edit files
  npm run build
  npm test
  git commit
  git push
```

RELEASE FLOW
```
cd javascript

  DEVELOPER                              CI  (https://github.com/datalackey/build-tools/actions)

  npx changeset
  git commit .
  git push          ───────────────────► build job passes
                                         changeset version  (bumps versions, commits [skip ci])
                                         changeset publish  (publishes to npm)
```

---

## Rules

- Version numbers of packages must never be edited manually.
- Version numbers of depended-on packages must never be manually adjusted.
- `npm publish` must never be run from individual package directories (leave that to CI).
- All releases must originate from committed Changesets.
- Workspace root (second level folder) orchestrates — it does not contain product logic.

---

## Publishing as NPM Packages

The packages in this workspace are versioned and published all together, as a single unit,
to the [public npm registry](https://www.npmjs.com/package/package).

We enforce a [semantic versioning](https://semver.org/) policy via
[Changesets](https://changesets-docs.vercel.app/)
rather than relying on manual update and synchronization of version numbers and
changelog entries across packages.

---

## Sideways Version Bump Policy

This workspace follows a coordinated release alignment policy, enforced by the use of `fixed` in
our [Changesets configuration](../.changeset/config.json).

The rule is: when any publishable package in this workspace is version bumped
(patch, minor, or major), all other publishable packages will be bumped to that same exact
version number — even if there were no source changes within those packages,
and even if they have no direct dependency relationship with the changed package.

The purpose of this policy is to ensure release coherence: ruling out
any ambiguity about compatibility between sibling packages.

Implications:

- Maintainers must never manually edit version numbers.
- Maintainers must never manually adjust internal dependency ranges.
- Always use Changesets to produce coordinated releases.
- After successful publishing, all packages in the workspace will be at the same version number.


## Design Principles 

For the reasoning behind structural and architectural decisions that shaped the implementation of all 
current plug-ins (and which should be followed going forward), refer to  [this document](DESIGN-PRINCIPLES.md)


