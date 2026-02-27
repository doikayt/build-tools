import fs from "fs";
import path from "path";
export function collectMarkdownFiles(dir, excludeList) {
    const results = [];

    const exclusions = Array.isArray(excludeList)
        ? excludeList
        : ["node_modules"];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (exclusions.includes(entry.name)) continue;
            results.push(...collectMarkdownFiles(full, excludeList));
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            results.push(full);
        }
    }

    return results;
}
