# Tooling for JavaScript/TypeScript/Node Projects


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
to the [public npm registry](https://www.npmjs.com/package/package)
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

# Locus of Activity

## Development Locus (Package Level)

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

## Integration Testing Locus (Wrapper Package)

Cross-package testing lives inside:

```
javascript/autogen-markdown-doc
```

The wrapper package is the integration boundary.  
It imports and composes the base plugins.

Cross-package tests belong there — not at workspace root.

---

## Release Locus (Workspace Level)

Release mechanics must run from:

```
cd javascript
```

Because that is where:

- `package.json` (with `"workspaces"`)
- `.changeset/`
- release configuration

live.

Release commands:

- `npx changeset`
- `npx changeset version`
- `npx changeset publish`

---


# Release Workflow

## 1. Ensure a Clean Working Tree

```
git status
```

There should be no uncommitted changes.

---

## 2. Run All Tests

From workspace root:

```
cd javascript
npm run test
```

This runs tests across all workspaces.

Do not proceed if any test fails.

---

## 3. Create a Changeset

```
npx changeset
```

You will be prompted to:

- Select affected packages
- Choose semver bump (patch / minor / major)
- Provide release summary

Commit:

```
git add .changeset
git commit -m "chore: add changeset"
```

---

## 4. Apply Version Bumps

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

---

## 5. Publish

Ensure authentication:

```
npm whoami
```

Then:

```
npx changeset publish
```

This:

- Runs package lifecycle scripts (build / prepack)
- Packs tarballs
- Publishes to npm
- Uses dependency-safe order

---

## 6. Push Tags

```
git push --follow-tags
```

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
  git commit
  git push

  npx changeset version
  git commit
  git push

  npx changeset publish
  git push --follow-tags
```

---

# Rules

- Version numbers must never be edited manually.
- `npm publish` must never be run from individual package directories.
- Internal dependency versions must never be manually adjusted.
- All releases must originate from committed Changesets.
- Cross-package tests belong in the wrapper package.
- Workspace root orchestrates — it does not contain product logic.
