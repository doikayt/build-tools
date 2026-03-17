import { describe, test, expect, vi, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { validateUmlConfig } from "../../src/cli/validateUmlConfig.js"
import type { UmlRunConfig } from "../../src/cli/UmlRunConfig.js"

function makeConfig(overrides: Partial<UmlRunConfig> = {}): UmlRunConfig {
  return {
    runMode: "update",
    mode: "single",
    verbose: false,
    quiet: false,
    debug: false,
    exclude: [],
    validateExternalLinks: false,
    linkTimeoutMs: 3000,
    excludePackages: [],
    sourceRoot: undefined,
    ...overrides
  }
}

function makeTmpSourceRoot(dirNames: string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "uml-validate-"))
  for (const name of dirNames) {
    fs.mkdirSync(path.join(root, name))
  }
  return root
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("validateUmlConfig()", () => {

  test("no warning when excludePackages is empty", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli", "repository"])

    validateUmlConfig(makeConfig({
      excludePackages: [],
      sourceRoot: tmpRoot
    }))

    expect(spy).not.toHaveBeenCalled()
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test("no warning when all excluded packages exist in source root", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli", "repository", "policy"])

    validateUmlConfig(makeConfig({
      excludePackages: ["cli", "policy"],
      sourceRoot: tmpRoot
    }))

    expect(spy).not.toHaveBeenCalled()
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test("warns when excluded package not found in source root", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli", "repository"])

    validateUmlConfig(makeConfig({
      excludePackages: ["nonexistent"],
      sourceRoot: tmpRoot
    }))

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent")
    )
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test("warns once per missing package", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli"])

    validateUmlConfig(makeConfig({
      excludePackages: ["missing-a", "missing-b"],
      sourceRoot: tmpRoot
    }))

    expect(spy).toHaveBeenCalledTimes(2)
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test("suppresses warning when quiet is true", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli"])

    validateUmlConfig(makeConfig({
      excludePackages: ["nonexistent"],
      sourceRoot: tmpRoot,
      quiet: true
    }))

    expect(spy).not.toHaveBeenCalled()
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  test("no warning when source root does not exist", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})

    validateUmlConfig(makeConfig({
      excludePackages: ["cli"],
      sourceRoot: "/definitely/does/not/exist"
    }))

    expect(spy).not.toHaveBeenCalled()
  })

  test("warning message includes source root path", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const tmpRoot = makeTmpSourceRoot(["cli"])

    validateUmlConfig(makeConfig({
      excludePackages: ["nonexistent"],
      sourceRoot: tmpRoot
    }))

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(tmpRoot)
    )
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

})
