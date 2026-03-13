#!/usr/bin/env node

import {
  parseStandardCli,
  buildPassthroughMap,
  buildConfig,
  parseBooleanOption,
  parseNumberOption,
  listFilesToProcess,
  printHelp,
  runPlugin,
  validateMarkdownLinks,
  debugLog
} from "@datalackey/tooling-core"
import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js"

const DEFAULT_TIMEOUT_MS = 3000

const descriptor = {
  name: "update-markdown-toc",
  description: "Auto-generate Table of Contents for Markdown files",
  options: [
    {
      flag: "--no-external-link-check",
      description: "Skip external HTTP/HTTPS link validation during --check",
      requiresValue: false
    },
    {
      flag: "--link-timeout-ms",
      description: "Per-request timeout for external link checks (default: 3000)",
      requiresValue: true
    }
  ]
}

function die(err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`ERROR: ${message}`)
  process.exit(1)
}

const argv = process.argv.slice(2)

let parsed
try {
  parsed = parseStandardCli(argv)
} catch (err) {
  die(err)
}

if (parsed.help) {
  printHelp(descriptor)
  process.exit(0)
}

let passthroughMap
try {
  passthroughMap = buildPassthroughMap(descriptor.options, parsed.passthrough ?? [])
} catch (err) {
  die(err)
}

const noExternalLinkCheck = parseBooleanOption("--no-external-link-check", passthroughMap)
const linkTimeoutMs = parseNumberOption("--link-timeout-ms", passthroughMap) ?? DEFAULT_TIMEOUT_MS

let config
try {
  config = buildConfig(parsed.config, passthroughMap)
} catch (err) {
  die(err)
}

let targets
try {
  targets = listFilesToProcess(config, parsed.positionals ?? [])
} catch (err) {
  die(err)
}

debugLog(config, `bin: noExternalLinkCheck=${noExternalLinkCheck} linkTimeoutMs=${linkTimeoutMs}`)
debugLog(config, `bin: targets=${JSON.stringify(targets.files)}`)

// Phase 1: TOC processing
const stats = await runPlugin(targets.files, new TocFileProcessor(), config)

debugLog(config, `bin: TOC phase complete stats=${JSON.stringify(stats)}`)

// Phase 2: link validation (check mode only)
if (config.runMode === "check") {
  debugLog(config, `bin: starting link validation, validateExternal=${!noExternalLinkCheck}`)

  const results = await Promise.all(
    targets.files.map(file =>
      validateMarkdownLinks(file, {
        validateExternal: !noExternalLinkCheck,
        timeoutMs: linkTimeoutMs,
        verbose: config.verbose,
        onVerbose: config.verbose
          ? (msg) => console.log(msg)
          : undefined
      })
    )
  )

  let hasErrors = false

  for (const result of results) {
    debugLog(config, `bin: link validation result=${JSON.stringify(result)}`)

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
}
