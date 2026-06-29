import { debugLog } from "@datalackey/tooling-core";

interface NxTarget {
  dependsOn?: string[];
  description?: string;
}

export interface NxProjectJson {
  name?: string;
  targets?: Record<string, NxTarget>;
}

export function buildMermaid(
  project: NxProjectJson,
  config: { debug?: boolean } = {}
): string {
  const targets = validateProjectStructure(project);
  debugLog(config, `buildMermaid: targetCount=${Object.keys(targets).length}`);

  const sortedTargetNames = Object.keys(targets).sort((a, b) =>
    a.localeCompare(b)
  );
  const nodeIdMap = prepareNodeIds(sortedTargetNames);
  const caretTargets = collectCaretDeps(sortedTargetNames, targets);
  const crossProjectDeps = collectCrossProjectDeps(
    sortedTargetNames,
    targets,
    project.name
  );
  const lines: string[] = [];

  lines.push("graph TD");
  lines.push("");

  renderNodes(lines, sortedTargetNames, targets, nodeIdMap);
  if (caretTargets.length > 0) {
    lines.push("");
    renderCaretNodes(lines, caretTargets);
  }
  if (crossProjectDeps.length > 0) {
    lines.push("");
    renderCrossProjectNodes(lines, crossProjectDeps);
  }
  lines.push("");
  renderEdges(lines, sortedTargetNames, targets, nodeIdMap, project.name);

  const body = lines.join("\n");
  debugLog(config, `buildMermaid: generated length=${body.length}`);

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
      if (dep.startsWith("^")) {
        lines.push(
          `  ${nodeIdMap.get(name)!} --> ${caretNodeId(dep.slice(1))}`
        );
        continue;
      }

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
        } else if (refProject !== projectName) {
          lines.push(
            `  ${nodeIdMap.get(name)!} --> ${crossProjectNodeId(dep)}`
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
// Caret (upstream fan-out) dep handling
// --------------------------------------------------

// Collects the unique stripped names from all `^target` deps across every
// target (e.g. "^build" → "build"). Sorted for deterministic output.
function collectCaretDeps(
  names: string[],
  targets: Record<string, NxTarget>
): string[] {
  const seen = new Set<string>();
  for (const name of names) {
    for (const dep of targets[name].dependsOn ?? []) {
      if (dep.startsWith("^")) seen.add(dep.slice(1));
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

// Renders synthetic stadium-shaped nodes for each ^ fan-out dep.
// Stadium shape visually distinguishes them from real local targets.
function renderCaretNodes(lines: string[], caretTargets: string[]): void {
  for (const target of caretTargets) {
    lines.push(`  ${caretNodeId(target)}(["^${target}"])`);
  }
}

function caretNodeId(target: string): string {
  return `_caret_${sanitizeNodeId(target)}`;
}

// --------------------------------------------------
// Cross-project dep handling
// --------------------------------------------------

// Collects unique cross-project dep strings (e.g. "@scope/pkg:build").
// Same-project qualified refs and ^ deps are excluded. Sorted for
// deterministic output.
function collectCrossProjectDeps(
  names: string[],
  targets: Record<string, NxTarget>,
  projectName?: string
): string[] {
  const seen = new Set<string>();
  for (const name of names) {
    for (const dep of targets[name].dependsOn ?? []) {
      if (dep.startsWith("^") || !dep.includes(":")) continue;
      const refProject = dep.slice(0, dep.indexOf(":"));
      if (refProject !== projectName) seen.add(dep);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

// Renders synthetic hexagon nodes for cross-project refs.
// Hexagon shape visually distinguishes them from local targets (rectangles)
// and ^ fan-out nodes (stadium pills).
function renderCrossProjectNodes(
  lines: string[],
  crossProjectDeps: string[]
): void {
  for (const dep of crossProjectDeps) {
    lines.push(`  ${crossProjectNodeId(dep)}{{"${crossProjectLabel(dep)}"}}`);
  }
}

// Strip the org scope (everything up to and including the first "/") from
// the display label so long scoped names fit inside hex nodes without
// truncation. The full dep string is still encoded in the node ID.
function crossProjectLabel(dep: string): string {
  const slash = dep.indexOf("/");
  return slash === -1 ? dep : dep.slice(slash + 1);
}

// Strip any leading underscores that sanitizeNodeId adds for non-alpha
// characters (e.g. "@" → "_") before prepending the _xref_ prefix, so
// the resulting ID stays readable without a double underscore.
function crossProjectNodeId(dep: string): string {
  const sanitized = sanitizeNodeId(dep).replace(/^_+/, "") || "x";
  return `_xref_${sanitized}`;
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
