#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { generate as runExecutor } from "@datalackey/nx-graph-to-mermaid";

const require = createRequire(import.meta.url);

const HELP = `Usage: autogen-markdown-doc [subcommand] [file] [options]

Subcommands:
  update   (default)  Apply all tag transformations in-place
  check               Validate all tags; exit non-zero on any drift (no writes)

Positional:
  file                Target Markdown file  (default: README.md in cwd)

Options:
  --exclude-components <pkg1,pkg2>  Forwarded to UML generation only
                                  (leaf directory names under src/ to skip)
  --quiet                         Suppress all non-error output,
                                  including the "no markers" warning
  --debug                         Print debug diagnostics to stderr
  --help                          Show this help message and exit (exit 0)
`;

const SUBCOMMANDS = new Set(["update", "check"]);

const TOC_START = "<!-- TOC:START -->";
const TOC_END = "<!-- TOC:END -->";
const NX_GRAPH_START = "<!-- NX_GRAPH:START -->";
const NX_GRAPH_END = "<!-- NX_GRAPH:END -->";

const UML_MARKER_PAIRS = [
  {
    start: "<!-- UML:components:START -->",
    end: "<!-- UML:components:END -->",
  },
  {
    start: "<!-- UML:components-table:START -->",
    end: "<!-- UML:components-table:END -->",
  },
  {
    start: "<!-- UML:component-details:START -->",
    end: "<!-- UML:component-details:END -->",
  },
];

function parseArgs(argv) {
  const args = argv.slice(2);
  let excludeComponents = undefined;
  let quiet = false;
  let debug = false;
  let help = false;
  const positionals = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--quiet" || arg === "-q") {
      quiet = true;
    } else if (arg === "--debug" || arg === "-d") {
      debug = true;
    } else if (arg === "--exclude-components") {
      const next = args[i + 1];
      if (next === undefined || next.startsWith("-")) {
        console.error("ERROR: --exclude-components requires a value");
        process.exit(1);
      }
      excludeComponents = next;
      i++;
    } else if (arg.startsWith("-")) {
      console.error(`ERROR: Unknown option: ${arg}`);
      process.exit(1);
    } else {
      positionals.push(arg);
    }
  }

  let subcommand = "update";
  let filePath = undefined;

  if (positionals.length > 0 && SUBCOMMANDS.has(positionals[0])) {
    subcommand = positionals[0];
    filePath = positionals.length > 1 ? positionals[1] : undefined;
  } else if (positionals.length > 0) {
    filePath = positionals[0];
  }

  return { subcommand, filePath, excludeComponents, quiet, debug, help };
}

function dbg(enabled, message) {
  if (enabled) process.stderr.write(`[autogen] ${message}\n`);
}

function checkMalformedMarkers(content, filePath) {
  const pairs = [
    { start: TOC_START, end: TOC_END },
    { start: NX_GRAPH_START, end: NX_GRAPH_END },
    ...UML_MARKER_PAIRS,
  ];

  for (const { start, end } of pairs) {
    if (content.includes(start) && !content.includes(end)) {
      console.error(
        `ERROR: "${start}" found without matching "${end}" in ${filePath}`
      );
      process.exit(1);
    }
  }
}

function spawnPlugin(bin, args) {
  const result = spawnSync("node", [bin, ...args], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function main() {
  const {
    subcommand,
    filePath: rawFilePath,
    excludeComponents,
    quiet,
    debug,
    help,
  } = parseArgs(process.argv);

  if (help) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const resolvedFilePath = rawFilePath
    ? path.resolve(rawFilePath)
    : path.resolve(process.cwd(), "README.md");

  if (!fs.existsSync(resolvedFilePath)) {
    console.error(`ERROR: File not found: ${resolvedFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolvedFilePath, "utf-8");
  const fileDir = path.dirname(resolvedFilePath);

  checkMalformedMarkers(content, resolvedFilePath);

  const hasTocMarkers = content.includes(TOC_START);
  const hasNxMarkers = content.includes(NX_GRAPH_START);
  const hasUmlMarkers = UML_MARKER_PAIRS.some(({ start }) =>
    content.includes(start)
  );

  if (!hasTocMarkers && !hasNxMarkers && !hasUmlMarkers) {
    if (!quiet) {
      process.stderr.write(
        `WARNING: ${resolvedFilePath} contains no recognized markers (TOC:START, UML:*, NX_GRAPH:START). Nothing to do.\n`
      );
    }
    process.exit(0);
  }

  const isCheck = subcommand === "check";
  const commonFlags = [
    ...(isCheck ? ["--check"] : []),
    ...(quiet ? ["--quiet"] : []),
    ...(debug ? ["--debug"] : []),
  ];

  // Mermaid — only when NX_GRAPH markers present
  if (hasNxMarkers) {
    const projectJsonPath = path.join(fileDir, "project.json");
    if (!fs.existsSync(projectJsonPath)) {
      console.error(
        `ERROR: NX_GRAPH markers found in ${resolvedFilePath} but no project.json exists in ${fileDir}`
      );
      process.exit(1);
    }
    dbg(debug, "NX_GRAPH markers detected — activating nx-graph-to-mermaid");

    const result = await runExecutor({
      projectJsonPath,
      mode: isCheck ? "check" : "update",
      markdownPath: resolvedFilePath,
      debug,
    });

    if (!result.success) {
      process.exit(1);
    }
  } else {
    dbg(debug, "no NX_GRAPH markers — skipping nx-graph-to-mermaid");
  }

  // UML — only when UML markers present. Runs before TOC so that any
  // headings UML injects (e.g. component names) are present in the file
  // by the time TOC scans for headings, avoiding a second convergence pass.
  if (hasUmlMarkers) {
    dbg(debug, "UML markers detected — activating update-markdown-uml");
    const umlBin = require.resolve(
      "@datalackey/update-markdown-uml/bin/update-markdown-uml.js"
    );
    const excludeArgs = excludeComponents
      ? ["--exclude-components", excludeComponents]
      : [];
    spawnPlugin(umlBin, [...commonFlags, ...excludeArgs, resolvedFilePath]);
  } else {
    dbg(debug, "no UML markers — skipping update-markdown-uml");
  }

  // TOC — always invoked
  dbg(debug, "activating update-markdown-toc");
  const tocBin = require.resolve(
    "@datalackey/update-markdown-toc/bin/update-markdown-toc.js"
  );
  spawnPlugin(tocBin, [...commonFlags, resolvedFilePath]);

  if (!quiet && !isCheck) {
    console.log("autogen-markdown-doc: update complete");
  }
}

main();
