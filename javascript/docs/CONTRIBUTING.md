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
- The repository root, which contains [CI configuration](../../.github/workflows/javascript-ci.yml) and resides one level up from the `javascript` folder.
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

This workspace uses [NX](https://nx.dev/) to orchestrate builds and tests across packages.
NX owns the full execution graph — do not use `npm run build` or `npm test` at the workspace
root to drive builds. Use NX directly:
```bash
npx nx run-many -t build,test --skip-nx-cache
```

Dependency ordering is declared in each package's `project.json` via `dependsOn`.

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

### 4. Apply Version Bumps

From this folder (`javascript/`), run commands below to update versions, changelogs, and package metadata.
```
npx changeset version
```

This command:

- Updates package.json versions
- Applies sideways bumps
- Updates dependency ranges
- Updates all CHANGELOG.md files
- Removes processed changeset files

After running this command if you want to see the version bumps, type: `git diff` from `javascript/` folder.

Next, commit the version bump metadata and create an annotated tag for the new version:

Capture the VERSION:
```sh
VERSION="$(node -p "require('./update-markdown-toc/package.json').version")"
```

And add the tag:
```sh
git add . && \
git commit -m "chore: release v${VERSION}" && \
git tag -a "v${VERSION}" -m "Release v${VERSION}"
```

---

### 5. Publish (Push + Tags + CI)

Publishing is performed automatically by GitHub Actions when release
commits are pushed to `main`.

Maintainers should **not** normally run `npx changeset publish` locally.

After applying version bumps, perform a single push that includes tags:

    git push origin main --follow-tags

This single command:

- pushes the release commits
- pushes the version tags created by Changesets
- triggers the release workflow
- results in packages being published to npm

The configuration for the release workflow is viewable [here](../../.github/workflows/release.yml).
You can monitor publish results [here](https://github.com/datalackey/build-tools/actions/workflows/release.yml).

The workflow will:

- install dependencies
- run `npx changeset publish`
- publish packages to npm using the configured `NODE_AUTH_TOKEN`

---

### 6. Verify Release

After the workflow completes, confirm:

- GitHub Actions run succeeded
- Packages appear on npm
- Versions match expected coordinated bump

No additional manual tag push step is required when using the `--follow-tags` push above.

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
  git push

  npx changeset version
  git commit
  git push --follow-tags
                                         Runs release workflow
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
