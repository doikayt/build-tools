import {
  parseStandardCli,
  listFilesToProcess,
  runPlugin,
  validatePassthrough,
  printHelp
} from "@datalackey/tooling-core"

import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js"

const descriptor = {
  name: "update-markdown-toc",
  description: "Auto-generate Table of Contents for Markdown files",
  options: []
}


const argv = process.argv.slice(2)

let parsed

try {
  parsed = parseStandardCli(argv)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`ERROR: ${message}`)
  process.exit(1)
}

const config = parsed.config
const positionals = parsed.positionals ?? []

try {
  validatePassthrough(descriptor, parsed.passthrough ?? [])
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`ERROR: ${message}`)
  process.exit(1)
}


if (config.help) {
  printHelp(descriptor)
  process.exit(0)
}

let targets

try {
  targets = listFilesToProcess(config, positionals)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`ERROR: ${message}`)
  process.exit(1)
}

const processor = new TocFileProcessor()

try {
  runPlugin(targets.files, processor, config)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`ERROR: ${message}`)
  process.exit(1)
}