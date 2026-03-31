import { describe, test, expect, vi, afterEach } from "vitest";

// vi.mock is hoisted by vitest — must appear before imports that use the mock.
// FAIL until Step 5: afterRun does not exist on descriptor yet.
vi.mock("@datalackey/tooling-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@datalackey/tooling-core")>();
  return {
    ...actual,
    runLinkValidation: vi.fn().mockResolvedValue(undefined),
  };
});

import { runLinkValidation } from "@datalackey/tooling-core";
import { descriptor } from "../../src/cli/descriptor.js";

// TocRunConfig does not exist until Step 3.
// Defined locally here so tests can be written now.
// Replace with import of TocRunConfig in Step 3.
interface StubTocRunConfig {
  runMode: "update" | "check";
  mode: "single" | "recursive";
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
  exclude: string[];
  validateExternalLinks: boolean;
  linkTimeoutMs: number;
  validateExternalLinksLocal: boolean;
  linkTimeoutMsLocal: number;
}

function makeCheckConfig(
  overrides: Partial<StubTocRunConfig> = {}
): StubTocRunConfig {
  return {
    runMode: "check",
    mode: "single",
    verbose: false,
    quiet: false,
    debug: false,
    exclude: [],
    validateExternalLinks: false, // forced false — tooling-core call must be no-op
    linkTimeoutMs: 3000,
    validateExternalLinksLocal: true,
    linkTimeoutMsLocal: 3000,
    ...overrides,
  };
}

function makeUpdateConfig(
  overrides: Partial<StubTocRunConfig> = {}
): StubTocRunConfig {
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

  test("afterRun passes validateExternalLinksLocal as validateExternalLinks", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig({ validateExternalLinksLocal: false });

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledWith(
      files,
      expect.objectContaining({ validateExternalLinks: false })
    );
  });

  test("afterRun passes linkTimeoutMsLocal as linkTimeoutMs", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig({ linkTimeoutMsLocal: 9999 });

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledWith(
      files,
      expect.objectContaining({ linkTimeoutMs: 9999 })
    );
  });

  test("validateExternalLinks is false in standard config from parseOptions", () => {
    const standard = {
      runMode: "check" as const,
      mode: "single" as const,
      verbose: false,
      quiet: false,
      debug: false,
      exclude: [],
      validateExternalLinks: true,
      linkTimeoutMs: 3000,
    };

    const result = descriptor.parseOptions!(standard, new Map());

    expect(result.validateExternalLinks).toBe(false);
  });

  test("runLinkValidation is called exactly once per check-mode run", async () => {
    const files = ["/some/file.md"];
    const config = makeCheckConfig();

    await (descriptor as any).afterRun(files, config);

    expect(vi.mocked(runLinkValidation)).toHaveBeenCalledTimes(1);
  });
});
