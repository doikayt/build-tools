// tooling-core/tests/cli/generateHelp.test.ts

import { generateHelp } from "../../src/cli/generateHelp.js"
import type { PluginDescriptor } from "../../src/cli/PluginDescriptor.js"

const descriptor: PluginDescriptor = {
    name: "my-plugin",
    description: "Does useful things",
    options: [
        { flag: "--output", description: "Output path", requiresValue: true },
        { flag: "--dry-run", description: "Do not write files" }
    ]
}

test("includes plugin name", () => {
    expect(generateHelp(descriptor)).toContain("my-plugin")
})

test("includes plugin description", () => {
    expect(generateHelp(descriptor)).toContain("Does useful things")
})

test("includes declared option flags", () => {
    const help = generateHelp(descriptor)
    expect(help).toContain("--output")
    expect(help).toContain("--dry-run")
})

test("includes option descriptions", () => {
    const help = generateHelp(descriptor)
    expect(help).toContain("Output path")
    expect(help).toContain("Do not write files")
})

test("includes standard options", () => {
    const help = generateHelp(descriptor)
    expect(help).toContain("--recursive")
    expect(help).toContain("--check")
    expect(help).toContain("--verbose")
    expect(help).toContain("--quiet")
})

test("returns a string", () => {
    expect(typeof generateHelp(descriptor)).toBe("string")
})