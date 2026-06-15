import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("@datalackey/tooling-core", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@datalackey/tooling-core")
  >();
  return {
    ...actual,
    runLinkValidation: vi.fn().mockResolvedValue(undefined),
  };
});

import { runLinkValidation } from "@datalackey/tooling-core";
import { descriptor } from "../../src/cli/descriptor.js";
import type { TocRunConfig } from "../../src/cli/TocRunConfig.js";

function makeCheckConfig(overrides: Partial<TocRunConfig> = {}): TocRunConfig {
  return {
    runMode: "check",
    mode: "single",
    verbose: false,
    quiet: false,
    debug: false,
    exclude: [],
    validateExternalLinks: true,
    linkTimeoutMs: 3000,
    ...overrides,
  };
}

function makeUpdateConfig(overrides: Partial<TocRunConfig> = {}): TocRunConfig {
  return { ...makeCheckConfig(), runMode: "update", ...overrides };
}

describe("toc descriptor afterRun", () => {
  afterEach(() => {
    vi.mocked(runLinkValidation).mockClear();
  });

  test("afterRun is defined on the toc descriptor", () => {
    expect((descriptor as any).afterRun).toBeDefined();
  });

  test("afterRun calls runLinkValidation in check mode", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig();

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledOnce();
  });

  test("afterRun does not call runLinkValidation in update mode", async () => {
    const files = ["/some/file.md"];
    const config = makeUpdateConfig();

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).not.toHaveBeenCalled();
  });

  test("afterRun passes validateExternalLinks as validateExternalLinks", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig({ validateExternalLinks: false });

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledWith(
      files,
      expect.objectContaining({ validateExternalLinks: false })
    );
  });

  test("afterRun passes linkTimeoutMs as linkTimeoutMs", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig({ linkTimeoutMs: 9999 });

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledWith(
      files,
      expect.objectContaining({ linkTimeoutMs: 9999 })
    );
  });

  test("runLinkValidation is called exactly once per check-mode run", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig();

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledTimes(1);
  });
});
