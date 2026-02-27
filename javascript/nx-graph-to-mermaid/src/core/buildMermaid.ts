import { escapeHtml } from '@datalackey/tooling-core';
interface NxTarget {
    dependsOn?: string[];
    description?: string;
}

interface NxProjectJson {
    targets?: Record<string, NxTarget>;
}

export function buildMermaid(project: NxProjectJson): string {

    const targets = validateProjectStructure(project);
    const sortedTargetNames = Object.keys(targets).sort((a, b) => a.localeCompare(b));
    const nodeIdMap = prepareNodeIds(sortedTargetNames);
    const lines: string[] = [];

    lines.push('graph TD');
    lines.push('');

    renderNodes(lines, sortedTargetNames, targets, nodeIdMap);
    lines.push('');
    renderEdges(lines, sortedTargetNames, targets, nodeIdMap);

    const body = lines.join('\n');

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

    if (!project || typeof project !== 'object') {
        throw new Error('Invalid project.json structure');
    }

    if (
        !('targets' in project) ||
        typeof project.targets !== 'object' ||
        project.targets === null ||
        Array.isArray(project.targets)
    ) {
        throw new Error('project.json must contain a "targets" object');
    }

    const targets = project.targets as Record<string, NxTarget>;

    for (const [name, value] of Object.entries(targets)) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error(`Target "${name}" must be an object`);
        }

        if (value.dependsOn !== undefined) {
            if (!Array.isArray(value.dependsOn)) {
                throw new Error(`dependsOn for "${name}" must be an array`);
            }
            for (const dep of value.dependsOn) {
                if (typeof dep !== 'string') {
                    throw new Error(`dependsOn for "${name}" must contain only strings`);
                }
            }
        }

        if (
            value.description !== undefined &&
            typeof value.description !== 'string'
        ) {
            throw new Error(`description for "${name}" must be a string`);
        }
    }

    return targets;
}

// --------------------------------------------------
// Node ID Preparation
// --------------------------------------------------

function prepareNodeIds(
    sortedTargetNames: string[]
): Map<string, string> {

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

        if (description) {
            lines.push(
                `  ${nodeId}["${name}<br/>${escapeHtml(description)}"]`
            );
        } else {
            lines.push(`  ${nodeId}`);
        }
    }
}

function renderEdges(
    lines: string[],
    names: string[],
    targets: Record<string, NxTarget>,
    nodeIdMap: Map<string, string>
): void {

    for (const name of names) {

        const deps = (targets[name].dependsOn ?? [])
            .slice()
            .sort((a, b) => a.localeCompare(b));

        for (const dep of deps) {

            if (!targets[dep]) {
                throw new Error(
                    `Target "${name}" depends on missing target "${dep}"`
                );
            }

            const fromId = nodeIdMap.get(name)!;
            const toId = nodeIdMap.get(dep)!;
            lines.push(`  ${fromId} --> ${toId}`);
        }
    }
}

// --------------------------------------------------
// Utilities
// --------------------------------------------------

function sanitizeNodeId(name: string): string {

    let result = name
        .replace(/[^a-zA-Z0-9_]+/g, '_')
        .replace(/_+/g, '_');

    if (/^[0-9]/.test(result)) {
        result = `_${result}`;
    }

    if (result.length === 0) {
        result = '_';
    }

    return result;
}

