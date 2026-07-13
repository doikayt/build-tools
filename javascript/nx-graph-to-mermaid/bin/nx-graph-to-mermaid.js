#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { generate as runExecutor } from "../dist/index.js";

const args = process.argv.slice(2);
let check = false;
let debug = false;
let markdownPath;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--check") {
    check = true;
  } else if (arg === "--debug") {
    debug = true;
  } else if (arg === "--quiet") {
    // NX produces no stdout — flag accepted for CLI uniformity, no-op here
  } else if (!arg.startsWith("-")) {
    markdownPath = arg;
  } else {
    console.error(`ERROR: Unknown option: ${arg}`);
    process.exit(1);
  }
}

if (!markdownPath) {
  console.error(
    "Usage: nx-graph-to-mermaid <markdownPath> [--check] [--debug]"
  );
  process.exit(1);
}

const resolvedMarkdownPath = path.resolve(markdownPath);
const projectJsonPath = path.join(
  path.dirname(resolvedMarkdownPath),
  "project.json"
);

const result = runExecutor({
  projectJsonPath,
  mode: check ? "check" : "update",
  markdownPath: resolvedMarkdownPath,
  debug,
});

if (!result.success) {
  process.exit(1);
}
