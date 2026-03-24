import fs from "node:fs";
import { extractLinks } from "./extractLinks.js";
import { parseHeadings } from "./parseHeadings.js";
import { validateFragmentLink } from "./validateFragmentLink.js";
import { validateRelativeLink } from "./validateRelativeLink.js";
import { validateExternalLink } from "./validateExternalLink.js";
import { runWithConcurrency } from "../util/concurrency.js";
import type {
    LinkValidationOptions,
    LinkValidationResult,
    LinkValidationError,
    LinkValidationWarning,
} from "./types.js";

const DEFAULT_CONCURRENCY = 5;

export async function validateMarkdownLinks(
    filePath: string,
    options: LinkValidationOptions = {}
): Promise<LinkValidationResult> {
    const errors: LinkValidationError[] = [];
    const warnings: LinkValidationWarning[] = [];
    let validatedCount = 0;

    options.onDebug?.(
        `validateMarkdownLinks: entry filePath=${filePath} validateExternal=${options.validateExternal ?? true} concurrency=${options.concurrency ?? DEFAULT_CONCURRENCY}`
    );

    const markdownText = fs.readFileSync(filePath, "utf-8");

    const { links, skippedCount } = extractLinks(markdownText, {
        managedBlockStartMarker: options.managedBlockStartMarker,
        managedBlockEndMarker: options.managedBlockEndMarker,
        onDebug: options.onDebug,
    });

    options.onDebug?.(
        `validateMarkdownLinks: extracted linkCount=${links.length} skippedCount=${skippedCount}`
    );

    const headings = parseHeadings(markdownText);

    options.onDebug?.(`validateMarkdownLinks: parsed headingCount=${headings.length}`);

    for (const link of links) {
        if (link.kind === "fragment") {
            const error = validateFragmentLink(filePath, link, headings);
            if (error !== null) {
                options.onDebug?.(
                    `validateMarkdownLinks: fragment FAIL href=${link.href} reason=${error.reason}`
                );
                errors.push(error);
            } else {
                options.onDebug?.(`validateMarkdownLinks: fragment OK href=${link.href}`);
                validatedCount++;
            }
        }

        if (link.kind === "relative") {
            const error = validateRelativeLink(filePath, link);
            if (error !== null) {
                options.onDebug?.(
                    `validateMarkdownLinks: relative FAIL href=${link.href} reason=${error.reason}`
                );
                errors.push(error);
            } else {
                options.onDebug?.(`validateMarkdownLinks: relative OK href=${link.href}`);
                validatedCount++;
            }
        }
    }

    const externalLinks =
        options.validateExternal !== false ? links.filter(l => l.kind === "external") : [];

    options.onDebug?.(
        `validateMarkdownLinks: external links to validate: count=${externalLinks.length}${options.validateExternal === false ? " (skipped by option)" : ""}`
    );

    const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

    const externalTasks = externalLinks.map(link => async () => {
        const result = await validateExternalLink(filePath, link, options);
        return { link: link, result: result };
    });

    const externalResults = await runWithConcurrency(externalTasks, concurrency);

    for (const { link, result } of externalResults) {
        if (result === null) {
            options.onDebug?.(`validateMarkdownLinks: external OK href=${link.href}`);
            validatedCount++;
            continue;
        }

        if ("reason" in result) {
            const isWarning =
                result.reason.startsWith("permanent redirect") ||
                result.reason.startsWith("access forbidden") ||
                result.reason.startsWith("server error");

            if (isWarning) {
                options.onDebug?.(
                    `validateMarkdownLinks: external WARN href=${link.href} reason=${result.reason}`
                );
                warnings.push(result as LinkValidationWarning);
            } else {
                options.onDebug?.(
                    `validateMarkdownLinks: external FAIL href=${link.href} reason=${result.reason}`
                );
                errors.push(result as LinkValidationError);
            }
        }
    }

    options.onDebug?.(
        `validateMarkdownLinks: complete validatedCount=${validatedCount} errorCount=${errors.length} warningCount=${warnings.length} skippedCount=${skippedCount}`
    );

    return {
        errors: errors,
        warnings: warnings,
        validatedCount: validatedCount,
        skippedCount: skippedCount,
    };
}
