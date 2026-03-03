import {
  ProcessingStatus,
  FileProcessor,
  OutputPolicyConfig
} from "./types.js";

export interface RepositoryRunnerOptions<
  TConfig extends OutputPolicyConfig
> {
  processor: FileProcessor<TConfig>;
  config: TConfig;
}

export class RepositoryRunner<
  TConfig extends OutputPolicyConfig
> {
  constructor(
    private options: RepositoryRunnerOptions<TConfig>
  ) {}

  runFiles(files: string[]): number {
    const { processor, config } = this.options;

    const stats: Record<ProcessingStatus, number> = {
      updated: 0,
      unchanged: 0,
      stale: 0,
      skipped: 0
    };

    for (const file of files) {
      try {
        const status = processor.process(file, config);
        stats[status]++;
        this.printStatus(status, file);
      } catch (err) {
        this.printError(err);
        return 1;
      }
    }

    this.printSummary(stats);

    if (config.checkMode && stats.stale > 0) {
      return 1;
    }

    return 0;
  }

  private printStatus(status: ProcessingStatus, file: string) {
    const { quiet, verbose, checkMode } = this.options.config;

    if (quiet) return;

    if (checkMode) {
      if (status === "stale") {
        console.log(`Stale: ${file}`);
      } else if (verbose && status !== "updated") {
        console.log(this.format(status, file));
      }
      return;
    }

    if (verbose) {
      console.log(this.format(status, file));
      return;
    }

    if (status === "updated") {
      console.log(`Updated: ${file}`);
    }
  }

  private printSummary(stats: Record<ProcessingStatus, number>) {
    const { quiet, verbose } = this.options.config;
    if (quiet || !verbose) return;

    console.log(
      `Summary: ${stats.updated} updated, ` +
      `${stats.stale} stale, ` +
      `${stats.unchanged} unchanged, ` +
      `${stats.skipped} skipped`
    );
  }

  private format(status: ProcessingStatus, file: string) {
    switch (status) {
      case "updated": return `Updated: ${file}`;
      case "unchanged": return `Up-to-date: ${file}`;
      case "stale": return `Stale: ${file}`;
      case "skipped": return `Skipped (no markers): ${file}`;
    }
  }

  private printError(err: unknown) {
    const message =
      err instanceof Error ? err.message : String(err);
    console.error(`ERROR: ${message}`);
  }
}
