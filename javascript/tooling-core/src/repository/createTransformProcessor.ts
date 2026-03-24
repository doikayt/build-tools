import fs from "node:fs";
import type { FileProcessor } from "./types.js";
import type { RunConfig, ProcessingStatus } from "./types.js";

export function createTransformProcessor<TConfig extends RunConfig & { check?: boolean }>(
    transform: (content: string, config: TConfig) => string
): FileProcessor<TConfig> {
    return {
        process(filePath: string, config: TConfig): ProcessingStatus {
            const original = fs.readFileSync(filePath, "utf8");
            const updated = transform(original, config);

            if (updated === original) {
                return "unchanged";
            }
            if (config.check === true) {
                return "stale";
            }

            fs.writeFileSync(filePath, updated, "utf8");
            return "updated";
        },
    };
}
