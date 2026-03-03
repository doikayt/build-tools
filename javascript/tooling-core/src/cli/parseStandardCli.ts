import { parseArgs } from "node:util";

export type StandardCliConfig = {
  help: boolean;

  checkMode: boolean;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;

  mode: "single" | "recursive";
  targetPath: string | null;

  excludeList: string[] | null;
};


export function parseStandardCli(argv: string[]): StandardCliConfig {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      check: { type: "boolean", short: "c" },
      recursive: { type: "string", short: "r" },
      exclude: { type: "string", short: "e" },
      verbose: { type: "boolean", short: "v" },
      quiet: { type: "boolean", short: "q" },
      debug: { type: "boolean", short: "d" },
      help: { type: "boolean", short: "h" }
    }
  });

  // ------------------------------------------------------------
  // Help short-circuits all validation
  // ------------------------------------------------------------

  if (values.help) {
    return Object.freeze({
      help: true,
      checkMode: false,
      verbose: false,
      quiet: false,
      debug: false,
      mode: "single",
      targetPath: null,
      excludeList: null
    });
  }

  const checkMode = Boolean(values.check);
  const verbose = Boolean(values.verbose);
  const quiet = Boolean(values.quiet);
  const debug = Boolean(values.debug);

  const recursivePath = values.recursive ?? null;
  const targetFile = positionals.length > 0 ? positionals[0] : null;
  const isRecursive = recursivePath !== null;

  applyValidationRules(
    quiet,
    verbose,
    isRecursive,
    targetFile,
    checkMode,
    values.exclude,
    argv
  );

  const excludeList = parseExcludeList(values.exclude);
  const { mode, targetPath } = normalizeMode(isRecursive, recursivePath, targetFile);

  const config: StandardCliConfig = {
    help: false,
    checkMode,
    verbose,
    quiet,
    debug,
    mode,
    targetPath,
    excludeList
  };

  return Object.freeze(config);
}

function parseExcludeList(excludeValue: unknown): string[] | null {
  if (typeof excludeValue !== "string") {
    return null;
  }

  if (excludeValue === "") {
    return [];
  }

  return excludeValue
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
}

function applyValidationRules(
    quiet: boolean,
    verbose: boolean,
    isRecursive: boolean,
    targetFile: string | null,
    checkMode: boolean,
    excludeValue: unknown,
    argv: string[]
): void {
  if (quiet && verbose) {
    throw new Error("--quiet and --verbose cannot be used together.");
  }

  if (isRecursive && targetFile) {
    throw new Error("Cannot use --recursive with a file argument");
  }

  if (checkMode && !isRecursive && !targetFile) {
    throw new Error("--check requires a file argument or --recursive.");
  }

  if (excludeValue !== undefined) {
    if (typeof excludeValue !== "string") {
      throw new Error("--exclude requires an argument.");
    }
  }

  // parseArgs already enforces missing value for --recursive
  // Here we verify the invariant: consistency between (internal) 'isRecursive' and user-specified flags

  if (argv.includes("--recursive") || argv.includes("-r")) {
    if (!isRecursive) {
      throw new Error("--recursive requires a directory argument.");
    }
  }
}

function normalizeMode(
    isRecursive: boolean,
    recursivePath: string | null,
    targetFile: string | null
): { mode: "single" | "recursive"; targetPath: string | null } {
  if (isRecursive) {
    return {
      mode: "recursive",
      targetPath: recursivePath
    };
  }

  return {
    mode: "single",
    targetPath: targetFile
  };
}
