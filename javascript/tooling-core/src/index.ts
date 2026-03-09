export { runPlugin } from "./cli/runPlugin.js";
export { parseStandardCli } from "./cli/parseStandardCli.js";
export { listFilesToProcess } from "./cli/listFilesToProcess.js";

export type {
    ProcessingStatus,
    FileProcessor,
    OutputPolicyConfig
} from "./repository/types.js";

export type { StandardCliConfig } from "./cli/types.js";


export { walkFiles } from './fs/walkFiles.js';      // TODO - only need for mermaid.. can remove when that plugin uses more of tooling core
export { createTransformProcessor } from "./repository/createTransformProcessor.js";

export type { RunnerPolicy, RunnerDecision } from "./policy/RunnerPolicy.js";
export { createRunnerPolicy } from "./runner/createRunnerPolicy.js";

export type { PluginDescriptor, PluginOption } from "./cli/PluginDescriptor.js";
export { validatePassthrough } from "./cli/validatePassthrough.js";

export { generateHelp } from "./cli/generateHelp.js";
export { printHelp } from "./cli/printHelp.js";