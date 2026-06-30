#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { debugLog } from "@datalackey/tooling-core";

const require = createRequire(import.meta.url);

const HELP = `Usage: autogen-markdown-doc [subcommand] [file] [options]

Subcommands:
  update   (default)  Apply all tag transformations in-place
  check               Validate all active plugins (NX → UML → TOC); reports all drift in one pass (no writes)

Positional:
  file                Target Markdown file  (default: README.md in cwd)

Options:
  --exclude-components <pkg1,pkg2>  Forwarded to UML generation only
                                  (leaf directory names under src/ to skip)
  -q, --quiet                     Suppress all non-error output,
                                  including the "no markers" warning
  -d, --debug                     Print debug diagnostics to stderr
  -h, --help                      Show this help message and exit (exit 0)
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

// Fail-fast: used in update mode where plugins chain writes (NX → UML → TOC).
function spawnPlugin(scriptPath, args) {
  const result = spawnSync("node", [scriptPath, ...args], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Non-terminating: used in check mode so all plugins run and all drift is reported.
function trySpawnPlugin(scriptPath, args) {
  const result = spawnSync("node", [scriptPath, ...args], { stdio: "inherit" });
  return (result.status ?? 1) === 0;
}

function main() {
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

  // Build the ordered list of active plugins (NX → UML → TOC).
  // Each plugin is only included when its markers are present in the file.
  const plugins = [];

  if (hasNxMarkers) {
    const projectJsonPath = path.join(fileDir, "project.json");
    if (!fs.existsSync(projectJsonPath)) {
      console.error(
        `ERROR: NX_GRAPH markers found in ${resolvedFilePath} but no project.json exists in ${fileDir}`
      );
      process.exit(1);
    }
    debugLog(
      { debug },
      "NX_GRAPH markers detected — activating nx-graph-to-mermaid"
    );
    plugins.push({
      scriptPath: require.resolve(
        "@datalackey/nx-graph-to-mermaid/bin/nx-graph-to-mermaid.js"
      ),
      args: [...commonFlags, resolvedFilePath],
    });
  } else {
    debugLog({ debug }, "no NX_GRAPH markers — skipping nx-graph-to-mermaid");
  }

  // UML runs before TOC so that component headings it injects are present
  // by the time TOC scans the file — convergence in a single update pass.
  if (hasUmlMarkers) {
    debugLog(
      { debug },
      "UML markers detected — activating update-markdown-uml"
    );
    const excludeArgs = excludeComponents
      ? ["--exclude-components", excludeComponents]
      : [];
    plugins.push({
      scriptPath: require.resolve(
        "@datalackey/update-markdown-uml/bin/update-markdown-uml.js"
      ),
      args: [...commonFlags, ...excludeArgs, resolvedFilePath],
    });
  } else {
    debugLog({ debug }, "no UML markers — skipping update-markdown-uml");
  }

  if (hasTocMarkers) {
    debugLog(
      { debug },
      "TOC markers detected — activating update-markdown-toc"
    );
    plugins.push({
      scriptPath: require.resolve(
        "@datalackey/update-markdown-toc/bin/update-markdown-toc.js"
      ),
      args: [...commonFlags, resolvedFilePath],
    });
  } else {
    debugLog({ debug }, "no TOC markers — skipping update-markdown-toc");
  }

  if (isCheck) {
    // Check mode: run every active plugin so the user sees all drift in one
    // pass rather than having to re-run after fixing each plugin in turn.
    let allPassed = true;
    for (const { scriptPath, args } of plugins) {
      if (!trySpawnPlugin(scriptPath, args)) allPassed = false;
    }
    if (!allPassed) process.exit(1);
  } else {
    // Update mode: fail-fast. Plugins chain their writes (NX → UML → TOC),
    // so each must succeed before the next reads the updated file.
    for (const { scriptPath, args } of plugins) {
      spawnPlugin(scriptPath, args);
    }
  }
}

main();
