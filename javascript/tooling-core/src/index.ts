export { runPlugin } from "./cli/runPlugin.js";
export {
  parseStandardCli,
  buildPassthroughMap,
  buildConfig,
  parseStringOption,
  parseBooleanOption,
  parseNumberOption,
} from "./cli/parseStandardCli.js";
export { listFilesToProcess } from "./cli/listFilesToProcess.js";

export type {
  ProcessingStatus,
  FileProcessor,
  RunConfig,
} from "./repository/types.js";

export type {
  ParsedCliResult,
  PluginDescriptor,
  PluginOption,
  RunMode,
} from "./cli/types.js";

export { walkFiles } from "./util/walkFiles.js"; // TODO - only need for mermaid.. can remove when that plugin uses more of tooling core
export { injectBetweenMarkers } from "./markdown/injectBetweenMarkers.js";
export { findMarker, findMarkers } from "./markdown/findMarker.js";
export type { MarkerLocation } from "./markdown/findMarker.js";
export { createTransformProcessor } from "./repository/createTransformProcessor.js";

export type { RunnerPolicy, RunnerDecision } from "./policy/RunnerPolicy.js";
export { createRunnerPolicy } from "./policy/createRunnerPolicy.js";

export { generateHelp } from "./cli/generateHelp.js";
export { printHelp } from "./cli/printHelp.js";
export { runCli } from "./cli/runCli.js";
export type { RunCliOptions } from "./cli/runCli.js";

export { extractLinks } from "./markdown/extractLinks.js";
export { parseHeadings } from "./markdown/parseHeadings.js";
export type {
  LinkKind,
  LinkRecord,
  HeadingRecord,
  LinkValidationError,
  LinkValidationWarning,
  LinkValidationResult,
  LinkValidationOptions,
  ExternalLinkStatus,
} from "./markdown/types.js";
export { slugHeading } from "./markdown/slugHeading.js";
export { validateFragmentLink } from "./markdown/validateFragmentLink.js";
export { validateRelativeLink } from "./markdown/validateRelativeLink.js";
export { validateExternalLink } from "./markdown/validateExternalLink.js";
export { validateMarkdownLinks } from "./markdown/validateMarkdownLinks.js";
export { debugLog } from "./util/debugLog.js";
export { runLinkValidation } from "./cli/runLinkValidation.js";
export type { RepositoryStats } from "./repository/RepositoryRunner.js";
export { runWithConcurrency } from "./util/concurrency.js";
