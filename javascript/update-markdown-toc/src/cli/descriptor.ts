import type { RunConfig, PluginDescriptor } from "@doikayt/tooling-core";
import { runLinkValidation } from "@doikayt/tooling-core";

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
