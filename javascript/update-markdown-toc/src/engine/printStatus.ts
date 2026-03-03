import type { CliConfig } from "../types.js";

export function printStatus(
  status: "updated" | "unchanged" | "stale" | "skipped",
  filePath: string,
  config: CliConfig
): void {
    const { checkMode, verbose, quiet } = config;

    if (quiet) return;

    if (checkMode) {
        if (status === "stale") {
            console.log(`Stale: ${filePath}`);
        } else if (status === "unchanged" && verbose) {
            console.log(`Up-to-date: ${filePath}`);
        } else if (status === "skipped" && verbose) {
            console.log(`Skipped (no markers): ${filePath}`);
        }
        return;
    }

    if (verbose) {
        if (status === "updated") {
            console.log(`Updated: ${filePath}`);
        } else if (status === "unchanged") {
            console.log(`Up-to-date: ${filePath}`);
        } else if (status === "skipped") {
            console.log(`Skipped (no markers): ${filePath}`);
        }
        return;
    }

    if (status === "updated") {
        console.log(`Updated: ${filePath}`);
    }
}
