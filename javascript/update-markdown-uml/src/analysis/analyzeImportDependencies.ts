import { Project } from "ts-morph";
import path from "node:path";

export interface ImportEdge {
  from: string;
  to: string;
}

/**
 * Collects direct cross-leaf import edges across all leaf directories.
 * For each file in each leaf directory, resolves its import declarations
 * and records an edge from that file's leaf dir to the imported file's
 * leaf dir — but only when the two leaf dirs differ and the imported
 * file lives under sourceRoot.
 *
 * Edges are outgoing: an edge { from: "cli", to: "repository" } means
 * one or more files in cli/ import from repository/.
 *
 * Incoming edges (e.g. "repository is imported by cli") are the reverse
 * view of the same data and do not need to be collected separately —
 * they fall out naturally from the full edge set.
 *
 * Returns deduplicated edges. Does not compute transitive closure —
 * see computeTransitiveClosure() for that.
 */
export function collectDirectEdges(
  leafDirs: string[],
  sourceRoot: string
): ImportEdge[] {
  function getLeafDir(filePath: string): string | undefined {
    for (const leaf of leafDirs) {
      if (
        filePath.startsWith(leaf + path.sep) ||
        filePath.startsWith(leaf + "/")
      ) {
        return leaf;
      }
    }
    return undefined;
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      skipLibCheck: true,
      noLib: true,
    },
  });

  for (const leafDir of leafDirs) {
    project.addSourceFilesAtPaths(path.join(leafDir, "**/*.ts"));
  }

  const edgeSet = new Set<string>();
  const edges: ImportEdge[] = [];

  for (const sf of project.getSourceFiles()) {
    const fromLeaf = getLeafDir(sf.getFilePath());
    if (fromLeaf === undefined) continue;

    for (const imp of sf.getImportDeclarations()) {
      const resolved = imp.getModuleSpecifierSourceFile();
      if (resolved === undefined) continue;

      const resolvedPath = resolved.getFilePath();
      if (!resolvedPath.startsWith(sourceRoot)) continue;

      const toLeaf = getLeafDir(resolvedPath);
      if (toLeaf === undefined) continue;
      if (toLeaf === fromLeaf) continue;

      const fromName = path.basename(fromLeaf);
      const toName = path.basename(toLeaf);
      const key = `${fromName}:${toName}`;

      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from: fromName, to: toName });
      }
    }
  }

  return edges.sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );
}

/**
 * Computes the transitive closure of a set of directed edges using
 * Floyd-Warshall style reachability. Self-edges are excluded.
 * Input edges are included in the output unchanged.
 * Returns deduplicated, sorted edges.
 */
export function computeTransitiveClosure(edges: ImportEdge[]): ImportEdge[] {
  const reachable = new Map<string, Set<string>>();

  function ensureNode(name: string): Set<string> {
    if (!reachable.has(name)) reachable.set(name, new Set());
    return reachable.get(name)!;
  }

  for (const edge of edges) {
    ensureNode(edge.from).add(edge.to);
    ensureNode(edge.to);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const [from, targets] of reachable.entries()) {
      for (const to of [...targets]) {
        const transitive = reachable.get(to) ?? new Set();
        for (const next of transitive) {
          if (next !== from && !targets.has(next)) {
            targets.add(next);
            changed = true;
          }
        }
      }
    }
  }

  const resultSet = new Set<string>();
  const result: ImportEdge[] = [];

  for (const [from, targets] of reachable.entries()) {
    for (const to of targets) {
      const key = `${from}:${to}`;
      if (!resultSet.has(key)) {
        resultSet.add(key);
        result.push({ from: from, to: to });
      }
    }
  }

  return result.sort((a, b) =>
    a.from !== b.from ? a.from.localeCompare(b.from) : a.to.localeCompare(b.to)
  );
}

/**
 * Composes collectDirectEdges and computeTransitiveClosure.
 * Returns the full transitive set of cross-leaf import dependencies,
 * deduplicated and sorted by from then to.
 */
export function analyzeImportDependencies(
  leafDirs: string[],
  sourceRoot: string
): ImportEdge[] {
  const direct = collectDirectEdges(leafDirs, sourceRoot);
  return computeTransitiveClosure(direct);
}
