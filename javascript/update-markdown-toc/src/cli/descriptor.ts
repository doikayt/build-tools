import type { RunConfig } from "@datalackey/tooling-core";
import type { PluginDescriptor } from "@datalackey/tooling-core";
import {
  parseBooleanOption,
  parseNumberOption,
} from "@datalackey/tooling-core";

const DEFAULT_LINK_TIMEOUT_MS = 3000;

export const descriptor: PluginDescriptor<RunConfig> = {
  name: "update-markdown-toc",
  description: "Auto-generate Table of Contents for Markdown files",
  options: [
    {
      flag: "--no-external-link-check",
      description: "Skip external link validation in check mode",
    },
    {
      flag: "-n",
      description: "Skip external link validation in check mode (short form)",
    },
    {
      flag: "--link-timeout-ms",
      description:
        "Timeout in milliseconds for external link requests (default: 3000)",
      requiresValue: true,
      valueName: "ms",
    },
    {
      flag: "-l",
      description:
        "Timeout in milliseconds for external link requests (short form)",
      requiresValue: true,
      valueName: "ms",
    },
  ],
  parseOptions(
    standard: RunConfig,
    passthrough: Map<string, string | boolean>
  ): RunConfig {
    const noExternalCheck =
      parseBooleanOption("--no-external-link-check", passthrough) ||
      parseBooleanOption("-n", passthrough);

    const timeoutMs =
      parseNumberOption("--link-timeout-ms", passthrough) ??
      parseNumberOption("-l", passthrough) ??
      DEFAULT_LINK_TIMEOUT_MS;

    return {
      ...standard,
      validateExternalLinks: noExternalCheck
        ? false
        : standard.validateExternalLinks,
      linkTimeoutMs: timeoutMs,
    };
  },
};