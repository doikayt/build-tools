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

    const targets = project.targets ?? {};

    const sortedTargetNames = Object.keys(targets).sort((a, b) =>
        a.localeCompare(b)
    );

    // -------------------------
    // SANITIZE + COLLISION CHECK
    // -------------------------

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

    // -------------------------
    // Render nodes
    // -------------------------

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

    // -------------------------
    // Render edges
    // -------------------------

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

// -------------------------
// Sanitization Logic
// -------------------------

function sanitizeNodeId(name: string): string {
    let result = name
        .replace(/[^a-zA-Z0-9_]+/g, '_') // replace invalid chars
        .replace(/_+/g, '_');            // collapse multiple underscores

    if (/^[0-9]/.test(result)) {
        result = `_${result}`;
    }

    if (result.length === 0) {
        result = '_';
    }

    return result;
}

// -------------------------
// HTML Escape for Labels
// -------------------------

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
