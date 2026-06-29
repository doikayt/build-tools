import type { ProcessingStatus } from "../repository/types.js";

export type RunnerDecision = "abort" | "continue";

/*
RunnerPolicy

The RunnerPolicy defines how the repository runner responds to processor
results and errors. It is influenced by several CLI options that affect
execution semantics.

The policy does NOT perform processing itself. Instead it decides how the
runner should react to outcomes produced by a FileProcessor.


------------------------------------------------------------------------------
Command-line switches influencing policy behavior
------------------------------------------------------------------------------
|                                                                            |
| CLI option      | Effect on RunnerPolicy behavior                          |
|-----------------|----------------------------------------------------------|
| --recursive     | Enables continuation semantics. Processor errors that    |
|                 | indicate a non-actionable file may be treated as "skip"  |
|                 | instead of aborting the run.                             |
|                 |                                                          |
| --check         | Changes interpretation of processor results.             |
|                 | Files whose generated output differs from current        |
|                 | content are reported as "needs update" instead of being  |
|                 | written out.                                             |
|                 |                                                          |
| --verbose       | Enables printing of per-file disposition messages such as|
|                 | "Updated:", "Up-to-date:", "Skipped:", "Needs update:"   |
|                 |                                                          |
| --quiet         | Suppresses all non-error output, including per-file      |
|                 | status messages and final summaries.                     |
|                 |                                                          |
| --debug         | Enables additional diagnostic output for debugging       |
|                 | traversal and processing behavior.                       |
------------------------------------------------------------------------------


---------------------------------------------------------------------------------
Processor result interpretation
---------------------------------------------------------------------------------
The FileProcessor returns one of the following status values:
---------------------------------------------------------------------------------
| Status       | Meaning                                                        |
|--------------|----------------------------------------------------------------|
| updated      | File was modified and written to disk.                         |
| unchanged    | File already contained the correct generated content.          |
| needsUpdate  | Generated content differs but was not written                  |
|              | because the tool is running in --check mode.                   |
| skipped      | File was intentionally ignored by the plugin.                  |
---------------------------------------------------------------------------------


---------------------------------------------------------------------------
Error handling rules
---------------------------------------------------------------------------
The policy also determines how processor errors are handled.
-----------------------------------------------------------------------------
| Scenario                              | Single-file mode | Recursive mode |
|---------------------------------------|------------------|----------------|
| Missing file                          | Abort            | Abort          |
| Permission/read error                 | Abort            | Abort          |
| Non-actionable file (no markers etc.) | Abort            | Skip file      |
| Structural error                      | Abort            | Abort          |
| Any unexpected processor error        | Abort            | Abort          |
-----------------------------------------------------------------------------

In recursive mode, non-actionable files are skipped. All structural or
filesystem errors still abort execution immediately.



---------------------------------------------------------------------------
Output behavior
---------------------------------------------------------------------------
Output messages are controlled by the policy and CLI switches.

| Condition                  | Default | --verbose | --quiet |
|----------------------------|---------|-----------|---------|
| Updated file               | Print   | Print     | Hide    |
| Up-to-date file            | Hide    | Print     | Hide    |
| Skipped file               | Hide    | Print     | Hide    |
| Needs update (--check)     | Print   | Print     | Hide    |
| Summary line               | Hide    | Print     | Hide    |

Errors are always printed regardless of verbosity level.

---------------------------------------------------------------------------
Design note
---------------------------------------------------------------------------

RunnerPolicy separates *processing logic* from *execution semantics*.

FileProcessor implementations should:

  • return a status value
  • throw errors when processing fails

The RunnerPolicy decides:
  • whether execution continues after a processor error
  • what messages are printed per file
  • whether a summary line is printed

*/
export interface RunnerPolicy {
  shouldPrint(status: ProcessingStatus): boolean;
  shouldPrintSummary(): boolean;
  handleProcessorError(file: string, error: unknown): RunnerDecision;
}
