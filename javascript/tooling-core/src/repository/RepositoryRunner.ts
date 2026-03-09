import type { RunConfig, ProcessingStatus } from "./types.js"
import type { RunnerPolicy } from "../policy/RunnerPolicy.js"


export interface FileProcessor<TConfig extends RunConfig> {
  process(filePath: string, config: TConfig): ProcessingStatus
}

export interface RepositoryRunnerOptions<TConfig extends RunConfig> {
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

export class RepositoryRunner<TConfig extends RunConfig> {

  private readonly processor: FileProcessor<TConfig>
  private readonly config: TConfig
  private readonly policy: RunnerPolicy

  constructor(options: RepositoryRunnerOptions<TConfig>) {
    this.processor = options.processor
    this.config = options.config
    this.policy = options.policy
  }

  run(files: string[]): RepositoryStats {                  // TODO - name it 'run'

    const stats: RepositoryStats = this.getInitCounterState()   // all counters of file-processing-results intit to 0's

    if (!Array.isArray(files)) {                                // JavaScript plugin clients might pass us bad things
      throw new Error("RepositoryRunner expected files[] array");
    }

    for (const file of files) {

      let result: ProcessingStatus

      try {
        result = this.processor.process(file, this.config)
      } catch (err) {

        if (this.policy.handleProcessorError(file, err) === "continue") {
          continue
        }

        throw err
      }

      if (this.policy.shouldPrint(result)) {
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

  private updateCounters(result: ProcessingStatus, stats: RepositoryStats) {
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

  private printFileStatus(result: ProcessingStatus, file: string) {
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

    if (!this.policy.shouldPrintSummary()) {
      return
    }

    console.log(
      `Summary: ${stats.updated} updated, ${stats.stale} stale, ${stats.unchanged} unchanged, ${stats.skipped} skipped`
    )
  }
}
