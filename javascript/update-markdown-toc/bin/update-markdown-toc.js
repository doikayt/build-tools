#!/usr/bin/env node

import { runCli } from "@datalackey/tooling-core"
import { TocFileProcessor } from "../dist/engine/TocFileProcessor.js"

await runCli({
  descriptor: {
    name: "update-markdown-toc",
    description: "Auto-generate Table of Contents for Markdown files",
    options: []
  },
  processor: new TocFileProcessor()
})
