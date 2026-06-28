import fs from "node:fs";
import path from "node:path";

import { walkFiles } from "../util/walkFiles.js";
import type { RunConfig } from "../repository/types.js";

export type ResolvedTargets =
  | { mode: "single"; files: string[] }
  | { mode: "recursive"; files: string[] };

export function listFilesToProcess(
  config: RunConfig,
  positionals: string[]
): ResolvedTargets {
  const cwd = process.cwd();

  /*
     SINGLE MODE
    */
  if (config.mode === "single") {
    const target = positionals[0] ?? "README.md";
    const resolved = path.resolve(cwd, target);

    if (!fs.existsSync(resolved)) {
      throw new Error(`File does not exist: ${resolved}`);
    }

    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${resolved}`);
    }

    return {
      mode: "single",
      files: [resolved],
    };
  }

  /*
     RECURSIVE MODE
    */

  const root = config.recursivePath ?? ".";
  const resolvedRoot = path.resolve(cwd, root);

  if (!fs.existsSync(resolvedRoot)) {
    throw new Error(`Directory does not exist: ${resolvedRoot}`);
  }

  if (!fs.statSync(resolvedRoot).isDirectory()) {
    throw new Error(`Not a directory: ${resolvedRoot}`);
  }

  if (positionals.length > 0) {
    throw new Error(
      `Cannot use positional file arguments with --recursive: ${positionals.join(", ")}`
    );
  }

  const files = walkFiles({
    rootDir: resolvedRoot,
    extensions: [".md"],
    excludeDirs: config.exclude,
  });

  return {
    mode: "recursive",
    files,
  };
}
