import type { OutputPolicyConfig } from "./types.js"

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

  constructor(options: RepositoryRunnerOptions<TConfig>) {
    this.processor = options.processor
    this.config = options.config
  }

  runFiles(files: string[]): RepositoryStats {

    const stats: RepositoryStats = {
      updated: 0,
      unchanged: 0,
      stale: 0,
      skipped: 0
    }

    const isRecursive = files.length > 1

    for (const file of files) {

      let result: ProcessingStatus

      try {
        result = this.processor.process(file, this.config)
      } catch (err) {

        if (isRecursive) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`ERROR: ${message}`)
          continue
        }

        throw err
      }

      if (!this.config.quiet) {
        switch (result) {

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

      switch (result) {

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

    this.printSummary(stats, isRecursive)

    if (this.config.runMode === "check" && stats.stale > 0) {
      process.exitCode = 1
    }

    return stats
  }

  private printSummary(stats: RepositoryStats, isRecursive: boolean): void {

    if (this.config.quiet) {
      return
    }

    if (!isRecursive || !this.config.verbose) {
      return
    }

    console.log(
        `Summary: ${stats.updated} updated, ${stats.stale} stale, ${stats.unchanged} unchanged, ${stats.skipped} skipped`
    )
  }
}