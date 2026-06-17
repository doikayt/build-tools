import { debugLog } from "@datalackey/tooling-core";

interface NxTarget {
  dependsOn?: string[];
  description?: string;
}

export interface NxProjectJson {
  name?: string;
  targets?: Record<string, NxTarget>;
}

export function buildMermaid(project: NxProjectJson, debug = false): string {
  const dbg = { debug };
  const targets = validateProjectStructure(project);
  debugLog(dbg, `buildMermaid: targetCount=${Object.keys(targets).length}`);

  const sortedTargetNames = Object.keys(targets).sort((a, b) =>
    a.localeCompare(b)
  );
  const nodeIdMap = prepareNodeIds(sortedTargetNames);
  const lines: string[] = [];

  lines.push("graph TD");
  lines.push("");

  renderNodes(lines, sortedTargetNames, targets, nodeIdMap);
  lines.push("");
  renderEdges(lines, sortedTargetNames, targets, nodeIdMap, project.name);

  const body = lines.join("\n");
  debugLog(dbg, `buildMermaid: generated length=${body.length}`);

  return `\`\`\`mermaid
${body}
\`\`\``;
}

// --------------------------------------------------
// Validation
// --------------------------------------------------

function validateProjectStructure(
  project: NxProjectJson
): Record<string, NxTarget> {
  if (project === null || typeof project !== "object") {
    throw new Error("Invalid project.json structure");
  }

  if (
    !("targets" in project) ||
    typeof project.targets !== "object" ||
    project.targets === null ||
    Array.isArray(project.targets)
  ) {
    throw new Error('project.json must contain a "targets" object');
  }

  const targets = project.targets;

  for (const [name, value] of Object.entries(targets)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error(`Target "${name}" must be an object`);
    }

    if (value.dependsOn !== undefined) {
      if (!Array.isArray(value.dependsOn)) {
        throw new Error(`dependsOn for "${name}" must be an array`);
      }
      for (const dep of value.dependsOn) {
        if (typeof dep !== "string") {
          throw new Error(`dependsOn for "${name}" must contain only strings`);
        }
      }
    }

    if (
      value.description !== undefined &&
      typeof value.description !== "string"
    ) {
      throw new Error(`description for "${name}" must be a string`);
    }
  }

  return targets;
}

// --------------------------------------------------
// Node ID Preparation
// --------------------------------------------------

function prepareNodeIds(sortedTargetNames: string[]): Map<string, string> {
  const nodeIdMap = new Map<string, string>();
  const usedIds = new Set<string>();

  for (const name of sortedTargetNames) {
    const sanitized = sanitizeNodeId(name);

    if (usedIds.has(sanitized)) {
      throw new Error(`Sanitized node id collision detected: ${sanitized}`);
    }

    usedIds.add(sanitized);
    nodeIdMap.set(name, sanitized);
  }

  return nodeIdMap;
}

// --------------------------------------------------
// Rendering
// --------------------------------------------------

function renderNodes(
  lines: string[],
  names: string[],
  targets: Record<string, NxTarget>,
  nodeIdMap: Map<string, string>
): void {
  for (const name of names) {
    const nodeId = nodeIdMap.get(name)!;
    const description = targets[name].description;

    if (description !== undefined) {
      lines.push(`  ${nodeId}["${name}<br/>${escapeHtml(description)}"]`);
    } else {
      lines.push(`  ${nodeId}`);
    }
  }
}

function renderEdges(
  lines: string[],
  names: string[],
  targets: Record<string, NxTarget>,
  nodeIdMap: Map<string, string>,
  projectName?: string
): void {
  for (const name of names) {
    const deps = (targets[name].dependsOn ?? [])
      .slice()
      .sort((a, b) => a.localeCompare(b));

    for (const dep of deps) {
      if (dep.startsWith("^")) continue;

      if (dep.includes(":")) {
        // Resolve same-project qualified refs (e.g. "my-project:some-target");
        // skip cross-project refs and unresolvable refs when project name is unknown.
        const colon = dep.indexOf(":");
        const refProject = dep.slice(0, colon);
        const refTarget = dep.slice(colon + 1);
        if (refProject === projectName && targets[refTarget] !== undefined) {
          lines.push(
            `  ${nodeIdMap.get(name)!} --> ${nodeIdMap.get(refTarget)!}`
          );
        }
        continue;
      }

      if (targets[dep] === undefined) {
        throw new Error(`Target "${name}" depends on missing target "${dep}"`);
      }

      lines.push(`  ${nodeIdMap.get(name)!} --> ${nodeIdMap.get(dep)!}`);
    }
  }
}

// --------------------------------------------------
// Utilities
// --------------------------------------------------

function sanitizeNodeId(name: string): string {
  let result = name.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/_+/g, "_");

  if (/^[0-9]/.test(result)) {
    result = `_${result}`;
  }

  if (result.length === 0) {
    result = "_";
  }

  return result;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
