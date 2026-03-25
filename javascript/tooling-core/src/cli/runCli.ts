import type { PluginDescriptor } from "./types.js";
import type { FileProcessor, RunConfig } from "../repository/types.js";
import {
  parseStandardCli,
  buildPassthroughMap,
  buildConfig,
} from "./parseStandardCli.js";
import { listFilesToProcess } from "./listFilesToProcess.js";
import { printHelp } from "./printHelp.js";
import { runPlugin } from "./runPlugin.js";
import { runLinkValidation } from "./runLinkValidation.js";
import { debugLog } from "../util/debugLog.js";
import type { RepositoryStats } from "../repository/RepositoryRunner.js";

export interface RunCliOptions<TConfig extends RunConfig = RunConfig> {
  descriptor: PluginDescriptor<TConfig>;
  processor: FileProcessor<TConfig>;
  argv?: string[];
}

function attempt<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`ERROR: ${message}`);
    process.exit(1);
  }
}


const STANDARD_FLAGS = new Set([
  "-h", "--help",
  "--version",
  "-v", "--verbose",
  "-q", "--quiet",
  "-d", "--debug",
  "-c", "--check",
  "-r", "--recursive",
  "-e", "--exclude",
]);

function validateDescriptorOptions<TConfig extends RunConfig>(
    descriptor: PluginDescriptor<TConfig>
): void {
  for (const option of descriptor.options) {
    if (STANDARD_FLAGS.has(option.flag)) {
      throw new Error(
          `Plugin option "${option.flag}" collides with a standard tooling-core flag`
      );
    }
  }
}

export async function runCli<TConfig extends RunConfig = RunConfig>(
    options: RunCliOptions<TConfig>
): Promise<RepositoryStats> {
  attempt(() => validateDescriptorOptions(options.descriptor));

  const argv = options.argv ?? process.argv.slice(2);

  // Pass plugin-specific options into parseStandardCli so it knows which
  // unknown flags require values — avoids peek heuristics in the parser.
  const parsed = attempt(() =>
      parseStandardCli(argv, options.descriptor.options)
  );
  const positionals = parsed.positionals ?? [];

  const passthroughMap = attempt(() =>
      buildPassthroughMap(options.descriptor.options, parsed.passthrough ?? [])
  );

  if (parsed.help) {
    printHelp(options.descriptor);
    process.exit(0);
  }

  const config = attempt(() =>
      buildConfig(parsed.config, passthroughMap, options.descriptor.parseOptions)
  );
  debugLog(
      config,
      `runCli: argv=${JSON.stringify(argv)} | config=${JSON.stringify(config)}`
  );

  attempt(() => options.descriptor.validate?.(config));

  const targets = attempt(() => listFilesToProcess(config, positionals));

  debugLog(config, `runCli: targets=${JSON.stringify(targets.files)}`);

  const stats = runPlugin(targets.files, options.processor, config);

  debugLog(config, `runCli: stats=${JSON.stringify(stats)}`);

  if (config.runMode === "check") {
    await runLinkValidation(targets.files, config);
  }

  return stats;
}
