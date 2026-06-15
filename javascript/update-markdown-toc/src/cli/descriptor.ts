import type { RunConfig, PluginDescriptor } from "@datalackey/tooling-core";
import { runLinkValidation } from "@datalackey/tooling-core";

export const descriptor: PluginDescriptor = {
  name: "update-markdown-toc",
  description: "Auto-generate Table of Contents for Markdown files",
  options: [],
  async afterRun(
    this: void,
    files: string[],
    config: RunConfig
  ): Promise<void> {
    if (config.runMode !== "check") {
      return;
    }
    await runLinkValidation(files, config);
  },
};
