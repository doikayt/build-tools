#!/usr/bin/env node

import {
  parseStandardCli,
  listFilesToProcess,
  runPlugin
} from "@datalackey/tooling-core"

import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js"

function printHelp() {
  console.log(`
update-markdown-toc [options] [file]

Options:
  -c, --check
  -r, --recursive <path>
  -e, --exclude <dir1,dir2,...>
  -v, --verbose
  -q, --quiet
  -d, --debug
  -h, --help
`)
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

if (parsed.passthrough && parsed.passthrough.length > 0) {
  console.error(`ERROR: Unknown option: ${parsed.passthrough[0]}`)
  process.exit(1)
}

if (config.help) {
  printHelp()
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