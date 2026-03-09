import type { RunMode } from "../cli/runMode.js";


/*
RunnerPolicy

The RunnerPolicy defines how the repository runner responds to processor
results and errors. It is influenced by several CLI options that affect
execution semantics.

We explain processing in terms of our first plugin which updates the
table of contents of a Markdown file using special sentinel TOC markers
which indcate where table of contents is to be inserted.

The policy does NOT perform processing itself. Instead it decides how the
runner should react to outcomes produced by a FileProcessor.

---------------------------------------------------------------------------
Command-line switches influencing policy behavior
------------------------------------------------------------------------------
|                                                                            |
| CLI option      | Effect on RunnerPolicy behavior                          |
|-----------------|----------------------------------------------------------|
| --recursive     | Enables continuation semantics. Processor errors that    |
|                 | indicate a non-actionable file (e.g. missing TOC markers)|
|                 | may be treated as "skip" instead of aborting the run.    |
|                 |                                                          |
| --check         | Changes interpretation of processor results.             |
|                 | Files whose generated output differs from current        |
|                 | content are reported as "stale" instead of being written.|
|                 |                                                          |
| --verbose       | Enables printing of per-file disposition messages such as|
|                 | "Updated:", "Up-to-date:", "Skipped:", or "Stale:".      |
|                 |                                                          |
| --quiet         | Suppresses all non-error output, including per-file      |
|                 | status messages and final summaries.                     |
|                 |                                                          |
| --debug         | Enables additional diagnostic output for debugging       |
|                 | traversal and processing behavior.                       |
---------------------------------------------------------------------------
Processor result interpretation
---------------------------------------------------------------------------

The FileProcessor returns one of the following status values:

| Status     | Meaning                                               |
|------------|--------------------------------------------------------|
| updated    | File was modified and written to disk.                 |
| unchanged  | File already contained the correct generated content.  |
| stale      | Generated content differs but was not written          |
|            | because the tool is running in --check mode.           |
| skipped    | File was intentionally ignored (e.g. missing markers). |

---------------------------------------------------------------------------
Error handling rules
---------------------------------------------------------------------------

The policy also determines how processor errors are handled.

| Scenario                                   | Single-file mode | Recursive mode |
|---------------------------------------------|------------------|---------------|
| Missing file                                | Abort            | Abort         |
| Permission/read error                       | Abort            | Abort         |
| Missing TOC markers                         | Abort            | Skip file     |
| Mismatched TOC markers                      | Abort            | Abort         |
| File contains markers but no headings       | Abort            | Abort         |
| Any unexpected processor error              | Abort            | Abort         |

In recursive mode, files without TOC markers are treated as non-actionable
and therefore skipped. All structural or filesystem errors still abort
execution immediately.

---------------------------------------------------------------------------
Output behavior
---------------------------------------------------------------------------

Output messages are controlled by the policy and CLI switches.

| Condition            | Default | --verbose | --quiet |
|--------------------- |-------- |-----------|--------|
| Updated file         | Print   | Print     | Hide   |
| Up-to-date file      | Hide    | Print     | Hide   |
| Skipped file         | Hide    | Print     | Hide   |
| Stale file (--check) | Print   | Print     | Hide   |
| Summary line         | Print   | Print     | Hide   |

Errors are always printed regardless of verbosity level.

---------------------------------------------------------------------------
Design note
---------------------------------------------------------------------------

RunnerPolicy separates *processing logic* from *execution semantics*.

FileProcessor implementations should:

  • return a status value
  • throw errors when processing fails

The RunnerPolicy decides:

  • whether execution continues
  • what messages are printed
  • how results affect exit codes
*/
export interface RunnerPolicy {
  isRecursive: boolean
  printPerFileStatus: boolean
  printSummary: boolean
  continueOnError: boolean
}


export interface FileProcessor<TConfig extends OutputPolicyConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus;
}

export interface OutputPolicyConfig {
  runMode: RunMode;
  mode: "single" | "recursive";
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
}

export type ProcessingStatus =
    | "updated"
    | "unchanged"
    | "stale"
    | "skipped";

