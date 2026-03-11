# Tech Stack

This document describes the tools and technologies used across all packages in this workspace.

---

## Runtime

- **[Node.js](https://nodejs.org/)** ≥ 18
  Node 18 is the minimum required version. It introduced stable ESM support and
  built-in `fetch`, eliminating the need for polyfills in common automation scenarios.

---

## Module System

- **ESM-only** ([ECMAScript Modules](https://nodejs.org/api/esm.html))
  All packages are published as pure ESM. They use `import`/`export` syntax and
  declare `"type": "module"` in `package.json`. CommonJS `require()` is not supported.
  Consumers must use Node.js 18+ and an ESM-compatible toolchain.

---

## Language

- **[TypeScript](https://www.typescriptlang.org/)** ≥ 5.4
  All source code is written in strict TypeScript. Compiled to ESM JavaScript via `tsc`.
  No bundler is used — `tsc` output is published directly.

---

## Build Orchestration

- **[NX](https://nx.dev/)** 22.x
  Manages build and test task execution across packages in the workspace.
  Dependency ordering is declared via `dependsOn` in each package's `project.json`.
  NX owns the full execution graph — npm workspace scripts are not used for orchestration.

---

## Test Runners

- **[Jest](https://jestjs.io/)** — used by `tooling-core` and `update-markdown-toc`
- **[Vitest](https://vitest.dev/)** — used by `nx-graph-to-mermaid`

Two test runners exist for historical reasons. New packages should prefer Vitest.

---

## Release Management

- **[Changesets](https://github.com/changesets/changesets)**
  Manages versioning, changelog generation, and coordinated publishing across all
  packages. All version bumps must originate from a committed changeset.
  See [Contributing](./docs/CONTRIBUTING.md#publishing-as-npm-packages) for details.

---

## Internal Packages

- **[`@datalackey/tooling-core`](./tooling-core/README.md)**
  Private, unpublished package containing shared logic used by other packages in
  this workspace. Not available on npm.

---

## Package Relationships
```
@datalackey/autogen-markdown-doc
  ├── @datalackey/update-markdown-toc
  │     └── @datalackey/tooling-core
  └── @datalackey/nx-graph-to-mermaid
        └── @datalackey/tooling-core
```
