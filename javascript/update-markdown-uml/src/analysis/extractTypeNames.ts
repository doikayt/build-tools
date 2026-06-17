import { Project } from "ts-morph";
import path from "node:path";

/**
 * Extracts the names of all classes, interfaces, and type aliases from a
 * leaf component directory. Standalone functions are excluded by design.
 * Both exported and non-exported declarations are included.
 * Returns a sorted list of unique names.
 */
export function extractTypeNames(leafDir: string): string[] {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      skipLibCheck: true,
      noLib: true,
    },
  });

  project.addSourceFilesAtPaths(path.join(leafDir, "**/*.ts"));

  const names = new Set<string>();

  for (const sf of project.getSourceFiles()) {
    for (const cls of sf.getClasses()) {
      const name = cls.getName();
      if (name !== undefined && name !== "") {
        names.add(name);
      }
    }
    for (const iface of sf.getInterfaces()) {
      names.add(iface.getName());
    }
    for (const typeAlias of sf.getTypeAliases()) {
      names.add(typeAlias.getName());
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}
