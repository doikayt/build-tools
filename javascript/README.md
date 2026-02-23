<!-- TOC:START -->
- [Tooling for JavaScript/TypeScript/Node Projects](#tooling-for-javascripttypescriptnode-projects)
  - [Overview](#overview)
  - [Overall Repo Structure Model](#overall-repo-structure-model)
  - [Publishing as NPM Packages](#publishing-as-npm-packages)
  - [Sideways Version Bump Policy](#sideways-version-bump-policy)
  - [Development and Release Engineering Workflows](#development-and-release-engineering-workflows)
    - [Day to Day Development (Package Level) Overview](#day-to-day-development-package-level-overview)
    - [Integration Testing Overview (Via Combined All-in-One Plugin)](#integration-testing-overview-via-combined-all-in-one-plugin)
    - [Packaging and Release Steps Overview](#packaging-and-release-steps-overview)
  - [Packaging and Release Workflow Details](#packaging-and-release-workflow-details)
    - [1. Ensure a Clean Working Tree](#1-ensure-a-clean-working-tree)
    - [2. Run All Tests](#2-run-all-tests)
    - [3. Create a Changeset](#3-create-a-changeset)
    - [4. Apply Version Bumps](#4-apply-version-bumps)
    - [5. Publish](#5-publish)
    - [6. Push Tags](#6-push-tags)
  - [Handling `changeset status` Errors](#handling-changeset-status-errors)
    - [What this means](#what-this-means)
    - [When you will see this](#when-you-will-see-this)
    - [How to resolve](#how-to-resolve)
      - [Option A — This change SHOULD trigger a release](#option-a--this-change-should-trigger-a-release)
      - [Option B — This change should NOT trigger a release](#option-b--this-change-should-not-trigger-a-release)
    - [Maintainer rules](#maintainer-rules)
- [Activity Diagram](#activity-diagram)
- [Rules](#rules)
<!-- TOC:END -->




# Tooling for JavaScript/TypeScript/Node Projects

## Overview

This section will mostly be of interest to project maintainers. It describes the structure, development workflows, 
and release engineering processes for the JavaScript/TypeScript/Node oriented packages within this repository.


## Overall Repo Structure Model

This repository has three layers:
- The repository root, which contains [CI configuration](../.github/workflows/javascript-ci.yml).
- The secondary (workspace) level:  which is platform specific (i.e., JVM, Python, JavaScript, etc.)
  and contains release packaging and publishing  configuration appropriate
  to a given platform.
-  The lowest level consists of individually consumable npm packages for plugins and tools.
   (Note: npm packaging/publishing format  applies
   in the case of the Javascript ecosystem -- workspaces
   we add in the future would package/publish tools in formats
   suitable for other ecosystems. For example JVM packages
   would be published using Gradle/Maven style Group/Artifact/Version-based
   packages.)



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

Packages managed under this workspace:

- [`@datalackey/update-markdown-toc`](./update-markdown-toc/README.md)
- [`@datalackey/nx-graph-to-mermaid`](./nx-graph-to-mermaid/README.md)
- [`@datalackey/autogen-markdown-doc`](./autogen-markdown-doc/README.md)




## Publishing as NPM Packages

The above referenced JavaScript packages are versioned and published all together, as a single unit,
to the [public npm registry](https://www.npmjs.com/package/package).

We enforce a [semantic versioning](https://semver.org/) policy via
[Changesets](https://changesets-docs.vercel.app/?utm_source=chatgpt.com)
rather than relying on manual update and synchronization of version numbers and
changelog entries across packages.


## Sideways Version Bump Policy

In addition to adhering to semantic versioning, this workspace also follows
a coordinated release alignment policy, enforced by the use of 'fixed' in
our [Changesets configuration](.changeset/config.json)
The rule is: when any publishable package in this workspace is version bumped
(patch, minor, or major), all other publishable packages will be bumped to that same exact
version number — even if there were no source changes within those packages,
and even if they have no direct dependency relationship with the changed package.
The purpose of this policy is to ensure release coherence: ruling out
any ambiguity about compatibility between sibling packages.

Maintainers must:

- Never manually edit version numbers.
- Never manually adjust internal dependency ranges.
- Always use Changesets to produce coordinated releases.


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

From workspace root:

```
cd javascript
npm run build
```

This runs tests across all workspaces.
STOP if any test fails.

---

### 3. Create a Changeset

```
npx changeset
```

You will be prompted to:

- Select affected packages  (use up/down arrow to choose and spacebar to (un)select)
- Choose semver bump (patch / minor / major)
- Provide release summary

Commit:

```
git add .changeset
git commit -m "chore: add changeset" .
```

---

### 4. Apply Version Bumps

```
npx changeset version
```

This command:

- Updates package.json versions
- Applies sideways bumps
- Updates dependency ranges
- Updates all CHANGELOG.md files
- Removes processed changeset files

Commit:

```
git add .
git commit -m "chore: release versions"
```


### 5. Publish (Push + Tags + CI)

Publishing is performed automatically by GitHub Actions when release
commits are pushed to `main`.

Maintainers should **not** normally run `npx changeset publish` locally.

After applying version bumps, perform a single push that includes tags:

    git push origin main --follow-tags

This single command:

-   pushes the release commits
-   pushes the version tags created by Changesets
-   triggers the release workflow
-   results in packages being published to npm

The release workflow executed is:

    .github/workflows/release.yml

You can monitor publish results 
[here](https://github.com/datalackey/build-tools/actions/workflows/release.yml).



The workflow will:

-   install dependencies\
-   run `npx changeset publish`\
-   publish packages to npm using the configured `NODE_AUTH_TOKEN`

------------------------------------------------------------------------

### 6. Verify Release

After the workflow completes, confirm:

-   GitHub Actions run succeeded\
-   Packages appear on npm\
-   Versions match expected coordinated bump

No additional manual tag push step is required when using the
`--follow-tags` push above.


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

This message is **expected and intentional**.

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

You must choose the correct intent.

---

#### Option A — This change SHOULD trigger a release

Create a changeset:

```
npx changeset
```

Follow the prompts:

- select affected package(s)
- choose bump type (patch / minor / major)
- provide a short summary

Then commit the generated file:

```
git add .changeset
git commit -m "chore: add changeset"
```

After this, `changeset status` will succeed.

---

#### Option B — This change should NOT trigger a release

If the change is non-functional (for example):

- documentation updates
- CI changes
- test-only changes
- repository plumbing

create an **empty changeset**:

```
npx changeset add --empty
```

Then commit:

```
git add .changeset
git commit -m "chore: add empty changeset"
```

This explicitly records that no version bump is required.

---

### Maintainer rules

- Never ignore this error.
- Never manually edit package versions.
- Every change affecting publishable packages must have a changeset (real or empty).
- This rule is required for deterministic, auditable releases.

If this error appears in CI, it indicates the PR is missing required release metadata.

---

# Activity Diagram

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

  npx changeset
  git commit .
  git push

  npx changeset version
  git commit
  git push

  npm login                         # Browser-based login for 2FA accounts; CLI login may be used for non-2FA accounts
  npm whoami                        # Verify you see your username 
  npx changeset publish
  git push --follow-tags
```

---

# Rules

- Version numbers must never be edited manually.
- `npm publish` must never be run from individual package directories.
- Internal dependency versions must never be manually adjusted.
- All releases must originate from committed Changesets.
- Workspace root orchestrates — it does not contain product logic.
