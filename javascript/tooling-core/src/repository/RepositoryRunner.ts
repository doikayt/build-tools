import type { OutputPolicyConfig } from "./types.js"
import type { RunnerPolicy } from "./types.js"

export type ProcessingStatus =
  | "updated"
  | "unchanged"
  | "stale"
  | "skipped"

export interface FileProcessor<TConfig extends OutputPolicyConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus
}

export interface RepositoryRunnerOptions<TConfig extends OutputPolicyConfig> {
  processor: FileProcessor<TConfig>
  config: TConfig
  policy: RunnerPolicy
}

export interface RepositoryStats {
  updated: number
  unchanged: number
  stale: number
  skipped: number
}

export class RepositoryRunner<TConfig extends OutputPolicyConfig> {

  private readonly processor: FileProcessor<TConfig>
  private readonly config: TConfig
  private readonly policy: RunnerPolicy

  constructor(options: RepositoryRunnerOptions<TConfig>) {
    this.processor = options.processor
    this.config = options.config
    this.policy = options.policy
  }

  runFiles(files: string[]): RepositoryStats {

    const stats: RepositoryStats = this.getInitCounterState()   // all counters of file-processing-results intit to 0's

    if (!Array.isArray(files)) {                                // JavaScript plugin clients might pass us bad things
      throw new Error("RepositoryRunner expected files[] array");
    }

    for (const file of files) {

      let result: ProcessingStatus

      try {
        result = this.processor.process(file, this.config)
      } catch (err) {

        if (this.policy.continueOnError) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`ERROR: ${message}`)
          continue
        }

        throw err
      }

      if (this.policy.printPerFileStatus && !this.config.quiet) {
        this.printFileStatus(result, file);                        // Notify file processing result: updated,stale,etc.
      }
      this.updateCounters(result, stats);
    }

    this.printSummary(stats)

    if (this.config.runMode === "check" && stats.stale > 0) {
      process.exitCode = 1
    }

    return stats
  }

  private updateCounters(result: "updated" | "unchanged" | "stale" | "skipped", stats: RepositoryStats) {
    switch (result) {       // TODO - refactor to method

      case "updated":
        stats.updated++
        break

      case "unchanged":
        stats.unchanged++
        break

      case "stale":
        stats.stale++
        break

      case "skipped":
        stats.skipped++
        break
    }
  }

  private printFileStatus(result: "updated" | "unchanged" | "stale" | "skipped", file: string) {
    switch (result) {     // TODO - refactor to method

      case "updated":
        console.log(`Updated: ${file}`)
        break

      case "unchanged":
        console.log(`Up-to-date: ${file}`)
        break

      case "stale":
        console.log(`Stale: ${file}`)
        break

      case "skipped":
        console.log(`Skipped (no markers): ${file}`)
        break
    }
  }

  private getInitCounterState() {
    return {
      updated: 0,
      unchanged: 0,
      stale: 0,
      skipped: 0
    };
  }

  private printSummary(stats: RepositoryStats): void {

    if (!this.policy.printSummary || this.config.quiet) {
      return
    }

    console.log(
      `Summary: ${stats.updated} updated, ${stats.stale} stale, ${stats.unchanged} unchanged, ${stats.skipped} skipped`
    )
  }
}
