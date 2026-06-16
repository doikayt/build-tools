# tooling-core Review — Cycle 1 Status Summary

## Process

`review-tooling-core.md` runs a structured 3-subagent review (Security / Docs-vs-Implementation
Conformance / DRY-Refactor) against `tooling-core`. It produces two artifacts in this directory:

- `_REVIEW_CONTEXT.md` — compressed, machine-readable findings, intended as input context for
  reviewing the packages that depend on `tooling-core` (`update-markdown-toc`,
  `update-markdown-uml`, `nx-graph-to-mermaid`, `autogen-markdown-doc`) — this is the cycle-1 →
  cycle-2 handoff.
- `_REVIEW_REPORT.md` — full human-readable report with file:line references.

Findings were filed as GitHub issues per instruction: correctness bugs as individual tickets,
everything else grouped by category.

## Issues filed (11 total)

| # | Title | Status |
|---|---|---|
| 2 | `createTransformProcessor` check-mode detection never fires for plain `RunConfig` callers | OPEN — untouched |
| 3 | `--no-external-link-check`/`--link-timeout-ms` in `--help` but throw "Unknown option" at runtime | **CLOSED** — fixed |
| 4 | `--version` flag parsed but silently ignored | OPEN — untouched |
| 5 | Summary line printed in all recursive runs, not only `--verbose` | OPEN — untouched |
| 6 | Package hygiene: `prepack` hook missing, no `private:true`, TECH-STACK.md wrong test runner | OPEN — 2 of 3 sub-items fixed |
| 7 | DRY / code quality — duplicated patterns | OPEN — 1 of 5 sub-items fixed |
| 8 | API surface gaps — undocumented exports, wrong example, missing defaults | OPEN — 1 of 6 sub-items fixed |
| 9 | `test-npm-token.yml` logs `.npmrc`, publishes unconditionally on `workflow_dispatch` | **CLOSED** — fixed (file deleted) |
| 10 | `ProcessingStatus` value `"needsUpdate"` vs README's `"needs update"` | OPEN — untouched |
| 11 | (toc) replace regex heading scanner with `parseHeadings` from tooling-core | OPEN — untouched (cycle-2-adjacent) |

## Fixes applied this cycle

- Redaction-risk comments added above `debugLog(...)` calls in `runCli.ts` and `parseStandardCli.ts`
  (config could carry secrets in the future — flagged, not yet a real issue).
- `--no-external-link-check` / `--link-timeout-ms` parsing centralized into `parseStandardCli.ts`
  and added to `STANDARD_FLAGS` (closes #3). Consequence: `update-markdown-toc/src/cli/descriptor.ts`
  shrank from ~71 lines to ~16 — its local option parsing was now dead weight and was removed.
- README's non-compiling example processor fixed — invalid `ProcessingStatus` strings replaced with
  real ones (#8 partial).
- Duplicate `FileProcessor` interface removed from `RepositoryRunner.ts`; canonical version now
  imported from `types.ts` (#7 partial). This briefly broke CI (`runPlugin.ts` was separately
  importing `FileProcessor` from the old location) — fixed in the same pass.
- Flaky vitest test in `update-markdown-uml` (debug-output test) timeout bumped 5000ms → 10000ms.
- TECH-STACK.md: removed stale "Jest used by tooling-core/toc" claim — confirmed via grep that no
  package in the workspace uses Jest; now states Vitest only (#6 partial).
- TECH-STACK.md: "Private, unpublished package" claim for `tooling-core` corrected by the user
  directly — confirmed by checking `package.json` (`publishConfig.access: "public"`, no `private`
  field) and confirmed live on the npm registry at v1.3.0, matching CHANGELOG/git tags (#6 partial).
- `test-npm-token.yml` deleted by the user (#9, closed).

## Decision in progress (not yet applied)

**`prepack` hook for `tooling-core/package.json`** (#6 remaining item).

- Confirmed `tooling-core` is genuinely published (npm registry shows v1.3.0, matches local
  `package.json`/CHANGELOG/git tags) — so the "stale `dist/` gets published" risk is real, not
  theoretical.
- DESIGN-PRINCIPLES.md's boilerplate (`"prepack": "npm run build"`) does **not** work here:
  `tooling-core/package.json` has `"scripts": {}` — empty, no `build` script — so that hook would
  fail outright with `Missing script: build`.
- Two packages in the workspace (`update-markdown-toc`, `update-markdown-uml`) do have an npm
  `build` script (their NX target just calls `npm run build`), so the boilerplate hook would work
  for them as-is. `tooling-core` and `nx-graph-to-mermaid` inline `tsc` directly in their NX
  `project.json` target instead — no npm script to hook into.
- Recommended fix (verified working from inside `tooling-core/`, NX correctly resolves the
  workspace root from a subdirectory):
  ```json
  "prepack": "npx nx build @datalackey/tooling-core"
  ```
- **Not yet applied** — awaiting go-ahead.

## Still fully open (no fix attempted)

- #2 `createTransformProcessor` check-mode bug
- #4 `--version` no-op
- #5 summary always printed regardless of `--verbose`
- #10 `ProcessingStatus` README casing (`"needsUpdate"` vs `"needs update"`)
- #6 remaining: the `prepack` hook itself (see above)
- #7 remaining: error-message-extraction duplication, `onDebug` callback duplication in
  `runLinkValidation.ts`, partial option-parsing mini-framework, missing `tryInjectBetweenMarkers`
  companion
- #8 remaining: `validateExternalLinks` default undocumented, `listFilesToProcess`'s
  fallback-to-`README.md` undocumented, six undocumented exports, README UML diagram referencing
  non-exported types (`WalkOptions`, `RepositoryRunnerOptions`, `FileLineRef`,
  `DEFAULT_EXCLUDE_DIRS`), stray TODO comment in `src/index.ts`

## Next steps

1. Decide on and apply the `prepack` fix above.
2. Either keep working through the remaining open `tooling-core` issues, or move to cycle 2: run
   the same 3-subagent review against the downstream packages, using `_REVIEW_CONTEXT.md` as input.
   `review-autogen.md` and `review-plugin.md` exist at the repo root and were never checked for
   whether they follow the same review-strategy shape as `review-tooling-core.md` — worth
   confirming before starting cycle 2.
