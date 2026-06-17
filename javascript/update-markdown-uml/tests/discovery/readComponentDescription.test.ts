import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { readComponentDescription } from "../../src/discovery/readComponentDescription.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pkg-desc-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(content: string): void {
  fs.writeFileSync(path.join(tmpDir, "_COMPONENT_INFO.md"), content, "utf-8");
}

describe("readComponentDescription()", () => {
  test("no _COMPONENT_INFO.md returns undefined", () => {
    const result = readComponentDescription(tmpDir);
    expect(result).toBeUndefined();
  });

  test("empty file returns undefined without warning", () => {
    write("");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = readComponentDescription(tmpDir);
    expect(result).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  test("content with no period returns undefined and warns", () => {
    write("CLI parsing and option wiring");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = readComponentDescription(tmpDir);
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("_COMPONENT_INFO.md")
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("period"));
    warnSpy.mockRestore();
  });

  test("onWarn callback used instead of console.warn when provided", () => {
    write("CLI parsing and option wiring");
    const warnings: string[] = [];
    const result = readComponentDescription(tmpDir, (msg) =>
      warnings.push(msg)
    );
    expect(result).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("period");
  });

  test("first sentence returned when period present", () => {
    write("CLI parsing and option wiring. More detail here.");
    const result = readComponentDescription(tmpDir);
    expect(result).toBe("CLI parsing and option wiring");
  });

  test("sentence spanning multiple lines is collapsed", () => {
    write("CLI parsing\nand option wiring. More detail.");
    const result = readComponentDescription(tmpDir);
    expect(result).toBe("CLI parsing and option wiring");
  });

  test("leading and trailing whitespace trimmed", () => {
    write("  CLI parsing and option wiring.  ");
    const result = readComponentDescription(tmpDir);
    expect(result).toBe("CLI parsing and option wiring");
  });

  test("only period with no preceding text returns undefined", () => {
    write(". something after");
    const result = readComponentDescription(tmpDir);
    expect(result).toBeUndefined();
  });

  test("period inside inline code span is not treated as sentence end", () => {
    write(
      "Leaf component discovery: locates subdirectories that contain qualifying `.ts` files, and reads their `_COMPONENT_INFO.md` descriptions."
    );
    const result = readComponentDescription(tmpDir);
    expect(result).toBe(
      "Leaf component discovery: locates subdirectories that contain qualifying `.ts` files, and reads their `_COMPONENT_INFO.md` descriptions"
    );
  });

  test("warning includes file path", () => {
    write("no period here");
    const warnings: string[] = [];
    readComponentDescription(tmpDir, (msg) => warnings.push(msg));
    expect(warnings[0]).toContain(tmpDir);
  });
});
