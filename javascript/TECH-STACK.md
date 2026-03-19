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


### Type Resolution and the Lint Target

ESLint is configured for type-aware linting via
[`tsconfig.eslint.json`](tsconfig.eslint.json) with
`@typescript-eslint/parser`. That parser performs type-aware linting, which
means it needs fully resolved types for all imports.

Each package resolves `@datalackey/tooling-core` via a `paths` alias in its own
[`tsconfig.json`](nx-graph-to-mermaid/tsconfig.json), pointing directly at
the source:
```json
"paths": {
  "@datalackey/tooling-core": ["../tooling-core/src/index.ts"]
}
```

However, [`tsconfig.eslint.json`](tsconfig.eslint.json) is a standalone
config — it includes all package source files directly via its own `include`
globs, but it does not inherit from or compose the per-package `tsconfig.json`
files, and therefore does not see their `paths` declarations.

So when ESLint's parser encounters `import ... from '@datalackey/tooling-core'`
in any package's source, it resolves that as a normal npm package — looking in
`node_modules/@datalackey/tooling-core/package.json` and following the
`exports` field's `"types"` condition:
```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  }
}
```

That points to `./dist/index.d.ts` — which only exists after a build. Without
`dist`, resolution fails and everything imported from `tooling-core` becomes
`any`, triggering widespread `@typescript-eslint/no-unsafe-*` violations across
all packages that depend on it.

#### Automatic Build Ordering

A full build of all packages must complete before lint is attempted. This is
handled automatically: the lint target in
[`project.json`](project.json) declares:
```json
"dependsOn": ["^build"]
```

and `build-tools-workspace` declares
[`implicitDependencies`](project.json) covering all packages in the
workspace. NX resolves this into a full build of every package before the lint
command runs. No manual build step is required.
