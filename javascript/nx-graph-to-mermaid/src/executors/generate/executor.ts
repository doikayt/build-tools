import fs from "node:fs";
import { buildMermaid } from "../../core/buildMermaid.js";
import type { NxProjectJson } from "../../core/buildMermaid.js";
import {
  RawOptions,
  NormalizedOptions,
  resolveExecutionContext,
} from "./normalizeOptions.js";
import { injectBetweenMarkers, debugLog } from "@datalackey/tooling-core";

const NX_GRAPH_START = "<!-- NX_GRAPH:START -->";
const NX_GRAPH_END = "<!-- NX_GRAPH:END -->";

/**
 * Main entry point for our NX plugin.
 */
function runExecutor(rawOptions: RawOptions): { success: boolean } {
  const ctx = resolveExecutionContext(rawOptions);
  if (!ctx.success) {
    return { success: false };
  }

  const { options, project } = ctx;

  debugLog({ debug: options.debug ?? false }, `runExecutor: dispatching mode=${options.mode}`);

  let result: { success: boolean };

  switch (options.mode) {
    case "inject":
      result = handleInject(options);
      break;

    case "check": {
      const mermaid = buildMermaid(project as NxProjectJson);
      debugLog({ debug: options.debug ?? false }, `runExecutor: mermaid generated, length=${mermaid.length}`);
      result = handleCheck(options, mermaid);
      break;
    }

    case "generate": {
      const mermaid = buildMermaid(project as NxProjectJson);
      debugLog({ debug: options.debug ?? false }, `runExecutor: mermaid generated, length=${mermaid.length}`);
      result = handleGenerate(options, mermaid);
      break;
    }

    case "update": {
      const mermaid = buildMermaid(project as NxProjectJson);
      debugLog({ debug: options.debug ?? false }, `runExecutor: mermaid generated, length=${mermaid.length}`);
      result = handleUpdate(options, mermaid);
      break;
    }

    default: {
      const _exhaustive: never = options.mode;
      result = fail(`Unsupported mode: ${String(_exhaustive)}`);
    }
  }

  debugLog({ debug: options.debug ?? false }, `runExecutor: result=${JSON.stringify(result)}`);
  return result;
}

function handleGenerate(
  options: NormalizedOptions,
  mermaid: string
): { success: boolean } {
  fs.writeFileSync(options.generatedMermaidPath!, mermaid, "utf-8");
  return { success: true };
}

function handleCheck(
  options: NormalizedOptions,
  mermaid: string
): { success: boolean } {
  const markdownContent = fs.readFileSync(options.markdownPath!, "utf-8");
  try {
    const expected = injectBetweenMarkers(
      markdownContent,
      mermaid,
      NX_GRAPH_START,
      NX_GRAPH_END
    );
    if (markdownContent !== expected) {
      return fail("Mermaid output drift detected.");
    }
  } catch (error) {
    return fail((error as Error).message);
  }
  return { success: true };
}

function handleInject(options: NormalizedOptions): { success: boolean } {
  try {
    const generatedContent = fs.readFileSync(
      options.generatedMermaidPath!,
      "utf-8"
    );
    const markdownContent = fs.readFileSync(options.markdownPath!, "utf-8");
    const updated = injectBetweenMarkers(
      markdownContent,
      generatedContent,
      NX_GRAPH_START,
      NX_GRAPH_END
    );

    fs.writeFileSync(options.markdownPath!, updated, "utf-8");

    return { success: true };
  } catch (error) {
    return fail((error as Error).message);
  }
}

function handleUpdate(
  options: NormalizedOptions,
  mermaid: string
): { success: boolean } {
  try {
    if (options.generatedMermaidPath !== undefined) {
      fs.writeFileSync(options.generatedMermaidPath, mermaid, "utf-8");
    }

    const markdownContent = fs.readFileSync(options.markdownPath!, "utf-8");
    const updated = injectBetweenMarkers(
      markdownContent,
      mermaid,
      NX_GRAPH_START,
      NX_GRAPH_END
    );

    fs.writeFileSync(options.markdownPath!, updated, "utf-8");

    return { success: true };
  } catch (error) {
    return fail((error as Error).message);
  }
}

function fail(message: string): { success: false } {
  console.error(message);
  return { success: false };
}

export default runExecutor;
