# Tooling for JavaScript/TypeScript/Node Projects



## Publishing As NPM Packages

All JavaScript packages in this section of the repo are versioned and published 
to the [public npm registry](https://registry.npmjs.org/) 
using [Changesets](https://changesets-docs.vercel.app/?utm_source=chatgpt.com) .

Packages managed here include:

- [`@datalackey/update-markdown-toc`](./update-markdown-toc/README.md)
- [`@datalackey/nx-graph-to-mermaid`](./nx-graph-to-mermaid/README.md)
- [`@datalackey/autogen-markdown-doc`](./autogen-markdown-doc/README.md) (wrapper package)


Releases are coordinated at the monorepo level. Individual packages are not
manually versioned or published.

---

## Sideways Bump Policy

This repository follows a sideways bump policy:

If a base package is bumped (patch, minor, or major), then any internal
package that depends on it must also receive a version bump — even if
its own source code did not change.

Dependency topology:

@datalackey/update-markdown-toc   \
→ @datalackey/autogen-markdown-doc
@datalackey/nx-graph-to-mermaid   /

When either base package is bumped:

- The wrapper package’s dependency range is updated
- The wrapper package receives a version bump (typically patch)
- The wrapper’s CHANGELOG.md reflects the dependency update

This ensures:

- npm consumers receive a coherent release
- Internal dependency graphs remain version-consistent
- Published artifacts reflect repository state

This behavior is enforced by the Changesets configuration:

javascript/.changeset/config.json

Specifically, the configuration controls:

- Internal dependency update behavior
- How dependent packages are bumped
- How version ranges are rewritten during `changeset version`

Maintainers must not manually edit dependency versions between internal packages.

---

## Release Workflow

### 1. Ensure a Clean Working Tree

git status

There should be no uncommitted changes.

---

### 2. Run All Relevant Tests

Verify that all affected packages pass their test suites.

Example:

cd javascript
```bash
npm run test
```

Do not proceed if any tests fail.

---

### 3. Create a Changeset

From the javascript/ directory:

npx changeset

You will be prompted to:

- Select affected packages
- Choose the semver bump (patch / minor / major)
- Provide a release summary

This creates a markdown file under .changeset/.

Commit the changeset:

git add .changeset
git commit -m "chore: add changeset"

---

### 4. Apply Version Bumps

When ready to cut a release:

npx changeset version

This command:

- Updates package.json versions
- Applies sideways bumps to dependent packages
- Updates internal dependency ranges
- Updates all CHANGELOG.md files
- Removes processed changeset files

Commit the version changes:

git add .
git commit -m "chore: release versions"

---

### 5. Publish to npm

Ensure you are authenticated:

npm whoami

Then publish all updated packages:

npx changeset publish

Packages are published in dependency-safe order.

---

### 6. Push Tags

Changesets creates git tags during publish.

Push them:

git push --follow-tags

---

## Rules

- Version numbers must never be edited manually.
- npm publish must never be run from individual package directories.
- Internal dependency versions must never be manually adjusted.
- All releases must originate from committed Changesets.

