import type { RunConfig } from "../repository/types.js"
import { validateMarkdownLinks } from "../markdown/validateMarkdownLinks.js"
import { debugLog } from "../logging/debugLog.js"

export async function runLinkValidation(
    files: string[],
    config: RunConfig
): Promise<void> {
    debugLog(config, `runLinkValidation: starting, fileCount=${files.length}, validateExternal=${config.validateExternalLinks}`)

    const results = await Promise.all(
        files.map(file =>
            validateMarkdownLinks(file, {
                validateExternal: config.validateExternalLinks,
                timeoutMs: config.linkTimeoutMs,
                verbose: config.verbose,
                onVerbose: config.verbose
                    ? (msg) => console.log(msg)
                    : undefined
            })
        )
    )

    let hasErrors = false

    for (const result of results) {
        debugLog(config, `runLinkValidation: result=${JSON.stringify(result)}`)

        for (const error of result.errors) {
            console.log(`✗ Broken link in ${error.file}:${error.line} → ${error.link} (${error.reason})`)
            hasErrors = true
        }

        for (const warning of result.warnings) {
            console.log(`⚠ Link warning in ${warning.file}:${warning.line} → ${warning.link} (${warning.reason})`)
        }
    }

    if (hasErrors) {
        process.exitCode = 1
    }

    debugLog(config, `runLinkValidation: complete hasErrors=${hasErrors}`)
}
