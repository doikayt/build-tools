import fs from "node:fs";
import { debugLog } from "@datalackey/tooling-core";

export type Mode = "generate" | "check" | "inject" | "update";

export interface RawOptions {
  projectJsonPath: string;
  mode?: Mode;
  generatedMermaidPath?: string;
  markdownPath?: string;
  debug?: boolean;
}

export interface NormalizedOptions {
  projectJsonPath: string;
  mode: Mode;
  generatedMermaidPath?: string;
  markdownPath?: string;
  debug?: boolean;
}

export type ExecutionContext =
  | { success: true; options: NormalizedOptions; project?: unknown }
  | { success: false };

/**
 * Verifies that all options that are needed for the specified run mode are present (via call to normalizeOptions),
 * then for file paths, makes sure the files exist where they are required. Finally, loads project.json if needed
 * (which it is not in the case of Inject mode -- where we are simply injecting a pre-generated mermaid graph
 * into our Markdown file.)
 */
export function resolveExecutionContext(
  rawOptions: RawOptions
): ExecutionContext {
  const dbg = { debug: rawOptions.debug ?? false };

  debugLog(
    dbg,
    `resolveExecutionContext: rawOptions=${JSON.stringify(rawOptions)}`
  );

  let options: NormalizedOptions;

  try {
    options = normalizeOptions(rawOptions);
  } catch (error) {
    console.error((error as Error).message);
    return { success: false };
  }

  debugLog(
    dbg,
    `resolveExecutionContext: mode=${options.mode} projectJsonPath=${
      options.projectJsonPath
    } markdownPath=${options.markdownPath ?? "(none)"} generatedMermaidPath=${
      options.generatedMermaidPath ?? "(none)"
    }`
  );

  // INJECT mode: no project loading -- since we already loaded the project in order to create file to be injected
  if (options.mode === "inject") {
    if (!fs.existsSync(options.generatedMermaidPath!)) {
      console.error(
        `Generated file not found at: ${options.generatedMermaidPath}`
      );
      return { success: false };
    }

    if (!fs.existsSync(options.markdownPath!)) {
      console.error(`Markdown file not found at: ${options.markdownPath}`);
      return { success: false };
    }

    return { success: true, options: options };
  }

  // CHECK mode: the markdown file must exist before rebuild
  if (options.mode === "check") {
    if (!fs.existsSync(options.markdownPath!)) {
      console.error(`Markdown file not found at: ${options.markdownPath}`);
      return { success: false };
    }
  }

  // GENERATE, CHECK, UPDATE require project.json
  const project = loadProjectJson(options.projectJsonPath);
  if (project === null) {
    return { success: false };
  }

  const targetCount = Object.keys(
    (project as { targets?: Record<string, unknown> }).targets ?? {}
  ).length;
  debugLog(
    dbg,
    `resolveExecutionContext: project.json loaded, targetCount=${targetCount}`
  );

  return { success: true, options: options, project: project };
}

/**
 * Verifies that user has specified all options needed for the desired run mode.
 * No file existence checks at this point.
 */
export function normalizeOptions(raw: RawOptions): NormalizedOptions {
  if (raw.projectJsonPath === undefined || raw.projectJsonPath === "") {
    throw new Error("projectJsonPath is required");
  }

  const mode: Mode = raw.mode ?? "generate";

  switch (mode) {
    case "generate": {
      if (raw.generatedMermaidPath === undefined) {
        throw new Error("generatedMermaidPath is required in generate mode");
      }

      if (raw.markdownPath !== undefined) {
        throw new Error("markdownPath is invalid in generate mode");
      }

      return {
        projectJsonPath: raw.projectJsonPath,
        mode: mode,
        generatedMermaidPath: raw.generatedMermaidPath,
        debug: raw.debug,
      };
    }

    case "check": {
      if (raw.markdownPath === undefined) {
        throw new Error("markdownPath is required in check mode");
      }

      if (raw.generatedMermaidPath !== undefined) {
        throw new Error("generatedMermaidPath is invalid in check mode");
      }

      return {
        projectJsonPath: raw.projectJsonPath,
        mode: mode,
        markdownPath: raw.markdownPath,
        debug: raw.debug,
      };
    }

    case "inject": {
      if (raw.generatedMermaidPath === undefined) {
        throw new Error("generatedMermaidPath is required in inject mode");
      }

      if (raw.markdownPath === undefined) {
        throw new Error("markdownPath is required in inject mode");
      }

      return {
        projectJsonPath: raw.projectJsonPath,
        mode: mode,
        generatedMermaidPath: raw.generatedMermaidPath,
        markdownPath: raw.markdownPath,
        debug: raw.debug,
      };
    }

    case "update": {
      if (raw.markdownPath === undefined) {
        throw new Error("markdownPath is required in update mode");
      }

      return {
        projectJsonPath: raw.projectJsonPath,
        mode: mode,
        generatedMermaidPath: raw.generatedMermaidPath,
        markdownPath: raw.markdownPath,
        debug: raw.debug,
      };
    }

    default: {
      throw new Error(`Unsupported mode: ${String(mode)}`);
    }
  }
}

function loadProjectJson(path: string): unknown {
  if (!fs.existsSync(path)) {
    console.error(`project.json not found at: ${path}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(path, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch {
    console.error("Failed to read or parse project.json");
    return null;
  }
}
