#!/usr/bin/env node
import { runCli } from "@datalackey/tooling-core"
import { descriptor } from "../dist/cli/descriptor.js"

await runCli({
  descriptor: descriptor,
  processor: {
    process(_filePath, _config) {
      // stub — implementation pending
      return "unchanged"
    }
  }
})
