import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runLinkValidation } from "../../src/index.js";
import type { RunConfig } from "../../src/index.js";

const baseConfig: RunConfig = {
  runMode: "check",
  mode: "single",
  verbose: false,
  quiet: false,
  debug: false,
  exclude: [],
  validateExternalLinks: false,
  linkTimeoutMs: 3000,
};

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "run-link-validation-"));
  process.exitCode = undefined;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.unstubAllGlobals();
  process.exitCode = undefined;
});

function writeFile(name: string, content: string): string {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("runLinkValidation()", () => {
  test("does nothing for empty file list", async () => {
    await runLinkValidation([], baseConfig);
    expect(process.exitCode).toBeUndefined();
  });

  test("no errors for file with no links", async () => {
    const file = writeFile("no-links.md", "# Title\n\nJust text.\n");
    await runLinkValidation([file], baseConfig);
    expect(process.exitCode).toBeUndefined();
  });

  test("no errors for file with valid fragment link", async () => {
    const file = writeFile("valid-fragment.md", "# Title\n\n[link](#title)\n");
    await runLinkValidation([file], baseConfig);
    expect(process.exitCode).toBeUndefined();
  });

  test("sets exitCode 1 for broken fragment link", async () => {
    const file = writeFile(
      "broken-fragment.md",
      "# Title\n\n[link](#nonexistent)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], baseConfig);
    expect(process.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent")
    );
    consoleSpy.mockRestore();
  });

  test("sets exitCode 1 for broken relative file link", async () => {
    const file = writeFile(
      "broken-relative.md",
      "# Title\n\n[link](./missing.md)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], baseConfig);
    expect(process.exitCode).toBe(1);
    consoleSpy.mockRestore();
  });

  test("does not check external links when validateExternalLinks is false", async () => {
    const file = writeFile(
      "external.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: false,
    });
    expect(process.exitCode).toBeUndefined();
  });

  test("checks external links when validateExternalLinks is true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 404 }));
    const file = writeFile(
      "external.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: true,
    });
    expect(process.exitCode).toBe(1);
    consoleSpy.mockRestore();
  });

  test("prints warning for 301 redirect", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 301 }));
    const file = writeFile(
      "redirect.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: true,
    });
    expect(process.exitCode).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("⚠"));
    consoleSpy.mockRestore();
  });

  test("processes multiple files and reports all errors", async () => {
    const file1 = writeFile("a.md", "# A\n\n[link](#nonexistent)\n");
    const file2 = writeFile("b.md", "# B\n\n[link](./missing.md)\n");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file1, file2], baseConfig);
    expect(process.exitCode).toBe(1);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });

  test("prints verbose messages when verbose is true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
    const file = writeFile(
      "verbose.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: true,
      verbose: true,
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✓"));
    consoleSpy.mockRestore();
  });

  test("does not print verbose messages when verbose is false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
    const file = writeFile(
      "non-verbose.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: true,
      verbose: false,
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("does not print warnings when quiet is true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 301 }));
    const file = writeFile(
      "quiet-warning.md",
      "# Title\n\n[link](https://example.com)\n"
    );
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runLinkValidation([file], {
      ...baseConfig,
      validateExternalLinks: true,
      quiet: true,
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
