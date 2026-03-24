import type { RunConfig, ProcessingStatus } from "./types.js";
import type { RunnerPolicy } from "../policy/RunnerPolicy.js";
import { debugLog } from "../logging/debugLog.js";

export interface FileProcessor<TConfig extends RunConfig> {
    process(filePath: string, config: TConfig): ProcessingStatus;
}

export interface RepositoryRunnerOptions<TConfig extends RunConfig> {
    processor: FileProcessor<TConfig>;
    config: TConfig;
    policy: RunnerPolicy;
}

export interface RepositoryStats {
    updated: number;
    unchanged: number;
    stale: number;
    skipped: number;
}

export class RepositoryRunner<TConfig extends RunConfig> {
    private readonly processor: FileProcessor<TConfig>;
    private readonly config: TConfig;
    private readonly policy: RunnerPolicy;

    constructor(options: RepositoryRunnerOptions<TConfig>) {
        this.processor = options.processor;
        this.config = options.config;
        this.policy = options.policy;
    }

    run(files: string[]): RepositoryStats {
        const stats: RepositoryStats = this.getInitCounterState();

        if (!Array.isArray(files)) {
            throw new Error("RepositoryRunner expected files[] array");
        }

        debugLog(
            this.config,
            `RepositoryRunner.runAsync: starting, fileCount=${files.length}, runMode=${this.config.runMode}, mode=${this.config.mode}`
        );

        for (const file of files) {
            let result: ProcessingStatus;

            debugLog(this.config, `RepositoryRunner.runAsync: processing file=${file}`);

            try {
                result = this.processor.process(file, this.config);
            } catch (err) {
                debugLog(
                    this.config,
                    `RepositoryRunner.runAsync: processor error file=${file} err=${err instanceof Error ? err.message : String(err)}`
                );
                if (this.policy.handleProcessorError(file, err) === "continue") {
                    continue;
                }
                throw err;
            }

            debugLog(this.config, `RepositoryRunner.runAsync: result=${result} file=${file}`);

            if (this.policy.shouldPrint(result)) {
                this.printFileStatus(result, file);
            }

            this.updateCounters(result, stats);
        }

        debugLog(this.config, `RepositoryRunner.runAsync: complete stats=${JSON.stringify(stats)}`);

        this.printSummary(stats);

        if (this.config.runMode === "check" && stats.stale > 0) {
            process.exitCode = 1;
        }

        return stats;
    }

    private updateCounters(result: ProcessingStatus, stats: RepositoryStats): void {
        switch (result) {
            case "updated":
                stats.updated++;
                break;
            case "unchanged":
                stats.unchanged++;
                break;
            case "stale":
                stats.stale++;
                break;
            case "skipped":
                stats.skipped++;
                break;
        }
    }

    private printFileStatus(result: ProcessingStatus, file: string): void {
        switch (result) {
            case "updated":
                console.log(`Updated: ${file}`);
                break;
            case "unchanged":
                console.log(`Up-to-date: ${file}`);
                break;
            case "stale":
                console.log(`Stale: ${file}`);
                break;
            case "skipped":
                console.log(`Skipped (no markers): ${file}`);
                break;
        }
    }

    private getInitCounterState(): RepositoryStats {
        return {
            updated: 0,
            unchanged: 0,
            stale: 0,
            skipped: 0,
        };
    }

    private printSummary(stats: RepositoryStats): void {
        if (!this.policy.shouldPrintSummary()) {
            return;
        }
        console.log(
            `Summary: ${stats.updated} updated, ${stats.stale} stale, ${stats.unchanged} unchanged, ${stats.skipped} skipped`
        );
    }
}
