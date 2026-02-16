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

    const lines: string[] = [];

    lines.push('graph TD');
    lines.push('');

    // Render nodes
    for (const targetName of sortedTargetNames) {
        const target = targets[targetName];
        const description = target.description;

        if (description) {
            lines.push(
                `  ${targetName}["${targetName}<br/>${escapeHtml(description)}"]`
            );
        } else {
            lines.push(`  ${targetName}`);
        }
    }

    lines.push('');

    // Render edges
    for (const targetName of sortedTargetNames) {
        const target = targets[targetName];
        const deps = (target.dependsOn ?? []).slice().sort((a, b) =>
            a.localeCompare(b)
        );

        for (const dep of deps) {
            if (targets[dep]) {
                lines.push(`  ${targetName} --> ${dep}`);
            }
        }
    }

    return lines.join('\n') + '\n';
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
