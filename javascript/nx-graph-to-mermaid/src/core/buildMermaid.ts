interface NxTarget {
    dependsOn?: string[];
    description?: string;
}

interface NxProjectJson {
    targets?: Record<string, NxTarget>;
}

export function buildMermaid(project: NxProjectJson): string {
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

    // --------------------------------
    // Strict Structural Validation
    // --------------------------------

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

    const sortedTargetNames = Object.keys(targets).sort((a, b) =>
        a.localeCompare(b)
    );

    // --------------------------------
    // Sanitization + Collision Check
    // --------------------------------

    const nodeIdMap = new Map<string, string>();
    const usedIds = new Set<string>();

    for (const targetName of sortedTargetNames) {
        const sanitized = sanitizeNodeId(targetName);

        if (usedIds.has(sanitized)) {
            throw new Error(`Sanitized node id collision detected: ${sanitized}`);
        }

        usedIds.add(sanitized);
        nodeIdMap.set(targetName, sanitized);
    }

    const lines: string[] = [];

    lines.push('graph TD');
    lines.push('');

    // --------------------------------
    // Render Nodes
    // --------------------------------

    for (const targetName of sortedTargetNames) {
        const target = targets[targetName];
        const description = target.description;
        const nodeId = nodeIdMap.get(targetName)!;

        if (description) {
            lines.push(
                `  ${nodeId}["${targetName}<br/>${escapeHtml(description)}"]`
            );
        } else {
            lines.push(`  ${nodeId}`);
        }
    }

    lines.push('');

    // --------------------------------
    // Render Edges
    // --------------------------------

    for (const targetName of sortedTargetNames) {
        const target = targets[targetName];
        const deps = (target.dependsOn ?? []).slice().sort((a, b) =>
            a.localeCompare(b)
        );

        for (const dep of deps) {
            if (targets[dep]) {
                const fromId = nodeIdMap.get(targetName)!;
                const toId = nodeIdMap.get(dep)!;

                lines.push(`  ${fromId} --> ${toId}`);
            }
        }
    }

    return lines.join('\n') + '\n';
}

// --------------------------------
// Node ID Sanitization
// --------------------------------

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

// --------------------------------
// HTML Escape
// --------------------------------

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
